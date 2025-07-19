import functions_framework
from flask import jsonify, request
from google import genai
from google.genai import types
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Vertex AI client
client = genai.Client(
    vertexai=True,
    project=os.environ.get('PROJECT_ID', 'gemini-med-lit-review'),
    location=os.environ.get('LOCATION', 'global'),
)

@functions_framework.http
def extract_medical_info(request):
    # Enable CORS
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    headers = {'Access-Control-Allow-Origin': '*'}

    try:
        request_json = request.get_json()
        if not request_json:
            return jsonify({'error': 'No JSON data received'}), 400, headers

        text = request_json.get('text')
        extraction_type = request_json.get('extraction_type', 'disease')  # Default to disease
        specialty = request_json.get('specialty', 'oncology')  # Default to oncology
        prompt_content = request_json.get('prompt_content')

        if not text:
            return jsonify({'error': 'Missing text field'}), 400, headers
            
        if not prompt_content:
            return jsonify({'error': 'Missing prompt_content'}), 400, headers

        # Combine prompt with text
        if extraction_type == 'disease':
            prompt = f"{prompt_content}\n\nCase notes:\n{text}"
        elif extraction_type == 'events':
            prompt = f"{prompt_content}\n\nCase input:\n{text}"
        else:
            return jsonify({'error': f'Unsupported extraction type: {extraction_type}'}), 400, headers

        # Create content for Gemini
        contents = [
            types.Content(
                role="user",
                parts=[{"text": prompt}]
            )
        ]

        # Configure Gemini model
        model = "gemini-2.0-flash-001"
        tools = [types.Tool(google_search=types.GoogleSearch())]
        generate_content_config = types.GenerateContentConfig(
            temperature=1,
            top_p=0.95,
            candidate_count=1,
            max_output_tokens=8192,
            response_modalities=["TEXT"],
            safety_settings=[
                types.SafetySetting(
                    category="HARM_CATEGORY_HATE_SPEECH",
                    threshold="OFF"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold="OFF"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold="OFF"
                ),
                types.SafetySetting(
                    category="HARM_CATEGORY_HARASSMENT",
                    threshold="OFF"
                )
            ],
            tools=tools,
        )

        # Generate response using Gemini
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )

        result = response.text.strip()
        
        # Format the result based on extraction type
        if extraction_type == 'disease':
            output = {
                "result": {
                    "disease": result,
                    "events": []
                }
            }
        elif extraction_type == 'events':
            # Parse the events from quote-separated format
            events = [event.strip(' "\'') for event in result.split('"') if event.strip(' "\'')]
            output = {
                "result": {
                    "disease": "",
                    "events": events
                }
            }
            
        return jsonify(output), 200, headers

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500, headers

if __name__ == "__main__":
    # This is used when running locally only. When deploying to Google Cloud Functions,
    # a webserver will be used to run the app instead
    app = functions_framework.create_app(target="extract_medical_info")
    port = int(os.environ.get('PORT', 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
