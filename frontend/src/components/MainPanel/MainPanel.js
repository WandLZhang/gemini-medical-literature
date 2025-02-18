import React from 'react';
import AnalysisSection from './AnalysisSection';
import ChatContainer from '../Chat/ChatContainer';
import ChatInput from '../ChatInput';

const MainPanel = ({
  extractedDisease,
  extractedEvents,
  isRetrieving,
  handleRetrieve,
  isBox3Hovered,
  setIsBox3Hovered,
  isPromptExpanded,
  setIsPromptExpanded,
  promptContent,
  setPromptContent,
  currentProgress,
  numArticles,
  setNumArticles,
  articles,
  chatHistory,
  isGeneratingSample,
  isLoadingDocs,
  isLoadingAnalysis,
  message,
  setMessage,
  handleSendMessage,
  handleGenerateSampleCase
}) => {
  // Create a document message for article results if we have progress or articles
  const chatHistoryWithArticles = [...chatHistory];
  if (currentProgress || articles.length > 0) {
    chatHistoryWithArticles.push({
      id: 'article-results',
      type: 'document',
      isUser: false,
      currentProgress,
      articles
    });
  }

  return (
    <main className={`flex-1 flex flex-col min-h-0 pl-12 pt-10 transition-all duration-500 ease-in-out
      ${currentProgress ? 'ml-24 w-[calc(100%-96px)]' : 'ml-[40%]'}`}>
      <AnalysisSection
        extractedDisease={extractedDisease}
        extractedEvents={extractedEvents}
        isRetrieving={isRetrieving}
        handleRetrieve={handleRetrieve}
        isBox3Hovered={isBox3Hovered}
        setIsBox3Hovered={setIsBox3Hovered}
        isPromptExpanded={isPromptExpanded}
        setIsPromptExpanded={setIsPromptExpanded}
        promptContent={promptContent}
        setPromptContent={setPromptContent}
        currentProgress={currentProgress}
        numArticles={numArticles}
        setNumArticles={setNumArticles}
      />
      <ChatContainer 
        chatHistory={chatHistoryWithArticles}
        isGeneratingSample={isGeneratingSample}
        isLoadingDocs={isLoadingDocs}
        isLoadingAnalysis={isLoadingAnalysis}
      />
      <ChatInput 
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        handleGenerateSampleCase={handleGenerateSampleCase}
        isLoading={isLoadingDocs || isLoadingAnalysis || isGeneratingSample}
      />
    </main>
  );
};

export default MainPanel;
