import functions_framework
from flask import jsonify, request
import vertexai
from google import genai
from google.genai import types
from google.cloud import bigquery
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize clients
vertexai.init(project="gemini-med-lit-review")
genai_client = genai.Client(
    vertexai=True,
    project="gemini-med-lit-review",
    location="us-central1",
)
bq_client = bigquery.Client(project="playground-439016")

def get_full_articles(analyzed_articles):
    """Retrieve full article content from BigQuery using PMIDs."""
    # Extract PMIDs from articles
    pmids = [article['pmid'] for article in analyzed_articles if 'pmid' in article]
    pmids_str = ', '.join([f"'{pmid}'" for pmid in pmids])
    
    # Query to get full articles by joining pmid_embed_nonzero with pmid_metadata
    query = f"""
    SELECT 
        metadata.PMID,
        base.name as PMCID,  -- This is the PMCID
        base.content
    FROM `playground-439016.pmid_uscentral.pmid_embed_nonzero` base
    JOIN `playground-439016.pmid_uscentral.pmid_metadata` metadata
    ON base.name = metadata.AccessionID  -- Join on PMCID (AccessionID is PMCID)
    WHERE UPPER(metadata.PMID) IN ({','.join([f"'{pmid.upper()}'" for pmid in pmids])})
    """
    
    try:
        query_job = bq_client.query(query)
        results = list(query_job.result())
        
        if not results:
            logger.error(f"No articles found for PMIDs: {pmids}")
            return []
            
        # Create mapping of PMID to content and PMCID (normalize to lowercase pmid)
        content_map = {row['PMID'].lower(): {'content': row['content'], 'PMCID': row['PMCID']} for row in results}
        
        # Update analyzed articles with full content
        articles_with_content = []
        for article in analyzed_articles:
            pmid = article['pmid']
            if pmid in content_map:
                # Preserve all metadata and add full content
                article_with_content = article.copy()
                article_with_content['content'] = content_map[pmid]['content']
                article_with_content['PMCID'] = content_map[pmid]['PMCID']
                articles_with_content.append(article_with_content)
            else:
                logger.warning(f"No content found for pmid: {pmid}")
                
        return articles_with_content
        
    except Exception as e:
        logger.error(f"Error retrieving articles: {str(e)}")
        return []

def create_final_analysis_prompt(case_notes, disease, events, articles):
    """Create the prompt for final analysis."""
    
    # Create a table of analyzed articles
    articles_table = []
    for article in articles:
        # Format drug results as a comma-separated string
        drug_results = ', '.join(article.get('drug_results', [])) if article.get('drug_results') else 'None'
        
        # Format actionable events
        events_str = ', '.join([
            f"{event['event']} ({'matches' if event['matches_query'] else 'no match'})"
            for event in article.get('events', [])
        ])
        
        articles_table.append(f"""
PMID: {article.get('pmid', 'N/A')}
Title: {article.get('title', 'N/A')}
Journal: {article.get('journal_title', 'N/A')} (SJR: {article.get('journal_sjr', 0)})
Year: {article.get('year', 'N/A')}
Type: {article.get('paper_type', 'N/A')}
Cancer Type: {article.get('type_of_cancer', 'N/A')}
Events: {events_str}
Drug Results: {drug_results}
Points: {article.get('overall_points', 0)}
PMCID: {article.get('pmcid', 'N/A')}
Full Text:
{article.get('content', 'N/A')}
{'='*80}
""")

    prompt = f"""You are a pediatric hematologist sitting on a tumor board for patients with complex diseases. Your goal is to find the best treatment for every patient, considering their actionable events (genetic, immune-related, or other).

CASE INFORMATION:
{case_notes}

Disease: {disease}
Actionable Events: {', '.join(events)}

ANALYZED ARTICLES:
{'='*80}
{'\n'.join(articles_table)}
{'='*80}

Based on the clinical input, actionable events, and the analyzed articles above, please provide a comprehensive analysis in the following JSON format:

{{
    "case_summary": "Brief summary of the case",
    "actionable_events": [
        {{
            "event": "Name of the event",
            "explanation": "Short explanation of the event's relevance to the disease",
            "type": "genetic|immune|other",
            "targetable": true/false,
            "prognostic_value": "Description of prognostic significance if any"
        }}
    ],
    "treatment_recommendations": [
        {{
            "actionable_event": "Event being targeted",
            "treatment": "Suggested treatment",
            "evidence": {{
                "pmid": "PMID of the source",
                "link": "https://pubmed.ncbi.nlm.nih.gov/PMID/",
                "summary": "Brief summary of the evidence"
            }},
            "previous_use": {{
                "was_used": true/false,
                "response": "Description of previous response if applicable"
            }},
            "warnings": [
                "Any warnings about sensitivities, adverse events, or allergies"
            ]
        }}
    ],
    "multi_target_opportunities": [
        {{
            "treatment": "Treatment name",
            "targeted_events": ["event1", "event2"],
            "evidence": {{
                "pmid": "PMID of the source",
                "link": "https://pubmed.ncbi.nlm.nih.gov/PMID/",
                "summary": "Summary of evidence for multi-targeting"
            }}
        }}
    ]
}}

IMPORTANT: Return ONLY the raw JSON object. Do not include any explanatory text, markdown formatting, or code blocks."""

    return prompt

def analyze_with_gemini(prompt):
    """Analyze the case and articles using Gemini."""
    model = "gemini-2.0-flash-001"
    generate_content_config = types.GenerateContentConfig(
        temperature=0,
        top_p=0.95,
        max_output_tokens=8192,
        response_modalities=["TEXT"],
        safety_settings=[
            types.SafetySetting(category=cat, threshold="OFF")
            for cat in ["HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_DANGEROUS_CONTENT", 
                      "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_HARASSMENT"]
        ]
    )
    
    contents = [types.Content(role="user", parts=[{"text": prompt}])]
    
    try:
        response = genai_client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )
        
        # Clean up response text
        text = response.text.strip()
        
        # Try to find JSON object
        if '```json' in text:
            text = text.split('```json')[1].split('```')[0].strip()
        elif '{' in text and '}' in text:
            start = text.find('{')
            end = text.rfind('}') + 1
            text = text[start:end]
        
        # Parse JSON
        analysis = json.loads(text)
        return analysis
        
    except Exception as e:
        logger.error(f"Error in analyze_with_gemini: {str(e)}")
        return None

@functions_framework.http
def final_analysis(request):
    """HTTP Cloud Function for final analysis."""
    # Handle CORS
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }

    try:
        request_json = request.get_json()
        logger.info(f"Received request body: {json.dumps(request_json, indent=2)}")
        
        if not request_json:
            logger.error("No JSON data received in request")
            return jsonify({'error': 'No JSON data received'}), 400, headers

        # Extract required fields
        case_notes = request_json.get('case_notes')
        disease = request_json.get('disease')
        events = request_json.get('events')
        analyzed_articles = request_json.get('analyzed_articles')

        # Log each field's presence/absence
        missing_fields = []
        if not case_notes:
            missing_fields.append('case_notes')
        if not disease:
            missing_fields.append('disease')
        if not events:
            missing_fields.append('events')
        if not analyzed_articles:
            missing_fields.append('analyzed_articles')

        if missing_fields:
            error_msg = f"Missing required fields: {', '.join(missing_fields)}"
            logger.error(error_msg)
            return jsonify({'error': error_msg}), 400, headers

        # Log analyzed articles before BigQuery
        logger.info(f"Analyzed articles before BigQuery: {json.dumps(analyzed_articles, indent=2)}")

        # Get full articles from BigQuery while preserving metadata
        articles_with_content = get_full_articles(analyzed_articles)
        
        # Log articles after BigQuery
        logger.info(f"Articles after BigQuery retrieval: {json.dumps(articles_with_content, indent=2)}")
        
        if not articles_with_content:
            logger.error("Failed to retrieve any articles from BigQuery")
            return jsonify({'error': 'Failed to retrieve articles from BigQuery'}), 500, headers

        # Create prompt and analyze
        prompt = create_final_analysis_prompt(case_notes, disease, events, articles_with_content)
        analysis = analyze_with_gemini(prompt)

        if not analysis:
            return jsonify({'error': 'Failed to generate analysis'}), 500, headers

        return jsonify({
            'success': True,
            'analysis': analysis
        }), 200, headers

    except Exception as e:
        logger.error(f"Error in final_analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500, headers

if __name__ == "__main__":
    app = functions_framework.create_app(target="final_analysis")
    app.run(host="0.0.0.0", port=8080, debug=True)
