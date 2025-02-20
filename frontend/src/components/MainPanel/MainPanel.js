import React, { useRef, useEffect } from 'react';
import AnalysisSection from './AnalysisSection';
import ChatContainer from '../Chat/ChatContainer';
import ChatInput from '../ChatInput';
import ArticleResults from './ArticleResults';

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
  currentArticleData,
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
  
  const finalAnalysisRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!isLoadingAnalysis && finalAnalysisRef.current) {
      finalAnalysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isLoadingAnalysis]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  return (
    <main className={`flex-1 flex flex-col min-h-0 pl-12 pt-10 pb-0 transition-all duration-500 ease-in-out relative
      ${hasDocumentMessages || currentProgress ? 'ml-24 w-[calc(100%-96px)]' : 'ml-[40%]'}`}>
      <div className="flex flex-col min-h-0 overflow-auto">
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
            currentProgress={currentProgress}
            currentArticleData={currentArticleData}
            articles={articles}
            finalAnalysisRef={finalAnalysisRef}
            messageEndRef={messageEndRef}
          />
      </div>
      {/* Only show ChatInput after analysis is complete */}
      {chatHistory.some(msg => msg.analysis) && (
        <div className="sticky bottom-0 w-full">
              <div className="absolute inset-x-0 bg-gradient-to-t from-gray-50 via-gray-50/50 to-transparent h-8 -top-8 pointer-events-none" />
          <ChatInput 
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            handleGenerateSampleCase={handleGenerateSampleCase}
            isLoading={isLoadingDocs || isLoadingAnalysis || isGeneratingSample}
          />
        </div>
      )}
    </main>
  );
};

export default MainPanel;
