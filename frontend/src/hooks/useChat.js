import { useState, useCallback, useEffect } from 'react';
import { handleSendMessage } from './chat/messageHandlers';
import { initializeActiveChat, initializeNewChat, handleChatSelect } from './chat/chatState';
import { deleteChat } from '../firebase';

const useChat = (user, selectedTemplate) => {
  // Use authenticated user ID (regular or anonymous)
  const userId = user?.uid;
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [hasDocumentMessages, setHasDocumentMessages] = useState(false);

  const handleInitializeActiveChat = useCallback(async (caseNotes, labResults, extractedDisease, extractedEvents) => {
    // If there's an active temporary chat, delete it first
    if (!user && activeChat) {
      try {
        await deleteChat(userId, activeChat.id);
      } catch (error) {
        console.error('Error deleting temporary chat:', error);
      }
    }

    return initializeActiveChat({
      user: { uid: userId },
      caseNotes,
      labResults,
      extractedDisease,
      extractedEvents,
      setActiveChat,
      setChatHistory
    });
  }, [user, userId, activeChat]);

  const handleInitializeNewChat = useCallback(() => {
    initializeNewChat({
      setActiveChat,
      setChatHistory
    });
  }, []);

  const handleChatSelection = useCallback(async (chat) => {
    await handleChatSelect({
      chat,
      setActiveChat,
      setHasDocumentMessages,
      setChatHistory,
      initializeNewChat: handleInitializeNewChat,
      userId
    });
  }, [handleInitializeNewChat, userId]);

  const handleMessageSend = useCallback(async (e) => {
    await handleSendMessage({
      e,
      message,
      setMessage,
      user: { uid: userId },
      activeChat,
      setActiveChat,
      setChatHistory,
      isLoadingDocs,
      setIsLoadingDocs,
      isLoadingAnalysis,
      setIsLoadingAnalysis,
      selectedTemplate,
      userId
    });
  }, [message, isLoadingDocs, isLoadingAnalysis, activeChat, user, selectedTemplate]);

  return {
    chatHistory,
    isLoadingDocs,
    isLoadingAnalysis,
    activeChat,
    message,
    setMessage,
    handleChatSelect: handleChatSelection,
    handleSendMessage: handleMessageSend,
    initializeNewChat: handleInitializeNewChat,
    initializeActiveChat: handleInitializeActiveChat,
    hasDocumentMessages
  };
};

export default useChat;
