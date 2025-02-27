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
  const finalAnalysisRef = useRef(null);
  const messageEndRef = useRef(null);

  // Handle scrolling based on message type
  useEffect(() => {
    console.log('[SCROLL_DEBUG] useEffect triggered');
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      console.log('[SCROLL_DEBUG] Last message:', lastMessage);
      if (lastMessage.analysis !== undefined && finalAnalysisRef.current) {
        console.log('[SCROLL_DEBUG] Scrolling to analysis');
        finalAnalysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (lastMessage.text !== undefined && messageEndRef.current) {
        console.log('[SCROLL_DEBUG] Scrolling to bottom for user/assistant message');
        messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.log('[SCROLL_DEBUG] No scroll action taken');
      }
    } else {
      console.log('[SCROLL_DEBUG] Chat history is empty');
    }
  }, [chatHistory]);

  return (
    <main className={`flex-1 flex flex-col min-h-0 pl-12 pt-10 pb-8 transition-all duration-500 ease-in-out relative
      ${hasDocumentMessages || currentProgress ? 'ml-24 w-[calc(100%-96px)]' : 'ml-[40%]'}`}>
      <div className="flex flex-col min-h-0 overflow-auto pb-24">
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
            showArticleResults={true}
            initialArticleResultsExpanded={false}
            totalArticles={numArticles}
            processedArticles={articles.length}
          />
      </div>
      {/* Only show ChatInput after analysis is complete */}
      {chatHistory.some(msg => msg.analysis) && (
        <div className="fixed bottom-16 left-0 right-0 px-4">
          <div className="absolute inset-x-0 bg-gradient-to-t from-gray-50 via-gray-50/50 to-transparent h-24 -top-20 pointer-events-none" />
          <div className="relative z-10 max-w-[70%] mx-auto">
            <ChatInput 
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              handleGenerateSampleCase={handleGenerateSampleCase}
              isLoading={isLoadingDocs || isLoadingAnalysis || isGeneratingSample}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default MainPanel;
