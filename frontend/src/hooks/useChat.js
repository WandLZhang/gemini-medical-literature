// src/hooks/useChat.js
import { useState, useCallback } from 'react';
import { createNewChat, addMessageToChat } from '../firebase';
import { retrieveAndAnalyzeArticles } from '../utils/api';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const createMessageId = (type) => `${Date.now()}-${type}-${Math.random().toString(36).substr(2, 9)}`;

const useChat = (user, selectedTemplate) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [hasDocumentMessages, setHasDocumentMessages] = useState(false);

  // Function to get latest messages from Firestore
  const getLatestMessages = async (userId, chatId) => {
    try {
      const chatRef = doc(db, `chats/${userId}/conversations/${chatId}`);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        return chatDoc.data().messages || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting latest messages:', error);
      return [];
    }
  };

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
      setHasDocumentMessages(false);
      
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
            setHasDocumentMessages(true);
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
        console.log(`${e.type} message handling - Start`);
        
        // Handle analysis loading state
        if (e.type === 'analysis' && e.content?.isLoading) {
          console.log('LOADING_DEBUG: Setting isLoadingAnalysis to true from loading message');
          setIsLoadingAnalysis(true);
          return;
        }
        
        // Get latest messages from Firestore
        const latestMessages = await getLatestMessages(user.uid, currentChatId);
        console.log('Current messages in Firestore:', JSON.stringify(latestMessages, null, 2));
        
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

        // If this is a real analysis message (not a loading state), set loading to false
        if (e.type === 'analysis' && !e.content?.isLoading) {
          console.log('LOADING_DEBUG: Setting isLoadingAnalysis to false after receiving analysis');
          setIsLoadingAnalysis(false);
        }

        // Create the message for Firestore
        const firestoreMessage = {
          content: e.type === 'document' ? JSON.stringify(e.content) : e.content,
          role: 'assistant',
          timestamp,
          type: e.type,
          messageId
        };

        console.log(`${e.type} message to add:`, JSON.stringify(firestoreMessage, null, 2));

        // Always add new messages to chat history
        setChatHistory(prev => {
          console.log('useChat - chatHistory before adding new message:', 
            prev.map(msg => ({
              id: msg.id,
              type: msg.type,
              hasAnalysis: !!msg.analysis,
              timestamp: msg.timestamp
            }))
          );
          const updated = [...prev, newMessage];
          console.log('useChat - chatHistory after adding new message:', 
            updated.map(msg => ({
              id: msg.id,
              type: msg.type,
              hasAnalysis: !!msg.analysis,
              timestamp: msg.timestamp
            }))
          );
          return updated;
        });

        // Update Firestore if user is logged in
        if (user) {
          console.log(`${e.type} - Before push:`, JSON.stringify(latestMessages, null, 2));
          
          // Add new message to latest messages
          latestMessages.push(firestoreMessage);
          
          console.log(`${e.type} - After push:`, JSON.stringify(latestMessages, null, 2));

          // Update Firestore with the complete messages array
          await addMessageToChat(user.uid, currentChatId, latestMessages);
          
          console.log(`${e.type} - After Firestore update:`, JSON.stringify(latestMessages, null, 2));

          // Update activeChat state with the latest messages
          setActiveChat(current => ({
            ...current,
            messages: latestMessages
          }));
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
          // Log current state before starting callbacks
          console.log('Current activeChat state before callbacks:', JSON.stringify(activeChat, null, 2));
          
          console.log('LOADING_DEBUG: Calling API now...');
          await retrieveAndAnalyzeArticles(
            userMessage,
            [],  // events array
            selectedTemplate?.content || "",
            async (data) => {
              if (data.type === 'analysis') {
                const timestamp = new Date();
                const messageId = createMessageId('analysis');
                
                const analysisMessage = {
                  id: messageId,
                  isUser: false,
                  analysis: data.data.analysis,
                  timestamp
                };

                if (user) {
                  const firestoreMessage = {
                    content: data.data.analysis,
                    role: 'assistant',
                    timestamp,
                    type: 'analysis',
                    messageId
                  };
                  
                  // Get latest messages from Firestore
                  const latestMessages = await getLatestMessages(user.uid, currentChatId);
                  console.log('Analysis - Latest messages from Firestore:', JSON.stringify(latestMessages, null, 2));
                  
                  // Add new message to latest messages
                  latestMessages.push(firestoreMessage);
                  
                  console.log('Analysis - After push:', JSON.stringify(latestMessages, null, 2));
                  
                  // Update Firestore with the updated message array
                  await addMessageToChat(user.uid, currentChatId, latestMessages);
                  
                  console.log('Analysis - After Firestore update:', JSON.stringify(latestMessages, null, 2));
                  
                  // Update activeChat state with the latest messages
                  setActiveChat(current => ({
                    ...current,
                    messages: latestMessages
                  }));
                }

                setChatHistory(prev => {
                  const updated = [...prev, analysisMessage];
                  console.log('LOADING_DEBUG: Setting isLoadingAnalysis to false after analysis message added');
                  setIsLoadingAnalysis(false);
                  return updated;
                });
              } else if (data.type === 'pmids') {
                console.log('LOADING_DEBUG: Setting isLoadingAnalysis to true for final analysis');
                setIsLoadingAnalysis(true);
                const timestamp = new Date();
                const messageId = createMessageId('document');
                
                const docsMessage = {
                  id: messageId,
                  type: 'document',
                  isUser: false,
                  currentProgress: "I've found relevant articles and am analyzing them...",
                  articles: [],
                  timestamp
                };

                if (user) {
                  const firestoreMessage = {
                    content: JSON.stringify(docsMessage),
                    role: 'assistant',
                    timestamp,
                    type: 'document',
                    messageId
                  };
                  
                  // Get latest messages from Firestore
                  const latestMessages = await getLatestMessages(user.uid, currentChatId);
                  console.log('Document - Latest messages from Firestore:', JSON.stringify(latestMessages, null, 2));
                  
                  // Add new message to latest messages
                  latestMessages.push(firestoreMessage);
                  
                  console.log('Document - After push:', JSON.stringify(latestMessages, null, 2));
                  
                  // Update Firestore with the updated message array
                  await addMessageToChat(user.uid, currentChatId, latestMessages);
                  
                  console.log('Document - After Firestore update:', JSON.stringify(latestMessages, null, 2));
                  
                  // Update activeChat state with the latest messages
                  setActiveChat(current => ({
                    ...current,
                    messages: latestMessages
                  }));
                }

                setChatHistory(prev => {
                  console.log('useChat - chatHistory before adding document message:', 
                    prev.map(msg => ({
                      id: msg.id,
                      type: msg.type,
                      hasAnalysis: !!msg.analysis,
                      timestamp: msg.timestamp
                    }))
                  );
                  const updated = [...prev, docsMessage];
                  console.log('useChat - chatHistory after adding document message:', 
                    updated.map(msg => ({
                      id: msg.id,
                      type: msg.type,
                      hasAnalysis: !!msg.analysis,
                      timestamp: msg.timestamp
                    }))
                  );
                  return updated;
                });
              }
            }
          );
          setIsLoadingDocs(false);
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
          console.log('LOADING_DEBUG: Setting isLoadingAnalysis to false in error handler');
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
    initializeActiveChat: user ? initializeActiveChat : null,
    hasDocumentMessages
  };
};

export default useChat;
