// src/MedicalAssistantUI.js
import React, { useState } from 'react';
import Header from './components/Header/Header';
import ExpandableSidebar from './components/ExpandableSidebar';
import ChatContainer from './components/Chat/ChatContainer';
import ChatInput from './components/ChatInput';
import { useAuth } from './hooks/useAuth';
import useChat from './hooks/useChat';
import { generateSampleCase, extractDisease, extractEvents } from './utils/api';

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const MedicalAssistantUI = ({ user }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedDisease, setExtractedDisease] = useState('');
  const [extractedEvents, setExtractedEvents] = useState([]);
  
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  const [promptContent, setPromptContent] = useState(`You are an expert pediatric oncologist and chair of the International Leukemia Tumor Board (iLTB). Your role is to analyze complex patient case notes, identify key actionable events that may guide treatment strategies, and formulate precise search queries for PubMed to retrieve relevant clinical research articles.

**Input:** Patient case notes, as provided by a clinician. This will include information on diagnosis, treatment history, and relevant diagnostic findings including genetics and flow cytometry results.

**Task:**

1. **Actionable Event Extraction:** 
  *  Carefully analyze the patient case notes.
  *  Identify and extract all clinically relevant and actionable events, such as:
    *  **Specific genetic mutations or fusions:** For example, "KMT2A::MLLT3 fusion", "NRAS (p.Gln61Lys) mutation"
    *  **Immunophenotype data:** For example, "positive CD33", "positive CD123"
    *  **Disease status:** For example, "relapsed after HSCT", "refractory to protocol"
    *  **Specific therapies:** "revumenib", "FLAG-Mylotarg", "Vyxeos-clofarabine"
    *  **Disease location:** For example, "CNS2 involvement", "femoral extramedullary disease"
    *  **Response to therapy:** For example, "MRD reduction to 0.1%"
    *  **Treatment resistance:** For example, "relapsed after second HSCT"
   *  Focus on information that is directly relevant to potential therapy selection or clinical management. Avoid vague or redundant information like "very good clinical condition".

**Example:**

*  **Case Note Input:** "A now almost 4-year-old female diagnosed with KMT2A-rearranged AML and CNS2 involvement exhibited refractory disease after NOPHO DBH AML 2012 protocol. Post- MEC and ADE, MRD remained at 35% and 53%. Vyxeos-clofarabine therapy reduced MRD to 18%. Third-line FLAG-Mylotarg lowered MRD to 3.5% (flow) and 1% (molecular). After a cord blood HSCT in December 2022, she relapsed 10 months later with 3% MRD and femoral extramedullary disease.
After the iLTB discussion, in November 2023 the patient was enrolled in the SNDX5613 trial, receiving revumenib for three months, leading to a reduction in KMT2A MRD to 0.1% by PCR. Subsequently, the patient underwent a second allogeneic HSCT using cord blood with treosulfan, thiotepa, and fludarabine conditioning, followed by revumenib maintenance. In August 2024, 6.5 months after the second HSCT, the patient experienced a bone marrow relapse with 33% blasts. The patient is currently in very good clinical condition.             
Diagnostic tests:                                                     
WES and RNAseq were performed on the 1st relapse sample showing KMT2A::MLLT3 fusion and NRAS (p.Gln61Lys) mutation.
Flow cytometry from the current relapse showed positive CD33 and CD123.
WES and RNAseq of the current relapse sample is pending."

**Output:**  
"KMT2A::MLLT3 fusion" "NRAS" "CD33" "CD123"`);

  // Preloaded case notes
  const [caseNotes, setCaseNotes] = useState(`A now almost 4-year-old female diagnosed with KMT2A-rearranged AML and CNS2 involvement exhibited refractory disease after NOPHO DBH AML 2012 protocol. Post- MEC and ADE, MRD remained at 35% and 53%. Vyxeos-clofarabine therapy reduced MRD to 18%. Third-line FLAG-Mylotarg lowered MRD to 3.5% (flow) and 1% (molecular). After a cord blood HSCT in December 2022, she relapsed 10 months later with 3% MRD and femoral extramedullary disease.
After the iLTB discussion, in November 2023 the patient was enrolled in the SNDX5613 trial, receiving revumenib for three months, leading to a reduction in KMT2A MRD to 0.1% by PCR. Subsequently, the patient underwent a second allogeneic HSCT using cord blood with treosulfan, thiotepa, and fludarabine conditioning, followed by revumenib maintenance. In August 2024, 6.5 months after the second HSCT, the patient experienced a bone marrow relapse with 33% blasts. The patient is currently in very good clinical condition.`);
  
  const [labResults, setLabResults] = useState(`Diagnostic tests:			
						 							
  WES and RNAseq were performed on the 1st relapse sample showing KMT2A::MLLT3 fusion and NRAS (p.Gln61Lys) mutation.
 						
						 							
  Flow cytometry from the current relapse showed positive CD33 and CD123.
 						
						 							
  WES and RNAseq of the current relapse sample is pending.`);

  const { handleLogin, handleLogout } = useAuth(setShowUserMenu);
  
  const {
    chatHistory,
    isLoadingDocs,
    isLoadingAnalysis,
    activeChat,
    message,
    setMessage,
    handleChatSelect,
    handleSendMessage,
    initializeNewChat
  } = useChat(user);

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

  const handleExtract = async () => {
    try {
      setIsProcessing(true);
      // Combine case notes and lab results with clear separation
      const combinedNotes = [
        "Case Notes:",
        caseNotes,
        "\nLab Results:",
        labResults
      ].join('\n\n');


      const [disease, events] = await Promise.all([
        extractDisease(combinedNotes),
        extractEvents(combinedNotes, promptContent)
      ]);
      setExtractedDisease(disease);
      setExtractedEvents(events);
    } catch (error) {
      console.error('Error:', error);
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top bar */}
      <div className="h-16 bg-gray-800 text-white flex items-center px-4 justify-between">
        <div><span className="font-bold">Capricorn</span> <span className="font-light">| Medical Research</span></div>
        <Header 
          user={user}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
        />
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Expandable Sidebar */}
        <div className="absolute z-10">
          <ExpandableSidebar
            user={user}
            onChatSelect={handleChatSelect}
            activeChat={activeChat}
            initializeNewChat={initializeNewChat}
          />
        </div>

        <div className="w-[40%] pl-12 pt-10 z-0">
          <div className="space-y-4">
              <div className="bg-white shadow rounded-lg p-4">
                <div className="mb-1">
                  <h2 className="text-xs font-medium text-gray-700">1 - Input your case notes and lab results</h2>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="flex justify-center text-[10px] font-light text-gray-700 mb-1">Case Notes</label>
                    <textarea
                      className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-16"
                      value={caseNotes}
                      onChange={(e) => setCaseNotes(e.target.value)}
                      placeholder="Enter case notes here..."
                    />
                  </div>
                  <div>
                    <label className="flex justify-center text-[10px] font-light text-gray-700 mb-1">Lab Results</label>
                    <textarea
                      className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-16"
                      value={labResults}
                      onChange={(e) => setLabResults(e.target.value)}
                      placeholder="Enter lab results here..."
                    />
                  </div>
                </div>
              </div>

            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-medium text-gray-700">2 - Press Extract to get disease and actionable events</h2>
                <button 
                  onClick={handleExtract}
                  disabled={isProcessing}
                  className={`text-xs px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 w-[60px] flex items-center justify-center ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? <LoadingSpinner /> : 'Extract'}
                </button>
              </div>
              <div className="h-32 overflow-hidden">
                <div className="flex flex-col h-full space-y-2">
                  <div>
                    <label className="flex justify-center text-[10px] font-light text-gray-700 mb-1">Extracted disease</label>
                    <div className="relative">
                      <textarea
                        className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-[36px] resize-none overflow-y-auto"
                        value={extractedDisease}
                        onChange={(e) => setExtractedDisease(e.target.value)}
                      />
                      {!extractedDisease && (
                        <div className="absolute inset-0 p-1.5 pointer-events-none">
                          <span className="italic text-gray-400 text-[10px] font-light">Disease will appear here after extraction...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex justify-center text-[10px] font-light text-gray-700 mb-1">Extracted events</label>
                    <div className="relative">
                      <textarea
                        className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-[36px] resize-none overflow-y-auto"
                        value={extractedEvents.length > 0 ? extractedEvents.join(', ') : ''}
                        onChange={(e) => setExtractedEvents(e.target.value.split(',').map(event => event.trim()))}
                      />
                      {extractedEvents.length === 0 && (
                        <div className="absolute inset-0 p-1.5 pointer-events-none">
                          <span className="italic text-gray-400 text-[10px] font-light">Events will appear here after extraction...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <main className="flex-1 flex flex-col min-h-0 relative pl-12 pt-10">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="mb-1 flex justify-between items-center">
              <h2 className="text-xs font-medium text-gray-700">Prompt Content</h2>
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
            {isPromptExpanded && (
              <div>
                <textarea
                className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-[11rem]"
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                placeholder="Enter prompt content here..."
                />
              </div>
            )}
          </div>
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
      </div>
      
      {/* Footer */}
      <div className="bg-gray-800 text-white py-2 px-4 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <img 
            src="/maxima-logo.png" 
            alt="Prinses Máxima Centrum logo" 
            className="h-4 w-auto"
          />
          <span className="text-xs text-gray-300">
            In collaboration with <a href="mailto:U.ilan-2@prinsesmaximacentrum.nl" className="text-gray-300 hover:text-white">Uri Ilan</a> @ Prinses Máxima Centrum
          </span>
        </div>
        <div className="flex items-center gap-2">
          <img 
            src="/google.png" 
            alt="Google logo" 
            className="h-4 w-auto"
          />
          <span className="text-xs text-gray-300">
            Built by <a href="mailto:willis.zhng@gmail.com" className="text-gray-300 hover:text-white">Willis Zhang</a> and <a href="mailto:stonejiang@google.com" className="text-gray-300 hover:text-white">Stone Jiang</a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistantUI;
