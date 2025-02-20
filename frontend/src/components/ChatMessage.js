// src/components/ChatMessage.js

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import ArticleResults from './MainPanel/ArticleResults';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message }) => {
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);

  const isError = message.text && message.text.includes("I'm sorry, there was an error");
  const isDocument = message.type === 'document';
  const isAnalysis = !message.isUser && message.analysis;

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : ''} mb-4`}>
      <div 
        className={`${isDocument || (!message.isUser && message.text?.includes('TYPE OF CANCER')) ? 'w-full' : 'max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl'} rounded-lg p-3 ${message.isUser ? 'ml-auto' : ''} ${
          isError 
            ? 'bg-red-50 border border-red-200 text-red-800'
            : message.isUser 
              ? 'bg-primary-600 text-white' 
              : 'bg-surface-100 text-surface-800'
        }`}
      >
        {message.isUser ? null : (
          <div className="font-bold mb-1 flex items-center gap-2">
            {isError && <AlertCircle className="h-4 w-4" />}
            Assistant
          </div>
        )}
        <div className="text-sm overflow-x-auto">
          {(() => {
            if (isDocument) {
              return (
                <ArticleResults 
                  currentProgress={message.currentProgress}
                  articles={message.articles}
                />
              );
            }
            if (isAnalysis) {
              return (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-h1:text-lg prose-h2:text-base prose-p:text-sm prose-p:text-gray-600 prose-li:text-sm prose-li:text-gray-600 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                  <ReactMarkdown>{message.analysis}</ReactMarkdown>
                </div>
              );
            }
            if (message.text) {
              return (
                <>
                  <div className="overflow-x-auto">
                    {message.text}
                  </div>
                  {isError && !isErrorExpanded && (
                    <button 
                      onClick={() => setIsErrorExpanded(true)}
                      className="ml-2 text-red-600 hover:text-red-800 underline text-sm"
                    >
                      Show Details
                    </button>
                  )}
                  {isError && isErrorExpanded && (
                    <div className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded">
                      Error Details:
                      <pre className="mt-1 whitespace-pre-wrap">
                        {message.error || "No additional error details available"}
                      </pre>
                      <button 
                        onClick={() => setIsErrorExpanded(false)}
                        className="mt-2 text-red-600 hover:text-red-800 underline"
                      >
                        Hide Details
                      </button>
                    </div>
                  )}
                </>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
