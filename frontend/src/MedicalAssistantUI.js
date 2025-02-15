// src/MedicalAssistantUI.js
import React, { useState } from 'react';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar';
import ExpandableSidebar from './components/ExpandableSidebar';
import ChatContainer from './components/Chat/ChatContainer';
import ChatInput from './components/ChatInput';
import { useAuth } from './hooks/useAuth';
import useChat from './hooks/useChat';
import useTemplates from './hooks/useTemplates';
import { generateSampleCase, extractDisease, extractEvents } from './utils/api';

const MedicalAssistantUI = ({ user }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedDisease, setExtractedDisease] = useState('');
  const [extractedEvents, setExtractedEvents] = useState([]);
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
WES and RNAseq of the current relapse sample is pending. "

**Output:**  
"KMT2A::MLLT3 fusion" "NRAS" "CD33" "CD123"

**Reasoning and Guidance:**

*  **Focus on Actionable Events:** We are not trying to summarize the case but to find what information is relevant to decision-making. This helps filter noise and focus on clinically significant findings.
*  **Prioritization:** Starting with pediatric studies ensures that we tailor our searches to the specific patient population.
*  **Specific Search Terms:** Using exact terms such as "KMT2A::MLLT3 fusion" is essential for precision. Adding "therapy", "treatment" or "clinical trials" helps to find relevant studies.
*  **Combinations:** Combining genetic and immunophenotypic features allows for refined searches that might be more relevant to the patient.
*  **Iteration:** If initial search results are not helpful, we can modify and refine the queries based on the available data.

Extract actionable events from the provided patient information, such as gene fusions, mutations, and positive markers.  Only output the list of actionable events. Do not include any other text or formatting.`);

  // Preloaded case notes
  const [caseNotes, setCaseNotes] = useState(`A now almost 4-year-old female diagnosed with KMT2A-rearranged AML and CNS2 involvement exhibited refractory disease after NOPHO DBH AML 2012 protocol. Post- MEC and ADE, MRD remained at 35% and 53%. Vyxeos-clofarabine therapy reduced MRD to 18%. Third-line FLAG-Mylotarg lowered MRD to 3.5% (flow) and 1% (molecular). After a cord blood HSCT in December 2022, she relapsed 10 months later with 3% MRD and femoral extramedullary disease.
After the iLTB discussion, in November 2023 the patient was enrolled in the SNDX5613 trial, receiving revumenib for three months, leading to a reduction in KMT2A MRD to 0.1% by PCR. Subsequently, the patient underwent a second allogeneic HSCT using cord blood with treosulfan, thiotepa, and fludarabine conditioning, followed by revumenib maintenance. In August 2024, 6.5 months after the second HSCT, the patient experienced a bone marrow relapse with 33% blasts. The patient is currently in very good clinical condition.`);
  
  const [labResults, setLabResults] = useState(`Diagnostic tests:			
						 							
  WES and RNAseq were performed on the 1st relapse sample showing KMT2A::MLLT3 fusion and NRAS (p.Gln61Lys) mutation.
 						
						 							
  Flow cytometry from the current relapse showed positive CD33 and CD123.
 						
						 							
  WES and RNAseq of the current relapse sample is pending.`);

  const handleExpand = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const { handleLogin, handleLogout } = useAuth(setShowUserMenu);
  const { 
    templates, 
    selectedTemplate, 
    setSelectedTemplate, 
    addTemplate, 
    editTemplate,
    deleteTemplate
  } = useTemplates();
  
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
  } = useChat(user, selectedTemplate);

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
      const combinedNotes = `${caseNotes}\n\n${labResults}`;
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

      <div className="flex flex-1 min-h-0">
        {/* Expandable Sidebar */}
        <ExpandableSidebar
          user={user}
          onChatSelect={handleChatSelect}
          activeChat={activeChat}
          initializeNewChat={initializeNewChat}
        />

        <div className="w-[50%] pl-12 pt-10">
          <div className="space-y-4">
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xs font-medium text-gray-700">1. Case Notes</h2>
                  <button 
                    onClick={() => handleExpand('notes')}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    {expandedSection === 'notes' ? 'Collapse' : 'Expand'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Case Notes</label>
                    <textarea
                      className={`w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs ${
                        expandedSection === 'notes' ? 'h-32' : 'h-16'
                      }`}
                      value={caseNotes}
                      onChange={(e) => setCaseNotes(e.target.value)}
                      placeholder="Enter case notes here..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Lab Results</label>
                    <textarea
                      className={`w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs ${
                        expandedSection === 'notes' ? 'h-32' : 'h-16'
                      }`}
                      value={labResults}
                      onChange={(e) => setLabResults(e.target.value)}
                      placeholder="Enter lab results here..."
                    />
                  </div>
                </div>
              </div>

            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-medium text-gray-700">2. Extract Events and Disease</h2>
                <button 
                  onClick={handleExtract}
                  disabled={isProcessing}
                  className={`text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? 'Extracting...' : 'Extract'}
                </button>
              </div>
              <div className="h-32 overflow-hidden">
                <div className="flex flex-col h-full space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Extracted disease</label>
                    <textarea
                      className="w-full p-1.5 bg-gray-50 rounded text-xs h-[36px] resize-none overflow-y-auto"
                      value={extractedDisease || 'Disease will appear here after extraction...'}
                      onChange={(e) => setExtractedDisease(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Extracted events</label>
                    <textarea
                      className="w-full p-1.5 bg-gray-50 rounded text-xs h-[36px] resize-none overflow-y-auto"
                      value={extractedEvents.length > 0 ? extractedEvents.join(', ') : 'Events will appear here after extraction...'}
                      onChange={(e) => setExtractedEvents(e.target.value.split(', '))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-medium text-gray-700">3. Template Selection</h2>
                <button 
                  onClick={() => handleExpand('template')}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  {expandedSection === 'template' ? 'Collapse' : 'Expand'}
                </button>
              </div>
              <Sidebar 
                templates={templates}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                addTemplate={addTemplate}
                editTemplate={editTemplate}
                deleteTemplate={deleteTemplate}
                expanded={expandedSection === 'template'}
              />
            </div>

          </div>
        </div>
        <main className="flex-1 flex flex-col min-h-0 relative pt-4 pl-4">
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
