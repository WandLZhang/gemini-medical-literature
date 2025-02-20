import React, { useState, useEffect } from 'react';

// Components
import DisclaimerModal from './components/DisclaimerModal';
import ExpandableSidebar from './components/ExpandableSidebar';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import MainPanel from './components/MainPanel/MainPanel';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Hooks
import { useAuth } from './hooks/useAuth';
import useChat from './hooks/useChat';

// API
import { generateSampleCase, extractDisease, extractEvents, retrieveAndAnalyzeArticles, generateFinalAnalysis } from './utils/api';

// Utilities
const createMessageId = (type) => `${Date.now()}-${type}-${Math.random().toString(36).substr(2, 9)}`;

const MedicalAssistantUI = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
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
  const [totalArticles, setTotalArticles] = useState(0);
  const [currentArticleData, setCurrentArticleData] = useState(null);
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  const [numArticles, setNumArticles] = useState(15);
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
3. For each actionable event you find in the article, determine if it matches any of the patient's actionable events. For genetic mutations, create two separate events:
   - When you find a general mutation mention (e.g., if the article mentions just "NRAS" when patient has "NRAS (p.Gln61Lys)"), create an event with the general form and set matches_query=true
   - When you find an exact mutation match (e.g., if the article mentions "NRAS (p.Gln61Lys)" like it appears in the patient's events), create another event with the exact mutation and set matches_query=true

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

  const { user, loading, handleLogin, handleLogout, isAuthenticated } = useAuth(setShowUserMenu);
  
  const {
    chatHistory,
    isLoadingDocs,
    isLoadingAnalysis,
    activeChat,
    message,
    setMessage,
    handleChatSelect,
    handleSendMessage,
    initializeNewChat,
    initializeActiveChat,
    hasDocumentMessages
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
      // Clear extraction content and reset prompt expansion when there's no chat history
      setExtractedDisease('');
      setExtractedEvents([]);
      setIsPromptExpanded(true); // Reset prompt expansion when starting new chat
    }
  }, [chatHistory]);

  const handleExtract = async () => {
    console.log('[CHAT_DEBUG] Starting extraction process');
    try {
      setIsProcessing(true);
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
      const [disease, events] = await Promise.all([
        extractDisease(combinedNotes),
        extractEvents(combinedNotes, extractionPrompt)
      ]);
      console.log('[CHAT_DEBUG] Extraction results:', { disease, events });
      setExtractedDisease(disease);
      setExtractedEvents(events);
      setIsBox2Hovered(true); // Keep box 2 solid after extraction

      // Initialize active chat with the extracted information
      try {
        console.log('[CHAT_DEBUG] Initializing active chat with extracted data');
        await initializeActiveChat(caseNotes, labResults, disease, events);
        console.log('[CHAT_DEBUG] Chat initialization successful');
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

  const handleRetrieve = async () => {
    if (!extractedDisease || !extractedEvents.length) return;
    setIsRetrieving(true);
    setIsPromptExpanded(false);
    setArticles([]);
    setCurrentProgress('');
    setTotalArticles(0);
    setCurrentArticleData(null);

    // Create a local variable to store processed articles
    let processedArticles = [];
    console.log('Starting article processing. Current processed articles:', processedArticles.length);

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
                setCurrentProgress('Final analysis complete.');
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
              cancer: analysis.type_of_cancer,
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
      console.error('Error:', error);
      setCurrentProgress('Error retrieving articles. Please try again.');
    } finally {
      setIsRetrieving(false);
      setCurrentArticleData(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DisclaimerModal isOpen={showDisclaimer} onClose={handleCloseDisclaimer} />
      <TopBar 
        user={user}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        isAuthenticated={isAuthenticated}
      />

      <div className="flex flex-1 min-h-0 relative w-full">
        <div className="absolute z-10">
          <ExpandableSidebar
            user={user}
            onChatSelect={handleChatSelect}
            activeChat={activeChat}
            initializeNewChat={initializeNewChat}
          />
        </div>

        <LeftPanel
          caseNotes={caseNotes}
          setCaseNotes={setCaseNotes}
          labResults={labResults}
          setLabResults={setLabResults}
          extractedDisease={extractedDisease}
          extractedEvents={extractedEvents}
          setExtractedDisease={setExtractedDisease}
          setExtractedEvents={setExtractedEvents}
          isProcessing={isProcessing}
          handleExtract={handleExtract}
          isBox2Hovered={isBox2Hovered}
          setIsBox2Hovered={setIsBox2Hovered}
          isLoading={!!currentProgress || hasDocumentMessages}
        />

        <MainPanel
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
          articles={articles}
          currentArticleData={currentArticleData}
          chatHistory={chatHistory}
          isGeneratingSample={isGeneratingSample}
          isLoadingDocs={isLoadingDocs}
          isLoadingAnalysis={isLoadingAnalysis}
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          handleGenerateSampleCase={handleGenerateSampleCase}
          numArticles={numArticles}
          setNumArticles={setNumArticles}
          hasDocumentMessages={hasDocumentMessages}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default MedicalAssistantUI;
