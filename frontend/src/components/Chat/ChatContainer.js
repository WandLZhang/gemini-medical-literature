// src/components/Chat/ChatContainer.js
import React from 'react';
import ChatMessage from '../ChatMessage';
import DocumentList from '../DocumentList';
import MarkdownRenderer from '../MarkdownRenderer';
import ReactMarkdown from 'react-markdown';
import ArticleResults from '../MainPanel/ArticleResults';

const LoadingSpinner = ({ message }) => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2">{message}</span>
  </div>
);

const ChatContainer = ({ 
  chatHistory, 
  isGeneratingSample, 
  isLoadingDocs, 
  isLoadingAnalysis 
}) => {
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
                {/* Show regular messages */}
                {!msg.analysis && !msg.type && <ChatMessage message={msg} />}
                
                {/* Show document type messages (article table) */}
                {msg.type === 'document' && (
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
                    <div className="text-lg font-semibold text-gray-700 mb-4">
                      Final analysis complete.
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
                      <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-h1:text-lg prose-h2:text-base prose-p:text-sm prose-p:text-gray-600 prose-li:text-sm prose-li:text-gray-600 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown>{msg.analysis}</ReactMarkdown>
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
          <LoadingSpinner message="Analyzing documents..." />
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
