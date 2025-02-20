import { useState, useCallback } from 'react';
import { handleSendMessage } from './chat/messageHandlers';
import { initializeActiveChat, initializeNewChat, handleChatSelect } from './chat/chatState';

const useChat = (user, selectedTemplate) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [hasDocumentMessages, setHasDocumentMessages] = useState(false);

  const handleInitializeActiveChat = useCallback(async (caseNotes, labResults, extractedDisease, extractedEvents) => {
    if (!user) return;
    return initializeActiveChat({
      user,
      caseNotes,
      labResults,
      extractedDisease,
      extractedEvents,
      setActiveChat,
      setChatHistory
    });
  }, [user]);

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
      initializeNewChat: handleInitializeNewChat
    });
  }, [handleInitializeNewChat]);

  const handleMessageSend = useCallback(async (e) => {
    await handleSendMessage({
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
    });
  }, [message, isLoadingDocs, isLoadingAnalysis, activeChat, user, selectedTemplate]);

  return {
    chatHistory,
    isLoadingDocs,
    isLoadingAnalysis,
    activeChat,
    message,
    setMessage,
    handleChatSelect: user ? handleChatSelection : null,
    handleSendMessage: handleMessageSend,
    initializeNewChat: user ? handleInitializeNewChat : null,
    initializeActiveChat: user ? handleInitializeActiveChat : null,
    hasDocumentMessages
  };
};

export default useChat;
