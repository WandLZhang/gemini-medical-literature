// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// src/components/Chat/ChatContainer.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ChatMessage from '../ChatMessage';
import DocumentList from '../DocumentList';
import MarkdownRenderer from '../MarkdownRenderer';
import ReactMarkdown from 'react-markdown';
import ArticleResults from '../MainPanel/ArticleResults';
import ExtractionSection from '../MainPanel/ExtractionSection';
import AnalysisSection from '../MainPanel/AnalysisSection';
import ChatInput from '../ChatInput';
import CopyButton from '../CopyButton';
import PrintButton from '../PrintButton';

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
  messageEndRef,
  showArticleResults,
  initialArticleResultsExpanded,
  totalArticles,
  processedArticles,
  extractedDisease,
  extractedEvents,
  setExtractedDisease,
  setExtractedEvents,
  isRetrieving,
  handleRetrieve,
  isBox3Hovered,
  setIsBox3Hovered,
  isPromptExpanded,
  setIsPromptExpanded,
  promptContent,
  setPromptContent,
  numArticles,
  setNumArticles,
  chatInputHeight,
  shouldUseScrollEffect,
  message,
  setMessage,
  handleSendMessage,
  handleGenerateSampleCase,
  isLoading,
  showInitialCase,
  onExtractionComplete,
  isLoadingFromHistory,
  isProcessingArticles,
  setIsProcessingArticles,
  hasDocumentMessages
}) => {
  const [showExtractionSection, setShowExtractionSection] = useState(false);
  const [showAnalysisSection, setShowAnalysisSection] = useState(false);
  const containerRef = useRef(null);
  const analysisRef = useRef(null);
  const lastMessageRef = useRef(null);

  const lastMessage = useMemo(() => chatHistory[chatHistory.length - 1], [chatHistory]);
  const hasAnalysis = useMemo(() => chatHistory.some(msg => msg.analysis), [chatHistory]);

  useEffect(() => {
    if (shouldUseScrollEffect) {
      console.log('[ANALYSIS_LOAD] Applying scroll effect');
      if (lastMessage && lastMessage.analysis && analysisRef.current) {
        console.log('[ANALYSIS_LOAD] Scrolling to top of analysis');
        analysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (containerRef.current) {
        console.log('[ANALYSIS_LOAD] Scrolling to bottom');
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      // Reset the flag after scrolling
      shouldUseScrollEffect = false;
    }
  }, [shouldUseScrollEffect, lastMessage, chatHistory]);

  useEffect(() => {
    console.log('[ANALYSIS_LOAD] chatHistory length:', chatHistory.length);
    console.log('[ANALYSIS_LOAD] Last message in chatHistory:', chatHistory[chatHistory.length - 1]);
  }, [chatHistory]);

  useEffect(() => {
    if (showInitialCase) {
      setTimeout(() => setShowExtractionSection(true), 1000);
      setTimeout(() => setShowAnalysisSection(true), 2000);
    }
  }, [showInitialCase]);

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
  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto space-y-4" style={{ paddingBottom: `calc(${chatInputHeight}px + 6rem)` }}>
      <div className="px-4">
        {/* Chat messages with their associated documents and analysis */}
        <div className="space-y-4">
          {chatHistory.map((msg, index) => {
            const isInitialCaseMessage = msg.initialCase && index === 0;
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
    <ChatMessage 
      message={msg} 
      ref={index === chatHistory.length - 1 ? lastMessageRef : null}
      showInitialCase={showInitialCase}
    />
    {!msg.isUser && (
      <div className="text-[0.50rem] text-gray-400 italic ml-4 mt-1 mb-2">
        Message requires physician interpretation and clinical judgment.
      </div>
    )}
                    {isInitialCaseMessage && (
                      <>
                        <div className="mb-4">
                          <ExtractionSection
                            extractedDisease={extractedDisease}
                            extractedEvents={extractedEvents}
                            setExtractedDisease={setExtractedDisease}
                            setExtractedEvents={setExtractedEvents}
                            onExtractionComplete={onExtractionComplete}
                            className={showExtractionSection ? 'opacity-100' : 'opacity-0'}
                          />
                        </div>
                        <div className="mb-4">
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
                            className={showAnalysisSection ? 'opacity-100' : 'opacity-0'}
                            isLoadingFromHistory={isLoadingFromHistory}
                            isProcessingArticles={isProcessingArticles}
                            articles={articles}
                          />
                        </div>
                      </>
                    )}
                    {/* Show incremental table updates */}
                    {msg.initialCase?.extractedDisease && currentProgress && !chatHistory.find(m => m.type === 'document') && showArticleResults && (
                      <div className="ml-4 mt-2">
                        <ArticleResults 
                          articles={articles}
                          initialExpanded={initialArticleResultsExpanded}
                          currentProgress={currentProgress}
                          totalArticles={totalArticles}
                          processedArticles={processedArticles}
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
                    {showArticleResults && (
                      <ArticleResults 
                        currentProgress={msg.currentProgress}
                        articles={msg.articles}
                        initialExpanded={initialArticleResultsExpanded}
                        totalArticles={totalArticles}
                        processedArticles={processedArticles}
                      />
                    )}
                  </div>
                )}

                {/* Show analysis messages */}
                {msg.analysis && (
                  <div ref={msg === chatHistory[chatHistory.length - 1] ? analysisRef : null} className="ml-4 mt-2">
                    <div className="bg-white rounded-lg shadow-md p-8 pb-12 relative">
                      <h2 className="text-2xl font-bold mb-2 text-gray-900">Analysis Results</h2>
      <div className="space-y-8">
        <MarkdownRenderer content={msg.analysis} />
      </div>
      <div>
        <span className="text-xs text-gray-500 italic block mb-4">
          For professional medical use only. Articles from PubMed Central daily updates. Results require physician interpretation and clinical judgment. Capricorn is an advanced search tool, not a substitute for professional medical advice.
        </span>
      </div>
      <PrintButton content={msg.analysis} />
                    </div>
                  </div>
                )}
                {console.log('[ANALYSIS_LOAD] Rendering message:', {
                  id: msg.id,
                  isAnalysis: !!msg.analysis,
                  isLastMessage: msg === chatHistory[chatHistory.length - 1],
                  analysisLength: msg.analysis ? msg.analysis.length : 0
                })}
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
        {console.log('[ANALYSIS_LOAD] isLoadingAnalysis:', isLoadingAnalysis)}
      </div>
      {/* Invisible element that serves as scroll target */}
      <div ref={messageEndRef} />
      {/* ChatInput component */}
      {hasAnalysis && !isGeneratingSample && !isLoadingDocs && !isLoadingAnalysis && (
        <div className="absolute bottom-0 left-0 right-0 pb-4">
          <div className="relative w-full bg-transparent">
            <ChatInput 
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              handleGenerateSampleCase={handleGenerateSampleCase}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
