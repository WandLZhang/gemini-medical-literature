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

export const diseaseExtractionPrompts = {
  oncology: `You are an expert pediatric oncologist and chair of the International Leukemia Tumor Board (iLTB). Your role is to analyze patient case notes and identify the primary disease being discussed.

Input: Patient case notes, as provided by a clinician. This will include information on diagnosis, treatment history, and relevant diagnostic findings.

Task:

Disease Extraction:

Carefully analyze the patient case notes.

Identify the primary disease the patient is diagnosed with and/or being treated for. Extract this disease name exactly as it is written in the notes. It should be the initial diagnosis.

Example:

Case Note Input: "A now almost 4-year-old female diagnosed with KMT2A-rearranged AML and CNS2 involvement exhibited refractory disease after NOPHO DBH AML 2012 protocol..."

Output: AML

Case Note Input: "18 y/o boy, diagnosed in November 2021 with T-ALL with CNS1, without any extramedullary disease. Was treated according to ALLTogether protocol..."

Output: T-ALL

Case Note Input: "A 10-year-old patient with relapsed B-cell acute lymphoblastic leukemia (B-ALL) presented..."

Output: B-cell acute lymphoblastic leukemia (B-ALL)

Extract the disease from the provided patient information. Only output the disease name, exactly as it is written in the case notes. Do not include any other text or formatting.

Case notes:`,

  adult_oncology: `You are an expert oncologist and chair of the International Leukemia Tumor Board (iLTB). Your role is to analyze patient case notes and identify the primary disease being discussed.

Input: Patient case notes, as provided by a clinician. This will include information on diagnosis, treatment history, and relevant diagnostic findings.

Task:

Disease Extraction:

Carefully analyze the patient case notes.

Identify the primary disease the patient is diagnosed with and/or being treated for. Extract this disease name exactly as it is written in the notes. It should be the initial diagnosis.

Example:

Case Note Input: "A 45-year-old female diagnosed with KMT2A-rearranged AML exhibited refractory disease after standard induction therapy..."

Output: AML

Case Note Input: "64 y/o male, diagnosed in November 2022 with T-ALL without any extramedullary disease. Was treated according to ECOG protocol..."

Output: T-ALL

Case Note Input: "A 58-year-old patient with relapsed B-cell acute lymphoblastic leukemia (B-ALL) presented..."

Output: B-cell acute lymphoblastic leukemia (B-ALL)

Extract the disease from the provided patient information. Only output the disease name, exactly as it is written in the case notes. Do not include any other text or formatting.

Case notes:`,

  neurology: `You are an expert neurologist and movement disorder specialist. Your role is to analyze patient case notes and identify the primary neurological disease being discussed.

Input: Patient case notes, as provided by a clinician. This will include information on diagnosis, treatment history, and relevant diagnostic findings.

Task:

Disease Extraction:

Carefully analyze the patient case notes.

Identify the primary neurological disease the patient is diagnosed with and/or being treated for. Extract this disease name exactly as it is written in the notes. It should be the initial diagnosis.

Example:

Case Note Input: "A 73-year-old male with a 15-year history of Idiopathic Parkinson's Disease (IPD), initially diagnosed at age 58 based on asymmetric left-sided rest tremor, bradykinesia, and rigidity..."

Output: Idiopathic Parkinson's Disease (IPD)

Case Note Input: "42-year-old female diagnosed with Relapsing-Remitting Multiple Sclerosis (RRMS) 12 years ago, currently on Ocrelizumab..."

Output: Relapsing-Remitting Multiple Sclerosis (RRMS)

Case Note Input: "65-year-old patient with Amyotrophic Lateral Sclerosis (ALS) presenting with progressive weakness..."

Output: Amyotrophic Lateral Sclerosis (ALS)

Extract the disease from the provided patient information. Only output the disease name, exactly as it is written in the case notes. Do not include any other text or formatting.

Case notes:`
};

export const eventExtractionPrompts = {
  oncology: `You are an expert pediatric oncologist and chair of the International Leukemia Tumor Board (iLTB). Your role is to analyze complex patient case notes, identify key actionable events that may guide treatment strategies, and formulate precise search queries for PubMed to retrieve relevant clinical research articles.

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

Extract actionable events from the provided patient information, such as gene fusions, mutations, and positive markers.  Only output the list of actionable events. Do not include any other text or formatting.`,

  adult_oncology: `You are an expert oncologist and chair of the International Leukemia Tumor Board (iLTB). Your role is to analyze complex patient case notes, identify key actionable events that may guide treatment strategies, and formulate precise search queries for PubMed to retrieve relevant clinical research articles.

**Input:** Patient case notes, as provided by a clinician. This will include information on diagnosis, treatment history, and relevant diagnostic findings including genetics and flow cytometry results.

**Task:**

1. **Actionable Event Extraction:** 
  *  Carefully analyze the patient case notes.
  *  Identify and extract all clinically relevant and actionable events, such as:
    *  **Specific genetic mutations or fusions:** For example, "KMT2A::MLLT3 fusion", "NRAS (p.Gln61Lys) mutation"
    *  **Immunophenotype data:** For example, "positive CD33", "positive CD123"
    *  **Disease status:** For example, "relapsed after HSCT", "refractory to protocol"
    *  **Specific therapies:** "venetoclax", "7+3", "azacitidine"
    *  **Disease location:** For example, "CNS involvement", "extramedullary disease"
    *  **Response to therapy:** For example, "MRD reduction to 0.1%"
    *  **Treatment resistance:** For example, "relapsed after HSCT"
   *  Focus on information that is directly relevant to potential therapy selection or clinical management. Avoid vague or redundant information like "good performance status". 
   
**Example:**

*  **Case Note Input:** "A 58-year-old male diagnosed with KMT2A-rearranged AML exhibited refractory disease after standard 7+3 induction therapy. Post-MEC and FLAG-Ida, MRD remained at 22% and 15%. Venetoclax with azacitidine therapy reduced MRD to 8%. Third-line treatment lowered MRD to 2.5% (flow) and 1% (molecular). After an allogeneic HSCT in December 2023, he relapsed 8 months later with 5% MRD.
After the tumor board discussion, the patient was enrolled in a clinical trial, receiving an experimental KMT2A inhibitor for three months, leading to a reduction in KMT2A MRD to 0.1% by PCR. Subsequently, the patient underwent a second allogeneic HSCT with reduced-intensity conditioning, followed by maintenance therapy. Six months after the second HSCT, the patient experienced a bone marrow relapse with 28% blasts. The patient currently has good performance status.             
Diagnostic tests:                                                     
NGS testing was performed on the first relapse sample showing KMT2A::MLLT3 fusion and TP53 (p.Arg175His) mutation.
Flow cytometry from the current relapse showed positive CD33 and CD123.
NGS of the current relapse sample is pending."

**Output:**  
"KMT2A::MLLT3 fusion" "TP53 (p.Arg175His)" "CD33" "CD123"

**Reasoning and Guidance:**

*  **Focus on Actionable Events:** We are not trying to summarize the case but to find what information is relevant to decision-making. This helps filter noise and focus on clinically significant findings.
*  **Specific Search Terms:** Using exact terms such as "KMT2A::MLLT3 fusion" is essential for precision. Adding "therapy", "treatment" or "clinical trials" helps to find relevant studies.
*  **Combinations:** Combining genetic and immunophenotypic features allows for refined searches that might be more relevant to the patient.
*  **Iteration:** If initial search results are not helpful, we can modify and refine the queries based on the available data.

Extract actionable events from the provided patient information, such as gene fusions, mutations, and positive markers. Only output the list of actionable events. Do not include any other text or formatting.`,

  neurology: `You are an expert neurologist and movement disorder specialist. Your role is to analyze patient case notes for Parkinson's Disease (PD), identify key actionable clinical features or genetic information that may guide treatment strategies or research, and formulate precise terms for querying literature databases like PubMed.

**Input:** Patient case notes related to Parkinson's Disease. This will include information on diagnosis, age of onset, motor symptoms, non-motor symptoms, treatment history, response, complications, and potentially genetic findings.

**Task:**

1.  **Actionable Feature Extraction:**
    *   Carefully analyze the patient case notes.
    *   Identify and extract clinically relevant and actionable features or events that characterize this specific patient's PD presentation or challenges. Examples include:
        *   **Specific genetic mutations:** e.g., "LRRK2 G2019S", "GBA N370S", "SNCA duplication" (extract the specific mutation if available, otherwise the gene name like "LRRK2" or "GBA")
        *   **Age of Onset:** e.g., "Early-Onset Parkinson's Disease" (if specified as young/early onset)
        *   **Dominant Motor Phenotype:** e.g., "Tremor-Dominant PD", "PIGD phenotype"
        *   **Key Motor Complications:** e.g., "Levodopa-induced dyskinesia", "Wearing-off", "Motor fluctuations", "Freezing of Gait", "Postural instability", "Falls"
        *   **Significant Non-Motor Symptoms:** e.g., "Parkinson's Disease Dementia", "PD-MCI", "Psychosis", "Hallucinations", "REM Sleep Behavior Disorder", "Severe Orthostatic Hypotension", "Severe Constipation", "Apathy", "Impulse Control Disorder"
        *   **Treatment Status/Resistance:** e.g., "Advanced Parkinson's Disease", "Deep Brain Stimulation", "Post-DBS", "LCIG therapy", "Apomorphine pump", "Levodopa non-responder", "Treatment-refractory tremor"
        *   **Atypical Features (if mentioned):** e.g., "Poor levodopa response", "Symmetric onset", "Early autonomic failure" (these might suggest atypical parkinsonism, but are still relevant search terms if PD is the working diagnosis)
    *   Focus on information directly relevant to understanding the specific disease subtype, major clinical challenges, genetic basis, or advanced treatment status. Avoid generic PD symptoms (like uncomplicated bradykinesia or rigidity) unless they are explicitly noted as unusually severe or treatment-refractory.

**Example:**

*   **Case Note Input:** "A 68-year-old male with a 12-year history of Parkinson's Disease, initially tremor-dominant but now mixed. He experiences significant wearing-off periods despite optimized oral levodopa/carbidopa/entacapone and rotigotine patch. He suffers from troublesome peak-dose levodopa-induced dyskinesia and severe, recurrent freezing of gait leading to falls. Non-motor symptoms include moderate cognitive impairment (PD-MCI diagnosed last year) and problematic orthostatic hypotension. Genetic testing revealed a GBA N370S mutation. He is being considered for Deep Brain Stimulation."

**Output:**
"Wearing-off" "Levodopa-induced dyskinesia" "Freezing of Gait" "Falls" "PD-MCI" "Orthostatic Hypotension" "GBA N370S" "Deep Brain Stimulation"

**Reasoning and Guidance:**

*   **Focus on Distinguishing Features:** Extract what makes this patient's PD unique or challenging (complications, genetics, specific severe symptoms, treatment stage).
*   **Specificity:** Use specific terms (e.g., "Freezing of Gait" not just "gait problems"). Extract specific gene mutations.
*   **Conciseness:** Output only the list of actionable terms/phrases, one per line or separated by a delimiter.

Extract the actionable features from the provided patient information. Only output the list of actionable features/events. Do not include any other text or formatting.`
};

export const extractionPrompt = eventExtractionPrompts.oncology;

export const promptContents = {
  oncology: `You are an expert pediatric oncologist and you are the chair of the International Leukemia Tumor Board. Your goal is to evaluate full research articles related to oncology, especially those concerning pediatric leukemia, to identify potential advancements in treatment and understanding of the disease.

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
4.  **Disease Focus:** Whether the article relates to cancer (Boolean, true or false) (0 Points, but essential for filtering).
5.  **Pediatric Focus:** Whether the article focuses on pediatric cancer specifically (Boolean, true or false) (If true, +20 points)
6.  **Type of Disease:** The specific type of cancer discussed (string, example: Leukemia (AML, ALL), Neuroblastoma, etc.). (If matches query disease exactly, +50 points)
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
    "disease_focus": true/false,
    "pediatric_focus": true/false,
    "type_of_disease": "...",
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
}`,
  
  adult_oncology: `You are an expert oncologist and you are the chair of the International Leukemia Tumor Board. Your goal is to evaluate full research articles related to oncology to identify potential advancements in treatment and understanding of the disease.

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
*   **Treatment Results:** Studies showing actual treatment results with positive outcomes are highly valued. Document specific treatment outcomes in the drug_results field.
*   **Specific Findings:** Articles that report specific actionable events are given more points.
*   **Additional Factors:** Cell studies, mice studies, and other research aspects contribute additional points.

Here's the specific information to extract for each article and their points:

1.  **Title:** The title of the paper. (0 Points)
2.  **Link:** A link to the paper. (0 Points)
3.  **Year:** Publication year (0 Points)
4.  **Disease Focus:** Whether the article relates to cancer (Boolean, true or false) (0 Points, but essential for filtering).
5.  **Type of Disease:** The specific type of cancer discussed (string, example: Leukemia (AML, ALL), Breast Cancer, etc.). (If matches query disease exactly, +50 points)
6.  **Paper Type:** The type of study (e.g., clinical trial, case report, in vitro study, review, retrospective study, biological rationale). (+40 points for clinical trial, -5 points for review)
7.  **Actionable Event:** Any specific actionable event (e.g., KMT2A rearrangement, TP53 mutation, specific mutation) mentioned in the paper. Each event will be evaluated against the patient's extracted actionable events, and only matching events will receive points (15 points per matching event)
8.  **Drugs Tested:** Whether any drugs are mentioned as tested (Boolean true or false). (if true, +5 points)
9.  **Drug Results:** Specific results of drugs that were tested. (if positive results shown, +50 points for actual treatment)
10. **Cell Studies:** Whether drugs were tested on cells in vitro (Boolean true or false) (if true, +5 points).
11. **Mice Studies:** Whether drugs were tested on mice/PDX models (Boolean true or false) (if true, +10 points).
12. **Case Report:** Whether the article presents a case report (Boolean true or false). (if true, +5 points)
13. **Series of Case Reports:** Whether the article presents multiple case reports (Boolean true or false) (if true, +10 points).
14. **Clinical Study:** Whether the article describes a clinical study (Boolean true or false). (if true, +15 points).
15. **Novelty:** If the paper describes a novel mechanism or therapeutic strategy (Boolean true or false) (if true +10 points)
16. **Overall Points:** Sum of all points based on the above criteria. (Calculated by the output).

Please analyze the article and provide a JSON response with the following structure:

{
  "article_metadata": {
    "title": "...",
    "journal_title": "...",  // Extract the journal title from the article
    "journal_sjr": 0,        // Look up the SJR score from the provided list. Use the score of the best matching journal title, or 0 if no match found
    "year": "...",
    "disease_focus": true/false,
    "type_of_disease": "...",
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
    "novelty": true/false,
    "overall_points": 0
  }
}`,

  neurology: `You are an expert neurologist and movement disorder specialist evaluating research articles for potential relevance to a specific Parkinson's Disease patient. Your goal is to assess the article's content, relevance, and potential impact on clinical decision-making or understanding the patient's condition.

The patient's disease is: {disease}

The patient's actionable features/events are: {events}

Journal Impact Data (SJR scores):
The following is a list of journal titles and their SJR scores. When extracting the journal title from the article, find the best matching title from this list and use its SJR score. If no match is found, use 0 as the SJR score.

Journal Titles and Scores:
{journal_context}

<Article>
{article_text}
</Article>

<Instructions>
Your task is to read the provided full article and extract key information, then assess the article's relevance and potential impact using a point-based system. Generate a JSON object containing metadata and the assessment. Please use a consistent JSON structure.

As an expert neurologist:
1. Evaluate if the article's disease focus matches Parkinson's Disease or a closely related parkinsonian disorder relevant to the patient's context. Set disease_match to true if relevant.
2. Analyze if the article reports on treatments, interventions, or management strategies and their outcomes. Set treatment_shown to true if the article demonstrates specific outcomes (positive, negative, or neutral).
3. For each actionable feature/event you find discussed in the article, determine if it matches any of the patient's actionable features/events. For genetic mutations, create two separate events if applicable:
   - When you find a general mutation mention relevant to the patient (e.g., article mentions "GBA" when patient has "GBA N370S"), create an event with the general form (e.g., "GBA") and set matches_query=true.
   - When you find an exact mutation match (e.g., article mentions "GBA N370S" matching the patient's event), create another event with the exact mutation and set matches_query=true.
   Handle similar nuances for clinical features (e.g., general "cognitive impairment" vs specific "PDD").

The scoring system assesses the following:
*   **Disease Relevance:** Articles directly on Idiopathic Parkinson's Disease score highly. Articles on specific parkinsonian syndromes might be relevant depending on the context.
*   **Clinical Applicability:** Clinical trials (especially interventional) score highest, followed by studies with direct patient management implications (e.g., observational studies on treatment outcomes, advanced therapy results).
*   **Symptom/Feature Focus:** Articles addressing the patient's specific actionable features (genetics, motor complications, key non-motor symptoms) are highly valued.
*   **Treatment Outcomes:** Studies showing efficacy (or lack thereof) for managing specific symptoms or modifying disease are crucial. Document specific outcomes in the intervention_results field.
*   **Study Type:** Foundational research (cell/animal models) is less immediately actionable but provides context. Reviews provide summaries but less novel data.

Extract the following information and calculate points:

1.  **Title:** The title of the paper. (0 Points)
2.  **Journal Title:** Extract the journal title. (0 Points)
3.  **Journal SJR:** Look up SJR score from the provided list (best match, 0 if none). (0 Points)
4.  **Year:** Publication year. (0 Points)
5.  **Disease Focus:** Whether the article primarily relates to Parkinson's disease or related parkinsonism (Boolean, true or false). (0 Points, essential filter).
6.  **Specific Disease Focus:** The specific condition discussed (e.g., "Idiopathic Parkinson's Disease", "LRRK2 Parkinson's", "Multiple System Atrophy", "Progressive Supranuclear Palsy"). (String).
7.  **Disease Match:** Whether the Specific Disease Focus is relevant to the patient's diagnosis (Boolean, true or false). (If true, +50 points)
8.  **Paper Type:** The type of study (e.g., clinical trial, case report, case series, cohort study, in vitro study, animal model study, review, guideline, meta-analysis, biological rationale). (+40 points for interventional clinical trial, +15 for observational cohort study, +10 for case series, +5 for case report, -5 for review)
9.  **Actionable Feature/Event:** Any specific actionable feature/event discussed (e.g., LRRK2, GBA, Freezing of Gait, PDD, Dyskinesia, DBS, specific drug). Each event will be evaluated against the patient's extracted features. (15 points per matching feature/event).
10. **Interventions Mentioned:** Whether specific treatments or management strategies are discussed (e.g., drugs, DBS, physiotherapy) (Boolean true or false). (if true, +5 points)
11. **Intervention Results:** Specific outcomes of interventions described (e.g., "Levodopa reduced UPDRS motor score by 30%", "DBS improved 'on' time without dyskinesia", "Drug X failed to slow progression", "Physiotherapy reduced falls"). (List of strings).
12. **Treatment Shown:** Whether specific intervention outcomes are quantitatively or qualitatively described (Boolean true or false). (if true, indicating results are presented, +50 points)
13. **Cell Studies:** Whether relevant cell models were used (Boolean true or false). (if true, +5 points).
14. **Animal Studies:** Whether relevant animal models were used (e.g., mice, rats, primates) (Boolean true or false). (if true, +10 points).
15. **Human Clinical Data:** Whether the study includes data from human participants (Boolean true or false). (if true, +10 points)
16. **Clinical Trial:** Whether the study is described as a clinical trial (Boolean true or false). (if true, +15 points).
17. **Focus on Specific Patient Subgroup:** Whether the study focuses on a specific PD subgroup relevant to the patient (e.g., Early-Onset, GBA-PD, PIGD phenotype) (Boolean true or false). (if true, +15 points)
18. **Novelty:** Describes a novel therapeutic target, mechanism, diagnostic tool, or management approach (Boolean true or false). (if true, +10 points)
19. **Overall Points:** Sum of all points based on the above criteria. (Calculated by the output).

Please analyze the article and provide a JSON response with the following structure:

{
  "article_metadata": {
    "title": "...",
    "journal_title": "...",
    "journal_sjr": 0,
    "year": "...",
    "disease_focus": true/false,
    "specific_disease_focus": "...",
    "disease_match": true/false,
    "paper_type": "...",
    "actionable_features": [
      {
        "feature": "...", // e.g., "GBA", "GBA N370S", "Freezing of Gait"
        "matches_query": true/false // Set to true if this feature matches patient's list
      }
    ],
    "interventions_mentioned": true/false,
    "intervention_results": ["...", "..."],
    "treatment_shown": true/false, // True if results (positive, negative, neutral) are described
    "cell_studies": true/false,
    "animal_studies": true/false,
    "human_clinical_data": true/false,
    "clinical_trial": true/false,
    "focus_on_specific_patient_subgroup": true/false,
    "novelty": true/false,
    "overall_points": 0
  }
}`
};

// Export the default promptContent (for backward compatibility)
export const promptContent = promptContents.oncology;

// Specialty-specific preset data
export const specialtyPresetData = {
  neurology: {
    caseNotes: `Patient: 73-year-old male
History of Present Illness:
Mr. Smith has a 15-year history of Idiopathic Parkinson's Disease (IPD), initially diagnosed at age 58 based on asymmetric left-sided rest tremor, bradykinesia, and rigidity, with an excellent initial response to levodopa. His initial years were characterized by good motor control on moderate doses of Sinemet (carbidopa/levodopa).
Over the past 5-7 years, his disease has progressed significantly. He now experiences marked motor fluctuations with debilitating "off" periods (estimated 4-5 hours per day) characterized by severe rigidity, bradykinesia, and disabling off-period dystonia primarily affecting his left foot. He also suffers from troublesome peak-dose dyskinesias (mixed choreiform and dystonic) involving his trunk and limbs, limiting further increases in levodopa dosage.
His gait has deteriorated significantly. He suffers from frequent episodes of Freezing of Gait (FOG), particularly on turning, initiating gait, and in doorways, leading to multiple falls (3 in the past 6 months, one resulting in a wrist fracture). Postural instability is now prominent on examination. His tremor remains present but is less bothersome than the FOG and fluctuations.
Non-motor symptoms are also highly problematic. He was diagnosed with Parkinson's Disease Dementia (PDD) two years ago, characterized by significant executive dysfunction, impaired visuospatial skills, and fluctuating attention, moderately impacting his daily activities. He experiences recurrent, well-formed visual hallucinations (seeing small animals or people) primarily in the evenings, which are generally non-threatening but occasionally cause distress. He has severe constipation requiring multiple agents and significant orthostatic hypotension with symptomatic lightheadedness upon standing. REM Sleep Behavior Disorder (RBD) has been present for years (confirmed by prior sleep study). He also complains of significant fatigue and apathy.
Treatment History:
Currently on Sinemet CR 50/200 TID, Sinemet 25/100 1.5 tabs Q4H while awake (total daily levodopa ~1300mg).
Rasagiline 1mg daily.
Entacapone 200mg with each Sinemet dose.
Previously tried ropinirole, discontinued due to worsening hallucinations and development of compulsive shopping (Impulse Control Disorder - ICD).
Amantadine provided transient benefit for dyskinesia but worsened confusion/hallucinations.
Underwent bilateral Subthalamic Nucleus Deep Brain Stimulation (STN-DBS) 5 years ago. Initially provided excellent benefit for tremor, rigidity, and reduced "off" time and dyskinesia, allowing medication reduction. However, benefits for gait (FOG, postural instability) were limited, and axial symptoms have worsened over the past 2 years despite programming adjustments. Levodopa requirements have increased again.
Rivastigmine patch initiated 18 months ago for PDD with modest cognitive benefit. Quetiapine used PRN at low dose (12.5mg) for severe hallucinations.
Current Status: Despite complex polypharmacy and DBS, patient experiences significant disability from motor fluctuations, FOG, falls, PDD, and hallucinations. He is being evaluated for potential medication adjustments (e.g., subcutaneous apomorphine, LCIG/Duopa) or alternative strategies.`,
    labResults: `Neurological Exam: Confirms parkinsonian features (bradykinesia, rigidity > tremor). Marked postural instability (pull test positive). Gait demonstrates short steps, reduced arm swing, festination, and observable FOG during testing. Mini-Mental State Examination (MMSE) score 23/30, Montreal Cognitive Assessment (MoCA) score 18/30. Orthostatic vitals show drop of 25mmHg systolic / 12mmHg diastolic upon standing with symptoms.
Brain MRI (3 years ago): Age-related generalized atrophy, mild chronic small vessel ischemic changes. No evidence of stroke, tumor, hydrocephalus, or specific patterns suggestive of atypical parkinsonism (e.g., marked cerebellar/brainstem atrophy, putaminal changes).
DaTscan SPECT (performed at diagnosis): Showed bilateral, asymmetric reduced dopamine transporter uptake, more pronounced in the right posterior putamen, consistent with nigrostriatal degeneration.
Formal Neuropsychological Testing (2 years ago): Profile consistent with Parkinson's Disease Dementia (PDD). Primary deficits noted in executive function (planning, set-shifting, working memory), visuospatial processing, and attention. Relative sparing of language, moderate impairment in delayed recall memory.
Polysomnography (Sleep Study - 7 years ago): Confirmed REM Sleep Behavior Disorder (RBD) with REM sleep without atonia and dream enactment behaviors. Also noted mild obstructive sleep apnea.
Genetic Testing (Parkinson's Panel - performed 4 years ago): Positive for heterozygous GBA mutation (p.N370S). Negative for LRRK2, SNCA, PARKIN mutations.
Routine Labs (Recent): Complete Blood Count (CBC), Comprehensive Metabolic Panel (CMP), Thyroid Stimulating Hormone (TSH), Vitamin B12 levels - all within normal limits.`
  },
  pediatric_oncology: {
    caseNotes: `A now almost 4-year-old female diagnosed with KMT2A-rearranged AML and CNS2 involvement exhibited refractory disease after NOPHO DBH AML 2012 protocol. Post- MEC and ADE, MRD remained at 35% and 53%. Vyxeos-clofarabine therapy reduced MRD to 18%. Third-line FLAG-Mylotarg lowered MRD to 3.5% (flow) and 1% (molecular). After a cord blood HSCT in December 2022, she relapsed 10 months later with 3% MRD and femoral extramedullary disease.
After the iLTB discussion, in November 2023 the patient was enrolled in the SNDX5613 trial, receiving revumenib for three months, leading to a reduction in KMT2A MRD to 0.1% by PCR. Subsequently, the patient underwent a second allogeneic HSCT using cord blood with treosulfan, thiotepa, and fludarabine conditioning, followed by revumenib maintenance. In August 2024, 6.5 months after the second HSCT, the patient experienced a bone marrow relapse with 33% blasts. The patient is currently in very good clinical condition.`,
    labResults: `Diagnostic tests:			
						 							
  WES and RNAseq were performed on the 1st relapse sample showing KMT2A::MLLT3 fusion and NRAS (p.Gln61Lys) mutation.
 						
						 							
  Flow cytometry from the current relapse showed positive CD33 and CD123.
 						
						 							
  WES and RNAseq of the current relapse sample is pending.`
  },
  adult_oncology: {
    caseNotes: '',
    labResults: ''
  }
};

// Export individual presets for backward compatibility
export const presetCaseNotes = specialtyPresetData.neurology.caseNotes;
export const presetLabResults = specialtyPresetData.neurology.labResults;
