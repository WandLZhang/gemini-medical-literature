import { createNewChat, addMessageToChat } from '../../firebase';
import { retrieveAndAnalyzeArticles, streamChat } from '../../utils/api';
import { getLatestMessages } from './utils';

export const createMessageId = (type) => `${Date.now()}-${type}-${Math.random().toString(36).substr(2, 9)}`;

export const handleSendMessage = ({
  e,
  message,
  setMessage,
  user,
  activeChat,
  setActiveChat,
  setChatHistory,
  isLoadingDocs,
  setIsLoadingDocs,
  isLoadingAnalysis,
  setIsLoadingAnalysis,
  selectedTemplate
}) => {
  // Handle both event objects and direct message objects
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  
  // If e is a message object with type 'analysis' or 'document', update the existing conversation
  if (typeof e === 'object' && (e.type === 'analysis' || e.type === 'document')) {
    return handleAnalysisOrDocumentMessage({
      e,
      user,
      activeChat,
      setActiveChat,
      setChatHistory,
      setIsLoadingAnalysis
    });
  }

  // Handle regular user messages
  const userMessage = typeof e === 'object' && e.content ? e.content : message;
  
  if ((typeof e === 'object' && e.content) || (message.trim() && !isLoadingDocs && !isLoadingAnalysis)) {
    setMessage('');
    return handleUserMessage({
      userMessage,
      user,
      activeChat,
      setActiveChat,
      setChatHistory,
      setIsLoadingDocs,
      setIsLoadingAnalysis,
      selectedTemplate
    });
  }
};

const handleAnalysisOrDocumentMessage = async ({
  e,
  user,
  activeChat,
  setActiveChat,
  setChatHistory,
  setIsLoadingAnalysis
}) => {
  try {
    let currentChatId = activeChat?.id;
    let messagesForFirestore = [...(activeChat?.messages || [])];

    if (user && !currentChatId) {
      const initialMessages = [];
      currentChatId = await createNewChat(user.uid, initialMessages);
      setActiveChat({ id: currentChatId, messages: initialMessages });
    }

    if (e.type === 'document' || e.type === 'analysis') {
      if (e.type === 'analysis' && e.content?.isLoading) {
        setIsLoadingAnalysis(true);
        return;
      }
      
      const latestMessages = await getLatestMessages(user.uid, currentChatId);
      const timestamp = new Date();
      const messageId = createMessageId(e.type);
      
      const newMessage = createMessage(e, messageId, timestamp);
      const firestoreMessage = createFirestoreMessage(e, messageId, timestamp);

      if (e.type === 'analysis' && !e.content?.isLoading) {
        setIsLoadingAnalysis(false);
      }

      setChatHistory(prev => [...prev, newMessage]);

      if (user) {
        latestMessages.push(firestoreMessage);
        await addMessageToChat(user.uid, currentChatId, latestMessages);
        setActiveChat(current => ({
          ...current,
          messages: latestMessages
        }));
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
};

const handleUserMessage = async ({
  userMessage,
  user,
  activeChat,
  setActiveChat,
  setChatHistory,
  setIsLoadingDocs,
  setIsLoadingAnalysis,
  selectedTemplate
}) => {
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
      const newUserMessage = {
        content: userMessage,
        role: 'user',
        timestamp: new Date(),
        type: 'message',
        messageId: createMessageId('user')
      };
      messagesForFirestore.push(newUserMessage);
    }

    const newMessage = { 
      id: createMessageId('user'),
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, newMessage]);

    if (user) {
      await addMessageToChat(user.uid, currentChatId, messagesForFirestore);
    }

    // Create assistant message placeholder for streaming
    const assistantMessageId = createMessageId('assistant');
    const assistantMessage = {
      id: assistantMessageId,
      text: '',
      isUser: false,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, assistantMessage]);

    // If this is a document analysis request, proceed with article analysis
    if (userMessage.toLowerCase().includes('analyze') || userMessage.toLowerCase().includes('research')) {
      setIsLoadingDocs(true);
      try {
        await retrieveAndAnalyzeArticles(
          userMessage,
          [],  // events array
          selectedTemplate?.content || "",
          async (data) => {
            if (data.type === 'analysis') {
              await handleAnalysisData(data, user, currentChatId, setChatHistory, setActiveChat, setIsLoadingAnalysis);
            } else if (data.type === 'pmids') {
              await handlePmidsData(data, user, currentChatId, setChatHistory, setActiveChat, setIsLoadingAnalysis);
            }
          }
        );
      } catch (error) {
        await handleAnalysisError(error, user, currentChatId, setChatHistory, setIsLoadingDocs, setIsLoadingAnalysis, messagesForFirestore);
      }
      setIsLoadingDocs(false);
    } else {
      // Stream the response
      console.log('CHAT_HANDLER_DEBUG: Starting to stream response');
      let accumulatedText = '';
      
      await streamChat(
        userMessage,
        user.uid,
        currentChatId,
        (chunk) => {
          console.log('CHAT_HANDLER_DEBUG: Received chunk:', chunk);
          accumulatedText += chunk;
          setChatHistory(prev => {
            const newHistory = [...prev];
            const assistantMessageIndex = newHistory.findIndex(msg => msg.id === assistantMessageId);
            if (assistantMessageIndex !== -1) {
              console.log('CHAT_HANDLER_DEBUG: Current message state:', newHistory[assistantMessageIndex]);
              newHistory[assistantMessageIndex] = {
                ...newHistory[assistantMessageIndex],
                text: accumulatedText
              };
              console.log('CHAT_HANDLER_DEBUG: Updated message state:', newHistory[assistantMessageIndex]);
            } else {
              console.log('CHAT_HANDLER_DEBUG: Could not find message with id:', assistantMessageId);
            }
            return newHistory;
          });
        }
      );
      console.log('CHAT_HANDLER_DEBUG: Finished streaming response');

      // Update Firestore with the complete message
      if (user && accumulatedText) {
        const finalAssistantMessage = {
          content: accumulatedText,
          role: 'assistant',
          timestamp: new Date(),
          type: 'message',
          messageId: assistantMessageId
        };
        messagesForFirestore.push(finalAssistantMessage);
        await addMessageToChat(user.uid, currentChatId, messagesForFirestore);
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
};

const createMessage = (e, messageId, timestamp) => {
  if (e.type === 'document') {
    return {
      id: messageId,
      type: 'document',
      isUser: false,
      currentProgress: e.content.currentProgress,
      articles: e.content.articles,
      timestamp
    };
  }
  return {
    id: messageId,
    isUser: false,
    analysis: e.content,
    timestamp
  };
};

const createFirestoreMessage = (e, messageId, timestamp) => ({
  content: e.type === 'document' ? JSON.stringify(e.content) : e.content,
  role: 'assistant',
  timestamp,
  type: e.type,
  messageId
});

const handleAnalysisData = async (data, user, currentChatId, setChatHistory, setActiveChat, setIsLoadingAnalysis) => {
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
    
    const latestMessages = await getLatestMessages(user.uid, currentChatId);
    latestMessages.push(firestoreMessage);
    await addMessageToChat(user.uid, currentChatId, latestMessages);
    
    setActiveChat(current => ({
      ...current,
      messages: latestMessages
    }));
  }

  setChatHistory(prev => {
    const updated = [...prev, analysisMessage];
    setIsLoadingAnalysis(false);
    return updated;
  });
};

const handlePmidsData = async (data, user, currentChatId, setChatHistory, setActiveChat, setIsLoadingAnalysis) => {
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
    
    const latestMessages = await getLatestMessages(user.uid, currentChatId);
    latestMessages.push(firestoreMessage);
    await addMessageToChat(user.uid, currentChatId, latestMessages);
    
    setActiveChat(current => ({
      ...current,
      messages: latestMessages
    }));
  }

  setChatHistory(prev => {
    const updated = [...prev, docsMessage];
    return updated;
  });
};

const handleAnalysisError = async (error, user, currentChatId, setChatHistory, setIsLoadingDocs, setIsLoadingAnalysis, messagesForFirestore) => {
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
};
