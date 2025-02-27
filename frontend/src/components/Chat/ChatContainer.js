// src/components/Chat/ChatContainer.js
import React from 'react';
import ChatMessage from '../ChatMessage';
import DocumentList from '../DocumentList';
import MarkdownRenderer from '../MarkdownRenderer';
import ReactMarkdown from 'react-markdown';
import ArticleResults from '../MainPanel/ArticleResults';

const LoadingSpinner = ({ message }) => {
  console.log('LOADING_DEBUG: LoadingSpinner rendered with message:', message);
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-surface-700"></div>
      <span className="ml-2 text-sm text-gray-600">{message}</span>
    </div>
  );
};

const ChatContainer = ({ 
  chatHistory, 
  isGeneratingSample, 
  isLoadingDocs, 
  isLoadingAnalysis,
  currentProgress,
  currentArticleData,
  articles,
  finalAnalysisRef,
  messageEndRef
}) => {
  // Add detailed logging for chat initialization debugging
  console.log('[CHAT_DEBUG] ChatContainer render with chatHistory length:', chatHistory.length);
  console.log('[CHAT_DEBUG] Full chatHistory details:', chatHistory.map(msg => ({
    id: msg.id,
    type: msg.type,
    hasAnalysis: !!msg.analysis,
    hasInitialCase: !!msg.initialCase,
    extractedDisease: msg.initialCase?.extractedDisease,
    text: msg.text,
    timestamp: msg.timestamp
  })));

  // Add useEffect for tracking chatHistory changes
  React.useEffect(() => {
    console.log('[CHAT_DEBUG] chatHistory changed:', {
      length: chatHistory.length,
      hasInitMessage: chatHistory.some(msg => msg.initialCase),
      messages: chatHistory.map(msg => ({
        id: msg.id,
        type: msg.type,
        text: msg.text,
        hasInitialCase: !!msg.initialCase
      }))
    });
  }, [chatHistory]);
  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      <div className="max-w-[95%] space-y-6 px-4">
        {/* Chat messages with their associated documents and analysis */}
        <div className="space-y-4">
          {chatHistory.map((msg, index) => {
            // Find the next analysis message that follows this message
            const nextAnalysis = chatHistory.slice(index + 1).find(m => m.analysis);
            // Find if there's a document message after this one
            const nextDocument = chatHistory.slice(index + 1).find(m => m.type === 'document');
            
            return (
              <React.Fragment key={msg.id}>
                {/* Show regular messages and streamed messages */}
                {/* Add logging for message rendering conditions */}
                {console.log('[CHAT_DEBUG] Evaluating message:', {
                  id: msg.id,
                  hasAnalysis: !!msg.analysis,
                  hasType: !!msg.type,
                  hasText: msg.text !== undefined,
                  hasInitialCase: !!msg.initialCase,
                  extractedDisease: msg.initialCase?.extractedDisease
                })}
                {((!msg.analysis && !msg.type) || (msg.text !== undefined)) && (
                  <>
                    <ChatMessage message={msg} />
                    {/* Show progress and incremental updates after case initialization */}
                    {msg.initialCase?.extractedDisease && currentProgress && !chatHistory.find(m => m.type === 'document') && (
                      <div className="ml-4 mt-2">
                        <div className="text-sm text-gray-600 mb-2">Currently analyzing:</div>
                        <div className="text-xs flex items-center gap-2 mb-1">
                          <span className="text-gray-600">{currentProgress}</span>
                        </div>
                        <div style={{ maxWidth: '400px' }}>
                          <div className="bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                            <div
                              className="bg-surface-700 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(() => {
                                const match = currentProgress?.match(/Processed article (\d+) out of (\d+)/);
                                if (!match) return 0;
                                const [_, current, total] = match;
                                return (parseInt(current) / parseInt(total)) * 100;
                              })()}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Show incremental table updates */}
                        <ArticleResults 
                          articles={articles}
                        />
                      </div>
                    )}
                  </>
                )}
                
                {/* Show document type messages (article table) */}
                {msg.type === 'document' && (
                  console.log('[CHAT_DEBUG] Rendering ArticleResults with:', {
                    id: msg.id,
                    type: msg.type,
                    hasArticles: !!msg.articles?.length,
                    currentProgress: msg.currentProgress,
                    timestamp: msg.timestamp
                  }),
                  <div className="ml-4 mt-2">
                    <ArticleResults 
                      currentProgress={msg.currentProgress}
                      articles={msg.articles}
                    />
                  </div>
                )}

                {/* Show analysis messages */}
                {msg.analysis && (
                  <div className="ml-4 mt-2">
                    <div ref={finalAnalysisRef} className="bg-white rounded-lg shadow-md p-8">
                      <h2 className="text-2xl font-bold mb-6 text-gray-900">Analysis Results</h2>
                      <div className="space-y-8">
                        <MarkdownRenderer content={msg.analysis} />
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Loading states */}
        {isGeneratingSample && (
          <LoadingSpinner message="Generating example case..." />
        )}

        {isLoadingDocs && (
          <LoadingSpinner message="Retrieving documents..." />
        )}

        {isLoadingAnalysis && (
          <div className="ml-4 mt-2">
            <LoadingSpinner message="Preparing final analysis..." />
          </div>
        )}
      </div>
      {/* Invisible element that serves as scroll target */}
      <div ref={messageEndRef} />
    </div>
  );
};

export default ChatContainer;
