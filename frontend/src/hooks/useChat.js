// src/hooks/useChat.js
import { useState, useCallback } from 'react';
import { createNewChat, addMessageToChat } from '../firebase';
import { retrieveAndAnalyzeArticles } from '../utils/api';

const createMessageId = (type) => `${Date.now()}-${type}-${Math.random().toString(36).substr(2, 9)}`;

const useChat = (user, selectedTemplate) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');

  const initializeActiveChat = useCallback(async (caseNotes, labResults, extractedDisease, extractedEvents) => {
    if (!user) return;

    try {
      const timestamp = new Date();
      const messageId = createMessageId('initial');
      
      // Create the initial message that contains all the case information
      const initialMessage = {
        content: JSON.stringify({
          caseNotes,
          labResults,
          extractedDisease,
          extractedEvents
        }),
        role: 'user',
        timestamp,
        type: 'initial_case',
        messageId
      };

      // Create a new chat with the initial message
      const chatId = await createNewChat(user.uid, [initialMessage]);
      
      // Set the active chat
      setActiveChat({
        id: chatId,
        messages: [initialMessage]
      });

      // Update chat history
      setChatHistory([{
        id: messageId,
        text: `Case initialized with disease: ${extractedDisease}`,
        isUser: false,
        timestamp,
        initialCase: {
          caseNotes,
          labResults,
          extractedDisease,
          extractedEvents
        }
      }]);

      return chatId;
    } catch (error) {
      console.error('Error initializing active chat:', error);
      throw error;
    }
  }, [user]);

  const initializeNewChat = useCallback(() => {
    setActiveChat(null);
    setChatHistory([]);
  }, []);

  const handleChatSelect = useCallback(async (chat) => {
    if (chat) {
      setActiveChat(chat);
      
      const messages = [];
      
      // Load all messages in chronological order
      chat.messages?.forEach(msg => {
        switch (msg.type) {
          case 'initial_case':
            const initialCase = JSON.parse(msg.content);
            messages.push({
              id: msg.messageId,
              text: `Case initialized with disease: ${initialCase.extractedDisease}`,
              isUser: false,
              timestamp: msg.timestamp,
              initialCase
            });
            break;
            
          case 'message':
            messages.push({
              id: msg.messageId,
              text: msg.content,
              isUser: msg.role === 'user',
              timestamp: msg.timestamp
            });
            break;
            
          case 'document':
            const docContent = JSON.parse(msg.content);
            messages.push({
              id: msg.messageId,
              type: 'document',
              isUser: false,
              currentProgress: docContent.currentProgress,
              articles: docContent.articles,
              timestamp: msg.timestamp
            });
            break;
            
          case 'analysis':
            messages.push({
              id: msg.messageId,
              isUser: false,
              analysis: msg.content,
              timestamp: msg.timestamp
            });
            break;
            
          case 'error':
            messages.push({
              id: msg.messageId,
              text: msg.content,
              isUser: false,
              error: msg.error,
              timestamp: msg.timestamp
            });
            break;
        }
      });

      // Sort messages by timestamp if needed
      messages.sort((a, b) => a.timestamp - b.timestamp);
      
      setChatHistory(messages);
    } else {
      await initializeNewChat();
    }
  }, [initializeNewChat]);

const handleSendMessage = useCallback(async (e) => {
  // Handle both event objects and direct message objects
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  
  // If e is a message object with type 'analysis' or 'document', update the existing conversation
  if (typeof e === 'object' && (e.type === 'analysis' || e.type === 'document')) {
    try {
      let currentChatId = activeChat?.id;
      let messagesForFirestore = [...(activeChat?.messages || [])];

      if (user && !currentChatId) {
        const initialMessages = [];
        currentChatId = await createNewChat(user.uid, initialMessages);
        setActiveChat({ id: currentChatId, messages: initialMessages });
      }

      // For document type or analysis, update the existing chat history and Firestore
      if (e.type === 'document' || e.type === 'analysis') {
        const timestamp = new Date();
        const messageId = createMessageId(e.type);
        
        // Create the message for chat history
        const newMessage = e.type === 'document' ? {
          id: messageId,
          type: 'document',
          isUser: false,
          currentProgress: e.content.currentProgress,
          articles: e.content.articles,
          timestamp
        } : {
          id: messageId,
          isUser: false,
          analysis: e.content,
          timestamp
        };

        // Create the message for Firestore
        const firestoreMessage = {
          content: e.type === 'document' ? JSON.stringify(e.content) : e.content,
          role: 'assistant',
          timestamp,
          type: e.type,
          messageId
        };

        // Update chat history
        if (e.type === 'document') {
          setChatHistory(prev => {
            const lastDocumentIndex = prev.findIndex(msg => msg.type === 'document');
            if (lastDocumentIndex !== -1) {
              const updatedHistory = [...prev];
              updatedHistory[lastDocumentIndex] = newMessage;
              return updatedHistory;
            }
            return [...prev, newMessage];
          });
        } else {
          setChatHistory(prev => [...prev, newMessage]);
        }

        // Update Firestore if user is logged in
        if (user) {
          if (e.type === 'document') {
            const existingDocIndex = messagesForFirestore.findIndex(msg => msg.type === 'document');
            if (existingDocIndex !== -1) {
              messagesForFirestore[existingDocIndex] = firestoreMessage;
            } else {
              messagesForFirestore.push(firestoreMessage);
            }
          } else {
            messagesForFirestore.push(firestoreMessage);
          }

          // Set the messages array in activeChat to keep it in sync
          setActiveChat(current => ({
            ...current,
            messages: messagesForFirestore
          }));

          // Update Firestore with the complete messages array
          await addMessageToChat(user.uid, currentChatId, messagesForFirestore);
        }
      }

      return;
    } catch (error) {
      console.error('Error handling message:', error);
      return;
    }
  }

  // Handle regular user messages
  const userMessage = typeof e === 'object' && e.content ? e.content : message;
  
  if ((typeof e === 'object' && e.content) || (message.trim() && !isLoadingDocs && !isLoadingAnalysis)) {
    setMessage('');

    const newUserMessage = { 
      id: createMessageId('user'), 
      text: userMessage, 
      isUser: true,
      timestamp: new Date()
    };
      
    try {
      let currentChatId = activeChat?.id;
      let messagesForFirestore = [];
        
      if (user) {
        if (!currentChatId) {
          const initialMessages = [];
          currentChatId = await createNewChat(user.uid, initialMessages);
          setActiveChat({ id: currentChatId, messages: initialMessages });
        }

        messagesForFirestore = [...(activeChat?.messages || [])];
        messagesForFirestore.push({
          content: userMessage,
          role: 'user',
          timestamp: new Date(),
          type: 'message',
          messageId: newUserMessage.id
        });
      }
      
      setChatHistory(prev => [...prev, newUserMessage]);
      
      if (user) {
        await addMessageToChat(user.uid, currentChatId, messagesForFirestore);
      }

        setIsLoadingDocs(true);
        try {
          await retrieveAndAnalyzeArticles(
            userMessage,
            [],  // events array
            selectedTemplate?.content || "",
            (data) => {
              if (data.type === 'analysis') {
                const analysisMessage = {
                  id: createMessageId('analysis'),
                  isUser: false,
                  analysis: data.data.analysis,
                  timestamp: new Date()
                };

                if (user) {
                  messagesForFirestore.push({
                    content: data.data.analysis,
                    role: 'assistant',
                    timestamp: new Date(),
                    type: 'analysis',
                    messageId: analysisMessage.id
                  });
                }

                setChatHistory(prev => [...prev, analysisMessage]);
              } else if (data.type === 'pmids') {
                const docsMessage = {
                  id: createMessageId('assistant-docs'),
                  text: "I've found relevant articles and am analyzing them...",
                  isUser: false,
                  documents: {
                    pmids: data.data.pmids || []
                  },
                  timestamp: new Date()
                };

                if (user) {
                  messagesForFirestore.push({
                    content: JSON.stringify(docsMessage.documents),
                    role: 'assistant',
                    timestamp: new Date(),
                    type: 'documents',
                    messageId: docsMessage.id
                  });
                }

                setChatHistory(prev => [...prev, docsMessage]);
              }

              if (user) {
                addMessageToChat(user.uid, currentChatId, messagesForFirestore).catch(console.error);
              }
            }
          );
          setIsLoadingDocs(false);
          setIsLoadingAnalysis(false);
        } catch (error) {
          console.error('Error processing request:', error);
          const errorMessage = {
            id: createMessageId('error'),
            text: "I'm sorry, there was an error processing your request. Please try again.",
            isUser: false,
            timestamp: new Date(),
            error: error.message
          };
          
          if (user) {
            messagesForFirestore.push({
              content: errorMessage.text,
              role: 'assistant',
              timestamp: new Date(),
              type: 'error',
              messageId: errorMessage.id
            });
          }
          
          setIsLoadingDocs(false);
          setIsLoadingAnalysis(false);
          setChatHistory(prev => [...prev, errorMessage]);
          
          if (user) {
            await addMessageToChat(user.uid, currentChatId, messagesForFirestore);
          }
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    }
  }, [message, isLoadingDocs, isLoadingAnalysis, activeChat, user, selectedTemplate]);

  return {
    chatHistory,
    isLoadingDocs,
    isLoadingAnalysis,
    activeChat,
    message,
    setMessage,
    handleChatSelect: user ? handleChatSelect : null,
    handleSendMessage,
    initializeNewChat: user ? initializeNewChat : null,
    initializeActiveChat: user ? initializeActiveChat : null
  };
};

export default useChat;
