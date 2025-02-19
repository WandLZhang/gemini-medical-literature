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
  handleGenerateSampleCase,
  hasDocumentMessages
}) => {
  React.useEffect(() => {
    console.log('LOADING_DEBUG: MainPanel isLoadingAnalysis changed to:', isLoadingAnalysis);
  }, [isLoadingAnalysis]);

  console.log('LOADING_DEBUG: MainPanel render, isLoadingAnalysis:', isLoadingAnalysis);

  return (
    <main className={`flex-1 flex flex-col min-h-0 pl-12 pt-10 transition-all duration-500 ease-in-out
      ${hasDocumentMessages || currentProgress ? 'ml-24 w-[calc(100%-96px)]' : 'ml-[40%]'}`}>
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
        hasDocumentMessages={hasDocumentMessages}
      />
      <ChatContainer 
        chatHistory={chatHistory}
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
