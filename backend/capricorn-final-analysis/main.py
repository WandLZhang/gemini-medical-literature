import functions_framework
from flask import jsonify, request
import vertexai
from google import genai
from google.genai import types
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Vertex AI
vertexai.init(project="gemini-med-lit-review")
client = genai.Client(
    vertexai=True,
    project="gemini-med-lit-review",
    location="us-central1",
)

def create_final_analysis_prompt(case_notes, disease, events, analyzed_articles):
    """Create the prompt for final analysis."""
    
    # Create a table of analyzed articles
    articles_table = []
    for article in analyzed_articles:
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
Type: {article.get('type', 'N/A')}
Events: {events_str}
Drug Results: {drug_results}
Points: {article.get('points', 0)}
Full Text: {article.get('content', 'N/A')}
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
        response = client.models.generate_content(
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
        if not request_json:
            return jsonify({'error': 'No JSON data received'}), 400, headers

        # Extract required fields
        case_notes = request_json.get('case_notes')
        disease = request_json.get('disease')
        events = request_json.get('events')
        analyzed_articles = request_json.get('analyzed_articles')

        if not all([case_notes, disease, events, analyzed_articles]):
            return jsonify({'error': 'Missing required fields'}), 400, headers

        # Create prompt and analyze
        prompt = create_final_analysis_prompt(case_notes, disease, events, analyzed_articles)
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
