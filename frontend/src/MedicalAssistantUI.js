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

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Components
import DisclaimerModal from './components/DisclaimerModal';
import SpecialtySelector from './components/SpecialtySelector';
import { WrappedExpandableSidebar } from './components/ExpandableSidebar';
import TopBar from './components/TopBar';
import MainPanel from './components/MainPanel/MainPanel';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import FeedbackButton from './components/Feedback/FeedbackButton';
import FeedbackModal from './components/Feedback/FeedbackModal';

// Hooks
import { useAuth } from './hooks/useAuth';
import useChat from './hooks/useChat';

// API
import { generateSampleCase, extractMedicalInfo, retrieveAndAnalyzeArticles, generateFinalAnalysis, sendFeedback } from './utils/api';

// Preset Data
import { diseaseExtractionPrompts, eventExtractionPrompts, extractionPrompt, promptContents, promptContent, presetCaseNotes, presetLabResults } from './data/presetData';

// Utilities
const createMessageId = (type) => `${Date.now()}-${type}-${Math.random().toString(36).substr(2, 9)}`;

const MedicalAssistantUI = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [showSpecialtySelector, setShowSpecialtySelector] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('oncology');
  const [specialtyConfirmed, setSpecialtyConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedDisease, setExtractedDisease] = useState('');
  const [extractedEvents, setExtractedEvents] = useState([]);
  const [isBox2Hovered, setIsBox2Hovered] = useState(false);
  const [isBox3Hovered, setIsBox3Hovered] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [isProcessingArticles, setIsProcessingArticles] = useState(false);
  const [articles, setArticles] = useState([]);
  const [currentProgress, setCurrentProgress] = useState('');
  const [pmids, setPmids] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [currentArticleData, setCurrentArticleData] = useState(null);
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  const [numArticles, setNumArticles] = useState(15);
  const [caseNotes, setCaseNotes] = useState('');
  const [labResults, setLabResults] = useState('');
  const [currentPromptContent, setCurrentPromptContent] = useState(promptContent);
  const [isNewChat, setIsNewChat] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [justExtracted, setJustExtracted] = useState(false);
  const [isLoadingFromHistory, setIsLoadingFromHistory] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const retrievalAttemptedRef = useRef(false);
  const [shouldRetrieve, setShouldRetrieve] = useState(false);

const handleSidebarToggle = () => {
  setIsSidebarExpanded(prevState => !prevState);
};

  console.log('MedicalAssistantUI: setCaseNotes is a function:', typeof setCaseNotes === 'function');

  const { user, firstName, loading, handleLogin, handleLogout, isAuthenticated } = useAuth();
  console.log('[AUTH_MENU_DEBUG] MedicalAssistantUI: auth state:', { user, isAuthenticated, firstName, showUserMenu });

  useEffect(() => {
    console.log('[AUTH_MENU_DEBUG] MedicalAssistantUI: Authentication state changed:', { isAuthenticated, firstName, showUserMenu });
  }, [isAuthenticated, firstName, showUserMenu]);

  const handleToggleUserMenu = () => {
    console.log('[AUTH_MENU_DEBUG] MedicalAssistantUI: Toggling user menu');
    setShowUserMenu(prevState => !prevState);
  };
  
  const {
    chatHistory,
    isLoadingDocs,
    isLoadingAnalysis,
    activeChat,
    message,
    setMessage,
    handleChatSelect: originalHandleChatSelect,
    handleSendMessage,
    initializeNewChat,
    initializeActiveChat
  } = useChat(user);

  const hasDocumentMessages = useMemo(() => 
    chatHistory.some(msg => msg.type === 'document' || msg.documents),
    [chatHistory]
  );

  const handleChatSelect = (chat) => {
    setIsNewChat(true);
    setCaseNotes('');
    setLabResults('');
    setIsLoadingFromHistory(true);
    originalHandleChatSelect(chat);
  };

  const handleGenerateSampleCase = async () => {
    setIsGeneratingSample(true);
    try {
      const sampleCase = await generateSampleCase();
      setMessage(sampleCase);
    } catch (error) {
      console.error('Error generating sample case:', error);
    }
    setIsGeneratingSample(false);
  };

  // Effect to show disclaimer on initial load
  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleCloseDisclaimer = () => {
    localStorage.setItem('hasSeenDisclaimer', 'true');
    setShowDisclaimer(false);
  };

  // Effect to handle loading case information when chat history changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      // Find the initial case message
      const initialCaseMessage = chatHistory.find(msg => msg.initialCase);
      if (initialCaseMessage?.initialCase) {
        const { caseNotes: savedCaseNotes, labResults: savedLabResults, extractedDisease, extractedEvents } = initialCaseMessage.initialCase;
        setCaseNotes(savedCaseNotes);
        setLabResults(savedLabResults);
        setExtractedDisease(extractedDisease);
        setExtractedEvents(extractedEvents);
      }
    } else {
      // Clear all content and reset prompt expansion when there's no chat history
      setCaseNotes('');
      setLabResults('');
      setExtractedDisease('');
      setExtractedEvents([]);
      setIsPromptExpanded(true); // Reset prompt expansion when starting new chat
    }
    // Set isLoadingFromHistory back to false after loading is complete
    setIsLoadingFromHistory(false);
  }, [chatHistory]);

const handleExtract = async () => {
  console.log('[CHAT_DEBUG] Starting extraction process');
  try {
    setIsProcessing(true);
    
    // Proceed with extraction since specialty is already selected
    await handleSpecialtySelected(selectedSpecialty);
    
  } catch (error) {
    console.error('[CHAT_DEBUG] Extraction error:', error);
    if (error.message.includes('Failed to fetch')) {
      setExtractedDisease('Network error. Please check your connection and try again.');
      setExtractedEvents(['Network error. Please check your connection and try again.']);
    } else {
      setExtractedDisease(error.message || 'Error extracting disease. Please try again.');
      setExtractedEvents([error.message || 'Error extracting events. Please try again.']);
    }
    setIsProcessing(false);
  }
};

// New handler for specialty confirmation
const handleSpecialtyConfirmed = (specialty) => {
  console.log('[CHAT_DEBUG] Specialty confirmed:', specialty);
  setSelectedSpecialty(specialty);
  setCurrentPromptContent(promptContents[specialty]);
  setSpecialtyConfirmed(true);
};

const handleSpecialtySelected = async (specialty) => {
    console.log('[CHAT_DEBUG] Selected specialty:', specialty);
    setSelectedSpecialty(specialty);
    
    // Update prompt content based on selected specialty
    setCurrentPromptContent(promptContents[specialty]);
    console.log(`[CHAT_DEBUG] Updated prompt content for ${specialty} specialty`);
  
  try {
    console.log('[CHAT_DEBUG] User state:', {
      isAuthenticated: !!user,
      userId: user?.uid,
      isAnonymous: user?.isAnonymous
    });
    
    // Combine case notes and lab results with clear separation
    const combinedNotes = [
      "Case Notes:",
      caseNotes,
      "\nLab Results:",
      labResults
    ].join('\n\n');

    console.log('[CHAT_DEBUG] Extracting disease and events from notes');
    
    let disease, events;
    
    try {
      // Use the new unified function for both disease and events extraction
      [disease, events] = await Promise.all([
        extractMedicalInfo(combinedNotes, 'disease', specialty),
        extractMedicalInfo(combinedNotes, 'events', specialty, eventExtractionPrompts[specialty])
      ]);
      
      console.log(`[EXTRACTION_DEBUG] ${specialty} extraction results:`, { disease, events });
    } catch (error) {
      console.error(`[EXTRACTION_DEBUG] Error extracting medical info for ${specialty}:`, error);
      disease = `Error extracting ${specialty} disease: ${error.message}`;
      events = [`Error extracting ${specialty} events: ${error.message}`];
    }
    
    console.log('[CHAT_DEBUG] Extraction results:', { disease, events, specialty });
    setExtractedDisease(disease);
    setExtractedEvents(events);
    setIsBox2Hovered(true); // Keep box 2 solid after extraction

    // Initialize active chat with the extracted information
    try {
      console.log('[CHAT_DEBUG] Initializing active chat with extracted data');
      await initializeActiveChat(caseNotes, labResults, disease, events);
      console.log('[CHAT_DEBUG] Chat initialization successful');
      
      // Reset the retrieval attempt ref, set justExtracted to true, and set shouldRetrieve to true
      retrievalAttemptedRef.current = false;
      setJustExtracted(true);
      setShouldRetrieve(true);
    } catch (error) {
      console.error('[CHAT_DEBUG] Error initializing chat:', error);
    }
  } catch (error) {
    console.error('[CHAT_DEBUG] Extraction error:', error);
    if (error.message.includes('Failed to fetch')) {
      setExtractedDisease('Network error. Please check your connection and try again.');
      setExtractedEvents(['Network error. Please check your connection and try again.']);
    } else {
      setExtractedDisease(error.message || 'Error extracting disease. Please try again.');
      setExtractedEvents([error.message || 'Error extracting events. Please try again.']);
    }
  } finally {
    setIsProcessing(false);
  }
};

  const handleExampleLoad = (exampleCaseNotes, exampleLabResults) => {
    setCaseNotes(exampleCaseNotes);
    setLabResults(exampleLabResults);
  };

  const handleClearAll = useCallback(async () => {
    console.log('[CLEAR_DEBUG] MedicalAssistantUI: handleClearAll called');
    console.log('[CLEAR_DEBUG] Before clear - caseNotes:', caseNotes, 'labResults:', labResults);
    setCaseNotes('');
    setLabResults('');
    setExtractedDisease('');
    setExtractedEvents([]);
    setIsBox2Hovered(false);
    setIsBox3Hovered(false);
    setArticles([]);
    setCurrentProgress('');
    setPmids([]);
    setTotalArticles(0);
    setCurrentArticleData(null);
    setIsPromptExpanded(true);
    setIsNewChat(true);
    setSpecialtyConfirmed(false); // Reset specialty confirmation
    const chatId = await initializeNewChat();
    console.log('[CLEAR_DEBUG] MedicalAssistantUI: All states reset');
    
    // Force a re-render to ensure the UI updates
    setTimeout(() => {
      console.log('[CLEAR_DEBUG] After timeout - caseNotes:', caseNotes, 'labResults:', labResults);
    }, 0);
    
    return chatId;
  }, [setCaseNotes, setLabResults, setExtractedDisease, setExtractedEvents, initializeNewChat, caseNotes, labResults]);

  const handleRetrieve = async () => {
    console.log('Retrieval triggered. Conditions:', {
      isProcessingArticles,
      extractedDisease,
      extractedEventsLength: extractedEvents.length,
      justExtracted,
      isRetrieving,
      hasDocumentMessages,
      isNewChat,
      hasCaseNotes: !!caseNotes,
      hasLabResults: !!labResults
    });

    // Check if retrieval should actually occur
    if (isProcessingArticles || !extractedDisease || !extractedEvents.length) {
      console.log('Retrieval aborted due to conditions not met');
      return;
    }

    setIsRetrieving(true);
    setIsProcessingArticles(true);
    setIsPromptExpanded(false);
    setArticles([]);
    setCurrentProgress('');
    setTotalArticles(0);
    setCurrentArticleData(null);

    // Create a local variable to store processed articles
    let processedArticles = [];

    try {
      // Combine case notes and lab results
      const combinedNotes = [
        "Case Notes:",
        caseNotes,
        "\nLab Results:",
        labResults
      ].join('\n\n');

      await retrieveAndAnalyzeArticles(
        extractedDisease,
        extractedEvents,
        promptContent,
        async (data) => {
          if (data.type === 'metadata') {
            if (data.data.status === 'processing') {
              setTotalArticles(data.data.total_articles);
              setCurrentProgress(`Analyzing ${data.data.total_articles} articles...`);
            } else if (data.data.status === 'complete') {
              setCurrentProgress(`Article analysis complete. Generating final analysis...`);
              console.log('All articles processed. Total articles:', processedArticles.length);
              
              // First, send the document message
              const documentsContent = {
                type: 'document',
                content: {
                  articles: processedArticles,
                  currentProgress: currentProgress
                }
              };
              console.log('Sending document message to handleSendMessage:', JSON.stringify(documentsContent, null, 2));
              await handleSendMessage(documentsContent);
              console.log('Document message sent successfully');

              try {
                console.log('Starting final analysis with processed articles:', processedArticles.length);
                // Send the analysis loading state message
                const loadingContent = {
                  type: 'analysis',
                  content: {
                    isLoading: true
                  }
                };
                await handleSendMessage(loadingContent);

                const finalAnalysis = await generateFinalAnalysis(
                  combinedNotes,
                  extractedDisease,
                  extractedEvents,
                  processedArticles
                );
              
                // Send the analysis as a separate message
                const analysisContent = {
                  type: 'analysis',
                  content: finalAnalysis.markdown_content
                };
                
                // Send the analysis message
                console.log('Sending analysis message to handleSendMessage:', JSON.stringify(analysisContent, null, 2));
                await handleSendMessage(analysisContent);
                console.log('Analysis message sent successfully');
                setCurrentProgress('Processing complete.');
              } catch (error) {
                console.error('Error generating final analysis:', error);
                setCurrentProgress('Error generating final analysis. Please try again.');
              }
            }
          }
          else if (data.type === 'pmids') {
            setPmids(data.data.pmids);
            setCurrentProgress('Retrieved PMIDs, creating links...');
          }
          else if (data.type === 'article_analysis') {
            const analysis = data.data.analysis.article_metadata;
            const articleData = {
              pmid: analysis.PMID,
              title: analysis.title,
              points: analysis.overall_points,
              content: data.data.analysis.full_article_text,
              journal_title: analysis.journal_title,
              journal_sjr: analysis.journal_sjr,
              year: analysis.year,
              disease: analysis.type_of_disease,
              type: analysis.paper_type,
              events: analysis.actionable_events,
              drugs_tested: analysis.drugs_tested,
              drug_results: analysis.drug_results,
              point_breakdown: analysis.point_breakdown
            };
            
            // Set current article being processed
            setCurrentArticleData(articleData);
            
            // Add to both state and local variable
            setArticles(current => [...current, articleData]);
            processedArticles.push(articleData);
            console.log('Added article to processed articles. Current count:', processedArticles.length);

            const articleNumber = data.data.progress?.article_number || 0;
            const totalArticles = data.data.progress?.total_articles || 0;
            console.log('Progress:', { articleNumber, totalArticles, processedArticlesLength: processedArticles.length });
            
            if (articleNumber > 0 && totalArticles > 0) {
              const progress = (articleNumber / totalArticles) * 100;
              setCurrentProgress(`Processed article ${articleNumber} out of ${totalArticles}`);
            }
          }
        },
        numArticles // Pass numArticles to the API function
      );
    } catch (error) {
      console.error('[RETRIEVE_DEBUG] Error:', error);
      setCurrentProgress('Error retrieving articles. Please try again.');
    } finally {
      setIsRetrieving(false);
      setIsProcessingArticles(false);
      setCurrentArticleData(null);
    }
  };

useEffect(() => {
  if (justExtracted && 
      extractedDisease && 
      extractedEvents.length > 0 && 
      !isRetrieving && 
      !isProcessingArticles && 
      !hasDocumentMessages &&
      (caseNotes || labResults) &&
      !retrievalAttemptedRef.current &&
      shouldRetrieve) {
    console.log('[RETRIEVAL_DEBUG] Conditions met for retrieval');
    retrievalAttemptedRef.current = true;
    handleRetrieve();
    setJustExtracted(false);
    setShouldRetrieve(false);
  } else if (justExtracted) {
    console.log('[RETRIEVAL_DEBUG] Retrieval conditions not met:', {
      justExtracted,
      extractedDisease,
      extractedEventsLength: extractedEvents.length,
      isRetrieving,
      isProcessingArticles,
      hasDocumentMessages,
      hasCaseNotesOrLabResults: !!(caseNotes || labResults),
      retrievalAttempted: retrievalAttemptedRef.current,
      shouldRetrieve
    });
  }
}, [justExtracted, extractedDisease, extractedEvents, isRetrieving, isProcessingArticles, hasDocumentMessages, isNewChat, caseNotes, labResults, shouldRetrieve]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  const handleOpenFeedbackModal = () => {
    setShowFeedbackModal(true);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <DisclaimerModal isOpen={showDisclaimer} onClose={handleCloseDisclaimer} />
      <TopBar 
        user={user}
        firstName={firstName}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        showUserMenu={showUserMenu}
        setShowUserMenu={handleToggleUserMenu}
        isAuthenticated={isAuthenticated}
      />

      {/* Feedback Button and Modal */}
      <FeedbackButton onClick={handleOpenFeedbackModal} />
      <FeedbackModal isOpen={showFeedbackModal} onClose={handleCloseFeedbackModal} />
      <SpecialtySelector 
        isOpen={showSpecialtySelector} 
        onClose={() => setShowSpecialtySelector(false)} 
        onSelectSpecialty={handleSpecialtySelected} 
      />

      <div className="flex flex-1 min-h-0 relative w-full overflow-hidden">
        <div className="absolute z-10">
        <WrappedExpandableSidebar
          user={user}
          onChatSelect={handleChatSelect}
          activeChat={activeChat}
          initializeNewChat={handleClearAll}
          setIsNewChat={setIsNewChat}
          isExpanded={isSidebarExpanded}
          onToggle={handleSidebarToggle}
          setShouldRetrieve={setShouldRetrieve}
          setCaseNotes={setCaseNotes}
          setLabResults={setLabResults}
          setExtractedDisease={setExtractedDisease}
          setExtractedEvents={setExtractedEvents}
        />
        </div>

        <div className="ml-12 flex-1 flex w-full overflow-hidden">
          <MainPanel
            extractedDisease={extractedDisease}
            extractedEvents={extractedEvents}
            setExtractedDisease={setExtractedDisease}
            setExtractedEvents={setExtractedEvents}
            articles={articles}
            setArticles={setArticles}
            currentArticleData={currentArticleData}
            chatHistory={chatHistory}
            isGeneratingSample={isGeneratingSample}
            isLoadingDocs={isLoadingDocs}
            isLoadingAnalysis={isLoadingAnalysis}
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            handleGenerateSampleCase={handleGenerateSampleCase}
            caseNotes={caseNotes}
            setCaseNotes={setCaseNotes}
            labResults={labResults}
            setLabResults={setLabResults}
            isProcessing={isProcessing}
            handleExtract={handleExtract}
            currentProgress={currentProgress}
            numArticles={numArticles}
            setNumArticles={setNumArticles}
            isNewChat={isNewChat}
            firstName={firstName}
            isRetrieving={isRetrieving}
            handleRetrieve={handleRetrieve}
            isBox3Hovered={isBox3Hovered}
            setIsBox3Hovered={setIsBox3Hovered}
            isPromptExpanded={isPromptExpanded}
            setIsPromptExpanded={setIsPromptExpanded}
            promptContent={currentPromptContent}
            setPromptContent={setCurrentPromptContent}
            handleClearAll={handleClearAll}
            justExtracted={justExtracted}
            setJustExtracted={setJustExtracted}
            isLoadingFromHistory={isLoadingFromHistory}
            isProcessingArticles={isProcessingArticles}
            setIsProcessingArticles={setIsProcessingArticles}
            selectedSpecialty={selectedSpecialty}
            setSelectedSpecialty={setSelectedSpecialty}
            specialtyConfirmed={specialtyConfirmed}
            handleSpecialtyConfirmed={handleSpecialtyConfirmed}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MedicalAssistantUI;
