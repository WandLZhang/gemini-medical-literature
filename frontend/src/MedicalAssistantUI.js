// src/MedicalAssistantUI.js
import React, { useState } from 'react';
import Header from './components/Header/Header';
import ExpandableSidebar from './components/ExpandableSidebar';
import ChatContainer from './components/Chat/ChatContainer';
import ChatInput from './components/ChatInput';
import { useAuth } from './hooks/useAuth';
import useChat from './hooks/useChat';
import { generateSampleCase, extractDisease, extractEvents, retrieveAndAnalyzeArticles, generateFinalAnalysis } from './utils/api';

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
  const [isBox2Hovered, setIsBox2Hovered] = useState(false);
  const [isBox3Hovered, setIsBox3Hovered] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [articles, setArticles] = useState([]);
  const [currentProgress, setCurrentProgress] = useState('');
  const [pmids, setPmids] = useState([]);
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  const [extractionPrompt] = useState(`You are an expert pediatric oncologist and chair of the International Leukemia Tumor Board (iLTB). Your role is to analyze complex patient case notes, identify key actionable events that may guide treatment strategies, and formulate precise search queries for PubMed to retrieve relevant clinical research articles.

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
  const [promptContent, setPromptContent] = useState(`You are an expert pediatric oncologist and you are the chair of the International Leukemia Tumor Board. Your goal is to evaluate full research articles related to oncology, especially those concerning pediatric leukemia, to identify potential advancements in treatment and understanding of the disease.

The patient's disease is: {disease}

The patient's actionable events are: {events}

Journal Impact Data (SJR scores):
The following is a list of journal titles and their SJR scores. When extracting the journal title from the article, find the best matching title from this list and use its SJR score. If no match is found, use 0 as the SJR score.

Journal Titles and Scores:
{journal_context}

<Article>
{article_text}
</Article>

<Instructions>
Your task is to read the provided full article and extract key information, and then assess the article's relevance and potential impact. You will generate a JSON object containing metadata and a point-based assessment of the article's value. Please use a consistent JSON structure.

As an expert oncologist:
1. Evaluate if the article's disease focus matches the patient's disease. Set disease_match to true if the article's cancer type is relevant to the patient's condition.
2. Analyze treatment outcomes. Set treatment_shown to true if the article demonstrates positive treatment results.
3. For each actionable event you find in the article, determine if it matches any of the patient's actionable events. Set matches_query to true for exact or close matches.

The scoring system will assess the following (not necessarily exhaustive and inferred):
*   **Disease Match:** Articles that cover the exact disease in question receive significant points. As an expert oncologist, carefully evaluate if the article's disease focus matches the patient's disease.
*   **Clinical Relevance:** Clinical trials score highest, followed by case reports with therapeutic interventions.
*   **Pediatric Focus:** Articles that focus specifically on pediatric oncology receive a significant bonus.
*   **Treatment Results:** Studies showing actual treatment results with positive outcomes are highly valued. Document specific treatment outcomes in the drug_results field.
*   **Specific Findings:** Articles that report specific actionable events are given more points.
*   **Additional Factors:** Cell studies, mice studies, and other research aspects contribute additional points.

Here's the specific information to extract for each article and their points:

1.  **Title:** The title of the paper. (0 Points)
2.  **Link:** A link to the paper. (0 Points)
3.  **Year:** Publication year (0 Points)
4.  **Cancer Focus:** Whether the article relates to cancer (Boolean, true or false) (0 Points, but essential for filtering).
5.  **Pediatric Focus:** Whether the article focuses on pediatric cancer specifically (Boolean, true or false) (If true, +20 points)
6.  **Type of Cancer:** The specific type of cancer discussed (string, example: Leukemia (AML, ALL), Neuroblastoma, etc.). (If matches query disease exactly, +50 points)
7.  **Paper Type:** The type of study (e.g., clinical trial, case report, in vitro study, review, retrospective study, biological rationale). (+40 points for clinical trial, -5 points for review)
8. **Actionable Event:** Any specific actionable event (e.g., KMT2A rearrangement, FLT3 mutation, specific mutation) mentioned in the paper. Each event will be evaluated against the patient's extracted actionable events, and only matching events will receive points (15 points per matching event)
9. **Drugs Tested:** Whether any drugs are mentioned as tested (Boolean true or false). (if true, +5 points)
10. **Drug Results:** Specific results of drugs that were tested. (if positive results shown, +50 points for actual treatment)
11. **Cell Studies:** Whether drugs were tested on cells in vitro (Boolean true or false) (if true, +5 points).
12. **Mice Studies:** Whether drugs were tested on mice/PDX models (Boolean true or false) (if true, +10 points).
13. **Case Report:** Whether the article presents a case report (Boolean true or false). (if true, +5 points)
14. **Series of Case Reports:** Whether the article presents multiple case reports (Boolean true or false) (if true, +10 points).
15. **Clinical Study:** Whether the article describes a clinical study (Boolean true or false). (if true, +15 points).
16. **Clinical Study on Children:** Whether the clinical study was specifically on children (Boolean true or false) (if true, +20 points).
17. **Novelty:** If the paper describes a novel mechanism or therapeutic strategy (Boolean true or false) (if true +10 points)
18. **Overall Points:** Sum of all points based on the above criteria. (Calculated by the output).

Please analyze the article and provide a JSON response with the following structure:

{
  "article_metadata": {
    "title": "...",
    "journal_title": "...",  // Extract the journal title from the article
    "journal_sjr": 0,        // Look up the SJR score from the provided list. Use the score of the best matching journal title, or 0 if no match found
    "year": "...",
    "cancer_focus": true/false,
    "pediatric_focus": true/false,
    "type_of_cancer": "...",
    "disease_match": true/false,      // Set to true if article's disease matches patient's disease
    "paper_type": "...",
    "actionable_events": [
      {
        "event": "...",
        "matches_query": true/false   // Set to true if this event matches any of the patient's extracted actionable events
      }
    ],
    "drugs_tested": true/false,
    "drug_results": ["...", "..."],
    "treatment_shown": true/false,    // Set to true if article shows positive treatment outcomes
    "cell_studies": true/false,
    "mice_studies": true/false,
    "case_report": true/false,
    "series_of_case_reports": true/false,
    "clinical_study": true/false,
    "clinical_study_on_children": true/false,
    "novelty": true/false,
    "overall_points": 0
  }
}`);

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
        extractEvents(combinedNotes, extractionPrompt)
      ]);
      setExtractedDisease(disease);
      setExtractedEvents(events);
      setIsBox2Hovered(true); // Keep box 2 solid after extraction
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

  const handleRetrieve = async () => {
    if (!extractedDisease || !extractedEvents.length) return;
    setIsRetrieving(true);
    setArticles([]);
    setCurrentProgress('');
    try {
      await retrieveAndAnalyzeArticles(
        extractedDisease,
        extractedEvents,
        promptContent,
        async (data) => {
          if (data.type === 'metadata') {
            if (data.data.status === 'processing') {
              setCurrentProgress(`Analyzing ${data.data.total_articles} articles...`);
            } else if (data.data.status === 'complete') {
              setCurrentProgress(`Article analysis complete. Generating final analysis...`);
              // Wait a moment for the last article to be added to the state
              setTimeout(async () => {
                try {
                  // Get the combined case notes
                  const combinedNotes = [
                    "Case Notes:",
                    caseNotes,
                    "\nLab Results:",
                    labResults
                  ].join('\n\n');

                  const finalAnalysis = await generateFinalAnalysis(
                    combinedNotes,
                    extractedDisease,
                    extractedEvents,
                    articles
                  );
                
                // Create a formatted message for the chat
                const message = {
                  type: 'analysis',
                  content: `
# Case Summary
${finalAnalysis.case_summary}

# Actionable Events Analysis
${finalAnalysis.actionable_events.map(event => `
## ${event.event}
- Type: ${event.type}
- Explanation: ${event.explanation}
- Targetable: ${event.targetable ? 'Yes' : 'No'}
- Prognostic Value: ${event.prognostic_value}
`).join('\n')}

# Treatment Recommendations
${finalAnalysis.treatment_recommendations.map(rec => `
## For ${rec.actionable_event}
- Treatment: ${rec.treatment}
- Evidence: [PMID: ${rec.evidence.pmid}](${rec.evidence.link})
- Evidence Summary: ${rec.evidence.summary}
${rec.previous_use.was_used ? `- Previous Response: ${rec.previous_use.response}` : ''}
${rec.warnings.length > 0 ? `- Warnings:\n${rec.warnings.map(w => `  * ${w}`).join('\n')}` : ''}
`).join('\n')}

${finalAnalysis.multi_target_opportunities.length > 0 ? `
# Multi-Target Opportunities
${finalAnalysis.multi_target_opportunities.map(opp => `
## ${opp.treatment}
- Targets: ${opp.targeted_events.join(', ')}
- Evidence: [PMID: ${opp.evidence.pmid}](${opp.evidence.link})
- Summary: ${opp.evidence.summary}
`).join('\n')}` : ''}
`,
                  timestamp: new Date().toISOString()
                };
                
                handleSendMessage(message);
                setCurrentProgress('Final analysis complete.');
              } catch (error) {
                console.error('Error generating final analysis:', error);
                setCurrentProgress('Error generating final analysis. Please try again.');
              }
            }
          }
          else if (data.type === 'pmids') {
            setPmids(data.data.pmids);
            // Create PubMed links and save them to chat
            const pubmedLinks = data.data.pmids.map(pmid => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`);
            const linksMessage = {
              type: 'document',
              content: pubmedLinks.join('\n'),
              timestamp: new Date().toISOString()
            };
            handleSendMessage(linksMessage);
            setCurrentProgress('Retrieved PMIDs, creating links...');
          }
          else if (data.type === 'article_analysis') {
            const analysis = data.data.analysis.article_metadata;
            setArticles(current => [...current, {
              pmid: analysis.PMID,
              title: analysis.title,
              points: analysis.overall_points,
              content: data.data.analysis.full_article_text,
              journal_title: analysis.journal_title,
              journal_sjr: analysis.journal_sjr,
              year: analysis.year,
              cancer: analysis.type_of_cancer,
              type: analysis.paper_type,
              events: analysis.actionable_events,
              drugs_tested: analysis.drugs_tested,
              drug_results: analysis.drug_results,
              point_breakdown: analysis.point_breakdown
            }]);
            setCurrentProgress(`Processing article ${data.data.progress.article_number}`);
          }
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setCurrentProgress('Error retrieving articles. Please try again.');
    } finally {
      setIsRetrieving(false);
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
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-light text-gray-700 w-16">Case Notes</label>
                  <textarea
                    className="flex-1 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-16"
                    value={caseNotes}
                    onChange={(e) => setCaseNotes(e.target.value)}
                    placeholder="Enter case notes here..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-light text-gray-700 w-16">Lab Results</label>
                  <textarea
                    className="flex-1 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-16"
                    value={labResults}
                    onChange={(e) => setLabResults(e.target.value)}
                    placeholder="Enter lab results here..."
                  />
                </div>
              </div>
            </div>

            <div 
              className={`bg-white shadow rounded-lg p-4 ${!extractedDisease && !isBox2Hovered ? 'opacity-25' : ''}`}
              onMouseEnter={() => setIsBox2Hovered(true)}
              onMouseLeave={() => setIsBox2Hovered(false)}
            >
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
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-light text-gray-700 w-20">Extracted disease</label>
                    <div className="relative flex-1">
                      <textarea
                        className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-8 resize-none overflow-y-auto"
                        value={extractedDisease}
                        onChange={(e) => setExtractedDisease(e.target.value)}
                      />
                      {!extractedDisease && (
                        <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
                          <span className="italic text-gray-400 text-[10px] font-light">Disease will appear here after extraction...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-light text-gray-700 w-20">Extracted events</label>
                    <div className="relative flex-1">
                      <textarea
                        className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-16 resize-none overflow-y-auto"
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
          <div 
            className={`bg-white shadow rounded-lg p-4 ${(!extractedDisease || !extractedEvents.length) ? 'opacity-25' : ''}`}
            onMouseEnter={() => extractedDisease && extractedEvents.length && setIsBox3Hovered(true)}
            onMouseLeave={() => setIsBox3Hovered(false)}
          >
            <div className="mb-1 flex justify-between items-center">
              <h2 className="text-xs font-medium text-gray-700">3 - Press Retrieve to analyze relevant papers</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetrieve}
                  disabled={isRetrieving || !extractedDisease || !extractedEvents.length}
                  className={`text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    (isRetrieving || !extractedDisease || !extractedEvents.length) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isRetrieving ? <LoadingSpinner /> : 'Retrieve'}
                </button>
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
              <>
                <div className="flex items-start gap-2 mb-2">
                  <label className="text-[10px] font-light text-gray-700 w-20 pt-1.5">Analysis instructions</label>
                  <textarea
                    className="flex-1 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-[11rem]"
                    value={promptContent}
                    onChange={(e) => setPromptContent(e.target.value)}
                    placeholder="Enter prompt content here..."
                  />
                </div>
                {currentProgress && (
                  <div className="text-xs mt-2 flex items-center gap-2">
                    <span className={`${currentProgress.includes('final analysis') ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                      {currentProgress}
                    </span>
                    {currentProgress.includes('final analysis') && <LoadingSpinner />}
                  </div>
                )}

                {/* Display Analyzed Articles */}
                {articles.length > 0 && (
                  <div className="mt-4 overflow-x-scroll" style={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table className="min-w-max bg-white border border-gray-300" style={{ minWidth: '150%' }}>
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">PMID</th>
                          <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Title</th>
                          <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Year</th>
                          <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Type of Cancer</th>
                          <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Paper Type</th>
                          <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Actionable Events</th>
                          <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Drugs Tested</th>
                          <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Drug Results</th>
                          <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Full Article</th>
                          <th className="px-4 py-2 text-sm border-t font-semibold text-gray-600 uppercase tracking-wider bg-gray-100">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...articles].sort((a, b) => b.points - a.points).map((article, index) => {
                          const pointsBreakdown = Object.entries(article.point_breakdown || {})
                            .map(([k,v]) => `${k.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}: ${v > 0 ? '+' : ''}${v}`)
                            .join(' | ');

                          return (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm border-t text-gray-500">
                                <a href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                  {article.pmid}
                                </a>
                              </td>
                              <td className="px-4 py-2 text-sm border-t text-gray-500">{article.title}</td>
                              <td className="px-4 py-2 text-sm border-t text-gray-500">{article.year}</td>
                              <td className="px-4 py-2 text-sm border-t text-gray-500">{article.cancer}</td>
                              <td className="px-4 py-2 text-sm border-t text-gray-500">{article.type}</td>
                              <td className="px-4 py-2 text-sm border-t text-gray-500">
                                {article.events.map((event, i) => (
                                  <React.Fragment key={i}>
                                    {i > 0 && ', '}
                                    <span className={event.matches_query ? 'font-bold text-green-600' : ''}>
                                      {event.event}
                                    </span>
                                  </React.Fragment>
                                ))}
                              </td>
                              <td className="px-4 py-2 text-sm border-t text-gray-500">{article.drugs_tested ? 'Yes' : 'No'}</td>
                              <td className="px-4 py-2 text-sm border-t text-gray-500">{article.drug_results?.join(', ') || 'None'}</td>
                              <td className="px-4 py-2 text-sm border-t text-gray-500">
                                <button
                                  onClick={() => {
                                    const width = 800;
                                    const height = 600;
                                    const left = (window.screen.width - width) / 2;
                                    const top = (window.screen.height - height) / 2;
                                    const newWindow = window.open('', '_blank', 
                                      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
                                    );
                                    newWindow.document.write(`
                                      <!DOCTYPE html>
                                      <html>
                                        <head>
                                          <title>Full Article</title>
                                          <script src="https://cdn.tailwindcss.com"></script>
                                        </head>
                                        <body>
                                          <div class="min-h-screen bg-gray-50 py-8 px-4">
                                            <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                                              <button onclick="window.close()" class="mb-4 text-blue-500 hover:text-blue-700">← Back to Table</button>
                                              <div class="prose max-w-none">
                                                <p class="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">${article.content}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </body>
                                      </html>
                                    `);
                                    newWindow.document.close();
                                  }}
                                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                  View Article
                                </button>
                              </td>
                              <td className="px-4 py-2 text-sm border-t text-gray-500">
                                <button
                                  onClick={() => {
                                    const width = 800;
                                    const height = 600;
                                    const left = (window.screen.width - width) / 2;
                                    const top = (window.screen.height - height) / 2;
                                    const newWindow = window.open('', '_blank', 
                                      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
                                    );
                                    newWindow.document.write(`
                                      <!DOCTYPE html>
                                      <html>
                                        <head>
                                          <title>Points Details</title>
                                          <script src="https://cdn.tailwindcss.com"></script>
                                        </head>
                                        <body>
                                          <div class="min-h-screen bg-gray-50 py-8 px-4">
                                            <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                                              <button onclick="window.close()" class="mb-4 text-blue-500 hover:text-blue-700">← Back to Table</button>
                                              <div class="space-y-4">
                                                <h2 class="text-2xl font-bold text-gray-800">Points Details</h2>
                                                <div class="text-4xl font-bold text-blue-600">${Math.round(article.points)} Points</div>
                                                <div class="space-y-2">
                                                  ${pointsBreakdown.split(' | ').map(item => {
                                                    const [label, value] = item.split(': ');
                                                    return `
                                                      <div class="flex justify-between items-center py-2 border-b">
                                                        <span class="text-gray-600">${label}</span>
                                                        <span class="font-semibold ${value.startsWith('+') ? 'text-green-600' : 'text-red-600'}">${value}</span>
                                                      </div>
                                                    `;
                                                  }).join('')}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </body>
                                      </html>
                                    `);
                                    newWindow.document.close();
                                  }}
                                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                                >
                                  <span className="font-bold">{Math.round(article.points)}</span>
                                  <span className="text-blue-500">ℹ️</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
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
