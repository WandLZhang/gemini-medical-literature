import functions_framework
from flask import jsonify
from google.cloud import dlp_v2
from google import genai
from google.genai import types
import json
import logging
import re
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize DLP client
dlp_client = dlp_v2.DlpServiceClient()

# Initialize Gemini client
client = genai.Client(
    vertexai=True,
    project="gemini-med-lit-review",
    location="us-central1",
)

def get_info_types():
    """Get list of info types to redact, excluding age, gender, medical terms, and document types."""
    all_types = [
        info_type for info_type in [
        {"name": "FINANCIAL_ID"},
        {"name": "FRANCE_DRIVERS_LICENSE_NUMBER"},
        {"name": "MEXICO_CURP_NUMBER"},
        {"name": "ORGANIZATION_NAME"},
        {"name": "DOD_ID_NUMBER"},
        {"name": "STORAGE_SIGNED_POLICY_DOCUMENT"},
        {"name": "KOREA_PASSPORT"},
        {"name": "HONG_KONG_ID_NUMBER"},
        {"name": "EMAIL_ADDRESS"},
        {"name": "IRELAND_EIRCODE"},
        {"name": "TAIWAN_ID_NUMBER"},
        {"name": "COUNTRY_DEMOGRAPHIC"},
        {"name": "SPAIN_CIF_NUMBER"},
        {"name": "US_ADOPTION_TAXPAYER_IDENTIFICATION_NUMBER"},
        {"name": "RELIGIOUS_TERM"},
        {"name": "SSL_CERTIFICATE"},
        {"name": "INDONESIA_NIK_NUMBER"},
        {"name": "BRAZIL_CPF_NUMBER"},
        {"name": "HTTP_USER_AGENT"},
        {"name": "AZURE_AUTH_TOKEN"},
        {"name": "STREET_ADDRESS"},
        {"name": "LOCATION"},
        {"name": "GCP_CREDENTIALS"},
        {"name": "WEAK_PASSWORD_HASH"},
        {"name": "POLITICAL_TERM"},
        {"name": "CANADA_QUEBEC_HIN"},
        {"name": "PORTUGAL_NIB_NUMBER"},
        {"name": "VEHICLE_IDENTIFICATION_NUMBER"},
        {"name": "CHILE_CDI_NUMBER"},
        {"name": "US_BANK_ROUTING_MICR"},
        {"name": "AUTH_TOKEN"},
        {"name": "SINGAPORE_NATIONAL_REGISTRATION_ID_NUMBER"},
        {"name": "PORTUGAL_SOCIAL_SECURITY_NUMBER"},
        {"name": "UK_NATIONAL_INSURANCE_NUMBER"},
        {"name": "CHINA_PASSPORT"},
        {"name": "ARGENTINA_DNI_NUMBER"},
        {"name": "DOCUMENT_TYPE/R&D/SOURCE_CODE"},
        {"name": "AMERICAN_BANKERS_CUSIP_ID"},
        {"name": "AWS_CREDENTIALS"},
        {"name": "SCOTLAND_COMMUNITY_HEALTH_INDEX_NUMBER"},
        {"name": "ADVERTISING_ID"},
        {"name": "VAT_NUMBER"},
        {"name": "OAUTH_CLIENT_SECRET"},
        {"name": "INDONESIA_PASSPORT"},
        {"name": "HTTP_COOKIE"},
        {"name": "BELGIUM_NATIONAL_ID_CARD_NUMBER"},
        {"name": "ITALY_FISCAL_CODE"},
        {"name": "POLAND_PASSPORT"},
        {"name": "MARITAL_STATUS"},
        {"name": "PARAGUAY_TAX_NUMBER"},
        {"name": "SOUTH_AFRICA_ID_NUMBER"},
        {"name": "MAC_ADDRESS"},
        {"name": "SEXUAL_ORIENTATION"},
        {"name": "SWEDEN_PASSPORT"},
        {"name": "US_SOCIAL_SECURITY_NUMBER"},
        {"name": "US_STATE"},
        {"name": "ENCRYPTION_KEY"},
        {"name": "DOCUMENT_TYPE/HR/RESUME"},
        {"name": "PORTUGAL_CDC_NUMBER"},
        {"name": "UK_DRIVERS_LICENSE_NUMBER"},
        {"name": "INDIA_AADHAAR_INDIVIDUAL"},
        {"name": "US_INDIVIDUAL_TAXPAYER_IDENTIFICATION_NUMBER"},
        {"name": "DOCUMENT_TYPE/LEGAL/COURT_ORDER"},
        {"name": "US_DEA_NUMBER"},
        {"name": "TINK_KEYSET"},
        {"name": "IMSI_ID"},
        {"name": "EMPLOYMENT_STATUS"},
        {"name": "SWITZERLAND_SOCIAL_SECURITY_NUMBER"},
        {"name": "US_PASSPORT"},
        {"name": "CANADA_BANK_ACCOUNT"},
        {"name": "US_HEALTHCARE_NPI"},
        {"name": "SECURITY_DATA"},
        {"name": "UK_ELECTORAL_ROLL_NUMBER"},
        {"name": "DOCUMENT_TYPE/LEGAL/LAW"},
        {"name": "NORWAY_NI_NUMBER"},
        {"name": "KOREA_ARN"},
        {"name": "GERMANY_PASSPORT"},
        {"name": "AUSTRALIA_DRIVERS_LICENSE_NUMBER"},
        {"name": "LOCATION_COORDINATES"},
        {"name": "IRELAND_DRIVING_LICENSE_NUMBER"},
        {"name": "AUSTRALIA_MEDICARE_NUMBER"},
        {"name": "URUGUAY_CDI_NUMBER"},
        {"name": "POLAND_PESEL_NUMBER"},
        {"name": "GOVERNMENT_ID"},
        {"name": "DOCUMENT_TYPE/FINANCE/SEC_FILING"},
        {"name": "TIME"},
        {"name": "SPAIN_NIE_NUMBER"},
        {"name": "IMEI_HARDWARE_ID"},
        {"name": "POLAND_NATIONAL_ID_NUMBER"},
        {"name": "JSON_WEB_TOKEN"},
        {"name": "ETHNIC_GROUP"},
        {"name": "DOCUMENT_TYPE/LEGAL/PLEADING"},
        {"name": "CREDIT_CARD_TRACK_NUMBER"},
        {"name": "GERMANY_DRIVERS_LICENSE_NUMBER"},
        {"name": "FINLAND_BUSINESS_ID"},
        {"name": "MAC_ADDRESS_LOCAL"},
        {"name": "FRANCE_PASSPORT"},
        {"name": "CANADA_SOCIAL_INSURANCE_NUMBER"},
        {"name": "FEMALE_NAME"},
        {"name": "ITALY_PASSPORT"},
        {"name": "US_EMPLOYER_IDENTIFICATION_NUMBER"},
        {"name": "KOREA_RRN"},
        {"name": "DOCUMENT_TYPE/R&D/PATENT"},
        {"name": "KAZAKHSTAN_PASSPORT"},
        {"name": "AUSTRALIA_PASSPORT"},
        {"name": "CREDIT_CARD_EXPIRATION_DATE"},
        {"name": "PERU_DNI_NUMBER"},
        {"name": "COLOMBIA_CDC_NUMBER"},
        {"name": "GENERIC_ID"},
        {"name": "SPAIN_NIF_NUMBER"},
        {"name": "DENMARK_CPR_NUMBER"},
        {"name": "SPAIN_SOCIAL_SECURITY_NUMBER"},
        {"name": "SPAIN_DRIVERS_LICENSE_NUMBER"},
        {"name": "GEOGRAPHIC_DATA"},
        {"name": "US_DRIVERS_LICENSE_NUMBER"},
        {"name": "PHONE_NUMBER"},
        {"name": "PASSPORT"},
        {"name": "IRELAND_PASSPORT"},
        {"name": "GERMANY_SCHUFA_ID"},
        {"name": "STORAGE_SIGNED_URL"},
        {"name": "MALE_NAME"},
        {"name": "MEDICAL_RECORD_NUMBER"},
        {"name": "TRADE_UNION"},
        {"name": "LAST_NAME"},
        {"name": "URL"},
        {"name": "NEW_ZEALAND_IRD_NUMBER"},
        {"name": "FINLAND_NATIONAL_ID_NUMBER"},
        {"name": "SWIFT_CODE"},
        {"name": "SINGAPORE_PASSPORT"},
        {"name": "JAPAN_CORPORATE_NUMBER"},
        {"name": "DEMOGRAPHIC_DATA"},
        {"name": "THAILAND_NATIONAL_ID_NUMBER"},
        {"name": "CANADA_OHIP"},
        {"name": "DOCUMENT_TYPE/FINANCE/REGULATORY"},
        {"name": "JAPAN_DRIVERS_LICENSE_NUMBER"},
        {"name": "XSRF_TOKEN"},
        {"name": "DOMAIN_NAME"},
        {"name": "FRANCE_NIR"},
        {"name": "NETHERLANDS_BSN_NUMBER"},
        {"name": "FRANCE_TAX_IDENTIFICATION_NUMBER"},
        {"name": "AZERBAIJAN_PASSPORT"},
        {"name": "INDIA_GST_INDIVIDUAL"},
        {"name": "PERSON_NAME"},
        {"name": "CANADA_DRIVERS_LICENSE_NUMBER"},
        {"name": "JAPAN_BANK_ACCOUNT"},
        {"name": "JAPAN_INDIVIDUAL_NUMBER"},
        {"name": "NEW_ZEALAND_NHI_NUMBER"},
        {"name": "UK_PASSPORT"},
        {"name": "VENEZUELA_CDI_NUMBER"},
        {"name": "PARAGUAY_CIC_NUMBER"},
        {"name": "JAPAN_PASSPORT"},
        {"name": "DOCUMENT_TYPE/R&D/DATABASE_BACKUP"},
        {"name": "TAIWAN_PASSPORT"},
        {"name": "UK_TAXPAYER_REFERENCE"},
        {"name": "SPAIN_DNI_NUMBER"},
        {"name": "INDIA_PAN_INDIVIDUAL"},
        {"name": "DATE"},
        {"name": "IRELAND_PPSN"},
        {"name": "BASIC_AUTH_HEADER"},
        {"name": "ARMENIA_PASSPORT"},
        {"name": "DOCUMENT_TYPE/R&D/SYSTEM_LOG"},
        {"name": "PASSWORD"},
        {"name": "FRANCE_CNI"},
        {"name": "AUSTRALIA_TAX_FILE_NUMBER"},
        {"name": "US_PREPARER_TAXPAYER_IDENTIFICATION_NUMBER"},
        {"name": "US_VEHICLE_IDENTIFICATION_NUMBER"},
        {"name": "US_TOLLFREE_PHONE_NUMBER"},
        {"name": "DOCUMENT_TYPE/LEGAL/BLANK_FORM"},
        {"name": "ICCID_NUMBER"},
        {"name": "FIRST_NAME"},
        {"name": "UKRAINE_PASSPORT"},
        {"name": "MEXICO_PASSPORT"},
        {"name": "NETHERLANDS_PASSPORT"},
        {"name": "CHINA_RESIDENT_ID_NUMBER"},
        {"name": "CANADA_PASSPORT"},
        {"name": "UZBEKISTAN_PASSPORT"},
        {"name": "DATE_OF_BIRTH"},
        {"name": "CREDIT_CARD_NUMBER"},
        {"name": "TURKEY_ID_NUMBER"},
        {"name": "CROATIA_PERSONAL_ID_NUMBER"},
        {"name": "US_MEDICARE_BENEFICIARY_ID_NUMBER"},
        {"name": "TECHNICAL_ID"},
        {"name": "GERMANY_TAXPAYER_IDENTIFICATION_NUMBER"},
        {"name": "CANADA_BC_PHN"},
        {"name": "BELARUS_PASSPORT"},
        {"name": "KOREA_DRIVERS_LICENSE_NUMBER"},
        {"name": "GCP_API_KEY"},
        {"name": "ISRAEL_IDENTITY_CARD_NUMBER"},
        {"name": "INDIA_PASSPORT"},
        {"name": "CVV_NUMBER"},
        {"name": "DRIVERS_LICENSE_NUMBER"},
        {"name": "UK_NATIONAL_HEALTH_SERVICE_NUMBER"},
        {"name": "SPAIN_PASSPORT"},
        {"name": "RUSSIA_PASSPORT"},
        {"name": "GERMANY_IDENTITY_CARD_NUMBER"},
        {"name": "IMMIGRATION_STATUS"},
        {"name": "IP_ADDRESS"},
        {"name": "SWEDEN_NATIONAL_ID_NUMBER"},
        {"name": "FINANCIAL_ACCOUNT_NUMBER"},
        {"name": "IBAN_CODE"}
    ] if info_type["name"] != "DATE_OF_BIRTH"
    ]

def standardize_date(date_string):
    prompt = f"""
    Convert the following date to YYYY-MM-DD format: {date_string}
    
    Respond with ONLY the standardized date in YYYY-MM-DD format.
    If the date cannot be converted, respond with 'INVALID'.
    """
    
    contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
    
    generate_content_config = types.GenerateContentConfig(
        temperature=0,
        top_p=1,
        max_output_tokens=20,
        response_modalities=["TEXT"],
    )
    
    response = client.models.generate_content(
        model="gemini-2.0-flash-001",
        contents=contents,
        config=generate_content_config
    )
    
    standardized_date = response.text.strip()
    if standardized_date == 'INVALID':
        raise ValueError("Invalid date format")
    return standardized_date

def calculate_age(birth_date):
    today = datetime.now()
    birth_date = datetime.strptime(birth_date, "%Y-%m-%d")
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    return age

def deidentify_content(project_id, text):
    """Deidentify sensitive content using DLP API and Gemini for date processing."""
    if not text:
        return text

    print(f"Original text: {text}")

    # Regex pattern for potential dates (this is a simple example and may need refinement)
    date_pattern = r'\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{2,4}[-/]\d{1,2}[-/]\d{1,2})\b'
    
    def replace_date(match):
        original_date = match.group(0)
        try:
            standardized_date = standardize_date(original_date)
            age = calculate_age(standardized_date)
            print(f"Date processing: Converted '{original_date}' to 'Age: {age}'")
            return f"Age: {age}"
        except Exception as e:
            print(f"Date processing error: Failed to process '{original_date}'. Error: {str(e)}")
            return original_date

    # Replace dates with ages
    text = re.sub(date_pattern, replace_date, text)

    print(f"Text after date replacement: {text}")

    # Get info types for redaction
    info_types = get_info_types()
    print(f"Info types used for redaction: {[t['name'] for t in info_types]}")

    # Proceed with DLP API redaction
    deidentify_config = {
        "info_type_transformations": {
            "transformations": [
                {
                    "primitive_transformation": {
                        "replace_config": {
                            "new_value": {
                                "string_value": "[REDACTED]"
                            }
                        }
                    }
                }
            ]
        }
    }

    inspect_config = {
        "info_types": info_types,
        "min_likelihood": dlp_v2.Likelihood.LIKELY,
        "include_quote": True,
    }

    item = {"value": text}
    parent = f"projects/{project_id}"
    request = {
        "parent": parent,
        "deidentify_config": deidentify_config,
        "inspect_config": inspect_config,
        "item": item,
    }

    try:
        response = dlp_client.deidentify_content(request=request)
        
        print("DLP API Response:")
        if hasattr(response, 'overview') and hasattr(response.overview, 'transformed_overview'):
            for transformation in response.overview.transformed_overview.transformation_summaries:
                print(f"  Info type found: {transformation.info_type.name}")
                print(f"  Occurrences: {transformation.transformed_count}")
                if hasattr(transformation, 'transformed_bytes'):
                    print(f"  Transformed bytes: {transformation.transformed_bytes}")
        else:
            print("  No transformation overview available in the response.")
        
        print(f"Final redacted text: {response.item.value}")
        return response.item.value
    except Exception as e:
        print(f"Error in deidentify_content: {str(e)}")
        return None  # Return None instead of raising an exception

@functions_framework.http
def redact_sensitive_info(request):
    """HTTP Cloud Function for redacting sensitive information."""
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

    debug_info = []

    def capture_print(message):
        debug_info.append(str(message))

    try:
        request_json = request.get_json()
        logger.info("Received request for redaction")
        
        if not request_json:
            logger.error("No JSON data received in request")
            return jsonify({'error': 'No JSON data received'}), 400, headers

        # Extract text to redact
        text = request_json.get('text')
        if not text:
            logger.error("No text provided for redaction")
            return jsonify({'error': 'No text provided'}), 400, headers

        # Redirect print statements to capture_print
        import builtins
        original_print = builtins.print
        builtins.print = capture_print

        # Redact sensitive information
        project_id = "gemini-med-lit-review"  # Your GCP project ID
        redacted_text = deidentify_content(project_id, text)

        # Restore original print function
        builtins.print = original_print

        if redacted_text is None:
            return jsonify({
                'success': False,
                'error': 'Failed to redact text',
                'debugInfo': debug_info
            }), 500, headers

        return jsonify({
            'success': True,
            'redactedText': redacted_text,
            'debugInfo': debug_info
        }), 200, headers

    except Exception as e:
        logger.error(f"Error in redact_sensitive_info: {str(e)}")
        # Restore original print function in case of exception
        builtins.print = original_print
        return jsonify({'error': str(e), 'debugInfo': debug_info}), 500, headers

def get_info_types():
    """Get list of info types to redact, excluding age, gender, medical terms, and document types."""
    all_types = [
        {"name": info_type}
        for info_type in [
            "PERSON_NAME",
            "PHONE_NUMBER",
            "EMAIL_ADDRESS",
            # Add other info types here, but exclude DATE_OF_BIRTH
        ]
    ]
    return all_types

if __name__ == "__main__":
    # Test cases
    test_texts = [
        "A now almost 4 year old female diagnosed with KMT2A-rearranged AML on 05/15/2021.",
        "Patient born on 1990-03-22 is now 33 years old.",
        "Treatment started on 12/31/2023 for this 45-year-old male.",
        "The 2-month-old infant was admitted on 2025-01-15.",
        "John Doe's email is john.doe@example.com and phone number is 555-123-4567."
    ]

    print("Running test cases:")
    for i, text in enumerate(test_texts, 1):
        print(f"\nTest Case {i}:")
        print(f"Original text: {text}")
        result = deidentify_content("gemini-med-lit-review", text)
        print(f"Redacted text: {result}")
        print("=" * 50)

    # Run the Flask app
    app = functions_framework.create_app(target="redact_sensitive_info")
    app.run(host="0.0.0.0", port=8080, debug=True)
