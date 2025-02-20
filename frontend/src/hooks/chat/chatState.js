import { createNewChat } from '../../firebase';
import { createMessageId } from './messageHandlers';
import { getLatestMessages } from './utils';

export const initializeActiveChat = async ({
  user,
  caseNotes,
  labResults,
  extractedDisease,
  extractedEvents,
  setActiveChat,
  setChatHistory
}) => {
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
};

export const initializeNewChat = ({
  setActiveChat,
  setChatHistory
}) => {
  setActiveChat(null);
  setChatHistory([]);
};

export const handleChatSelect = async ({
  chat,
  setActiveChat,
  setHasDocumentMessages,
  setChatHistory,
  initializeNewChat
}) => {
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
    initializeNewChat();
  }
};
