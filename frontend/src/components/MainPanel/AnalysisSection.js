import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';

const fadeInClass = "transition-opacity duration-1000 ease-in-out";

const AnalysisSection = ({
  extractedDisease,
  extractedEvents,
  isRetrieving,
  handleRetrieve,
  isBox3Hovered,
  setIsBox3Hovered,
  isPromptExpanded = false,
  setIsPromptExpanded,
  promptContent,
  setPromptContent,
  currentProgress,
  numArticles,
  setNumArticles,
  hasDocumentMessages,
  articles,
  className,
  isLoadingChatHistory,
  isProcessingArticles
}) => {
  const [isRetrievalComplete, setIsRetrievalComplete] = useState(false);
  const [showProcessingMessage, setShowProcessingMessage] = useState(false);

  useEffect(() => {
    if (hasDocumentMessages) {
      setIsRetrievalComplete(true);
      setShowProcessingMessage(false);
    } else if (!isLoadingChatHistory && !isRetrieving && !isProcessingArticles) {
      if (articles && articles.length > 0) {
        setIsRetrievalComplete(true);
        setShowProcessingMessage(true);
      } else {
        setIsRetrievalComplete(false);
        setShowProcessingMessage(false);
      }
    }
  }, [isRetrieving, articles, isLoadingChatHistory, isProcessingArticles, hasDocumentMessages]);

  return (
    <div 
      className={`w-1/2 bg-surface-50 shadow-lg rounded-lg p-4 mb-4 ${fadeInClass} ${className} ${(!extractedDisease || !extractedEvents.length) ? 'opacity-25' : ''}`}
      onMouseEnter={() => extractedDisease && extractedEvents.length && setIsBox3Hovered(true)}
      onMouseLeave={() => setIsBox3Hovered(false)}
    >
      <div className="mb-1 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2 flex items-center justify-center">
            {hasDocumentMessages ? (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (isRetrieving || isProcessingArticles) ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : isRetrievalComplete ? (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : null}
          </div>
          <h2 className="text-xs font-medium text-gray-700">
            {hasDocumentMessages ? "Articles retrieved and analyzed" :
             isLoadingChatHistory ? "Loading chat history..." :
             showProcessingMessage ? "Currently processing:" : 
             "Sending instructions for paper retrieval"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isPromptExpanded && (
          <button
            onClick={handleRetrieve}
            disabled={isRetrieving || isProcessingArticles || !extractedDisease || !extractedEvents.length}
            className={`text-xs px-3 py-1 bg-surface-700 text-white rounded hover:bg-surface-600 focus:outline-none focus:ring-2 focus:ring-surface-500 focus:ring-offset-2 ${
              (isRetrieving || isProcessingArticles || !extractedDisease || !extractedEvents.length) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isRetrieving || isProcessingArticles ? <LoadingSpinner /> : 'Re-fetch'}
          </button>
          )}
          <button 
            onClick={() => setIsPromptExpanded(!isPromptExpanded)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isPromptExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {isPromptExpanded && (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <label className="text-[10px] font-light text-gray-700 w-20 pt-1.5">Analysis instructions</label>
            <textarea
              className="flex-1 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs h-[9rem]"
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder="Enter prompt content here..."
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-light text-gray-700 w-20"># of articles</label>
            <input
              type="number"
              min="1"
              max="50"
              className="w-20 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs"
              value={numArticles}
              onChange={(e) => setNumArticles(Math.min(50, Math.max(1, parseInt(e.target.value) || 15)))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisSection;
