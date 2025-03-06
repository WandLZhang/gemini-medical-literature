import functions_framework
from flask import jsonify
from google.cloud import dlp_v2
from google import genai
from google.genai import types
import json
import re
from datetime import datetime

# Initialize DLP client
dlp_client = dlp_v2.DlpServiceClient()

# Initialize Gemini client
client = genai.Client(
    vertexai=True,
    project="gemini-med-lit-review",
    location="us-central1",
)

def get_info_types():
    """Get list of info types to redact, including DATE_OF_BIRTH."""
    all_types = [
        {"name": info_type}
        for info_type in [
            "FINANCIAL_ID",
            "FRANCE_DRIVERS_LICENSE_NUMBER",
            "MEXICO_CURP_NUMBER",
            "ORGANIZATION_NAME",
            "DOD_ID_NUMBER",
            "STORAGE_SIGNED_POLICY_DOCUMENT",
            "KOREA_PASSPORT",
            "HONG_KONG_ID_NUMBER",
            "EMAIL_ADDRESS",
            "IRELAND_EIRCODE",
            "TAIWAN_ID_NUMBER",
            "COUNTRY_DEMOGRAPHIC",
            "SPAIN_CIF_NUMBER",
            "US_ADOPTION_TAXPAYER_IDENTIFICATION_NUMBER",
            "RELIGIOUS_TERM",
            "SSL_CERTIFICATE",
            "INDONESIA_NIK_NUMBER",
            "BRAZIL_CPF_NUMBER",
            "HTTP_USER_AGENT",
            "AZURE_AUTH_TOKEN",
            "STREET_ADDRESS",
            "LOCATION",
            "GCP_CREDENTIALS",
            "WEAK_PASSWORD_HASH",
            "POLITICAL_TERM",
            "CANADA_QUEBEC_HIN",
            "PORTUGAL_NIB_NUMBER",
            "VEHICLE_IDENTIFICATION_NUMBER",
            "CHILE_CDI_NUMBER",
            "US_BANK_ROUTING_MICR",
            "AUTH_TOKEN",
            "SINGAPORE_NATIONAL_REGISTRATION_ID_NUMBER",
            "PORTUGAL_SOCIAL_SECURITY_NUMBER",
            "UK_NATIONAL_INSURANCE_NUMBER",
            "CHINA_PASSPORT",
            "ARGENTINA_DNI_NUMBER",
            "DOCUMENT_TYPE/R&D/SOURCE_CODE",
            "AMERICAN_BANKERS_CUSIP_ID",
            "AWS_CREDENTIALS",
            "SCOTLAND_COMMUNITY_HEALTH_INDEX_NUMBER",
            "ADVERTISING_ID",
            "VAT_NUMBER",
            "OAUTH_CLIENT_SECRET",
            "INDONESIA_PASSPORT",
            "HTTP_COOKIE",
            "BELGIUM_NATIONAL_ID_CARD_NUMBER",
            "ITALY_FISCAL_CODE",
            "POLAND_PASSPORT",
            "MARITAL_STATUS",
            "PARAGUAY_TAX_NUMBER",
            "SOUTH_AFRICA_ID_NUMBER",
            "MAC_ADDRESS",
            "SEXUAL_ORIENTATION",
            "SWEDEN_PASSPORT",
            "US_SOCIAL_SECURITY_NUMBER",
            "US_STATE",
            "ENCRYPTION_KEY",
            "DOCUMENT_TYPE/HR/RESUME",
            "PORTUGAL_CDC_NUMBER",
            "UK_DRIVERS_LICENSE_NUMBER",
            "INDIA_AADHAAR_INDIVIDUAL",
            "US_INDIVIDUAL_TAXPAYER_IDENTIFICATION_NUMBER",
            "DOCUMENT_TYPE/LEGAL/COURT_ORDER",
            "US_DEA_NUMBER",
            "TINK_KEYSET",
            "IMSI_ID",
            "EMPLOYMENT_STATUS",
            "SWITZERLAND_SOCIAL_SECURITY_NUMBER",
            "US_PASSPORT",
            "CANADA_BANK_ACCOUNT",
            "US_HEALTHCARE_NPI",
            "SECURITY_DATA",
            "UK_ELECTORAL_ROLL_NUMBER",
            "DOCUMENT_TYPE/LEGAL/LAW",
            "NORWAY_NI_NUMBER",
            "KOREA_ARN",
            "GERMANY_PASSPORT",
            "AUSTRALIA_DRIVERS_LICENSE_NUMBER",
            "LOCATION_COORDINATES",
            "IRELAND_DRIVING_LICENSE_NUMBER",
            "AUSTRALIA_MEDICARE_NUMBER",
            "URUGUAY_CDI_NUMBER",
            "POLAND_PESEL_NUMBER",
            "GOVERNMENT_ID",
            "DOCUMENT_TYPE/FINANCE/SEC_FILING",
            "TIME",
            "SPAIN_NIE_NUMBER",
            "IMEI_HARDWARE_ID",
            "POLAND_NATIONAL_ID_NUMBER",
            "JSON_WEB_TOKEN",
            "ETHNIC_GROUP",
            "DOCUMENT_TYPE/LEGAL/PLEADING",
            "CREDIT_CARD_TRACK_NUMBER",
            "GERMANY_DRIVERS_LICENSE_NUMBER",
            "FINLAND_BUSINESS_ID",
            "MAC_ADDRESS_LOCAL",
            "FRANCE_PASSPORT",
            "CANADA_SOCIAL_INSURANCE_NUMBER",
            "FEMALE_NAME",
            "ITALY_PASSPORT",
            "US_EMPLOYER_IDENTIFICATION_NUMBER",
            "KOREA_RRN",
            "DOCUMENT_TYPE/R&D/PATENT",
            "KAZAKHSTAN_PASSPORT",
            "AUSTRALIA_PASSPORT",
            "CREDIT_CARD_EXPIRATION_DATE",
            "PERU_DNI_NUMBER",
            "COLOMBIA_CDC_NUMBER",
            "GENERIC_ID",
            "SPAIN_NIF_NUMBER",
            "DENMARK_CPR_NUMBER",
            "SPAIN_SOCIAL_SECURITY_NUMBER",
            "SPAIN_DRIVERS_LICENSE_NUMBER",
            "GEOGRAPHIC_DATA",
            "US_DRIVERS_LICENSE_NUMBER",
            "PHONE_NUMBER",
            "PASSPORT",
            "IRELAND_PASSPORT",
            "GERMANY_SCHUFA_ID",
            "STORAGE_SIGNED_URL",
            "MALE_NAME",
            "MEDICAL_RECORD_NUMBER",
            "TRADE_UNION",
            "LAST_NAME",
            "URL",
            "NEW_ZEALAND_IRD_NUMBER",
            "FINLAND_NATIONAL_ID_NUMBER",
            "SWIFT_CODE",
            "SINGAPORE_PASSPORT",
            "JAPAN_CORPORATE_NUMBER",
            "DEMOGRAPHIC_DATA",
            "THAILAND_NATIONAL_ID_NUMBER",
            "CANADA_OHIP",
            "DOCUMENT_TYPE/FINANCE/REGULATORY",
            "JAPAN_DRIVERS_LICENSE_NUMBER",
            "XSRF_TOKEN",
            "DOMAIN_NAME",
            "FRANCE_NIR",
            "NETHERLANDS_BSN_NUMBER",
            "FRANCE_TAX_IDENTIFICATION_NUMBER",
            "AZERBAIJAN_PASSPORT",
            "INDIA_GST_INDIVIDUAL",
            "PERSON_NAME",
            "CANADA_DRIVERS_LICENSE_NUMBER",
            "JAPAN_BANK_ACCOUNT",
            "JAPAN_INDIVIDUAL_NUMBER",
            "NEW_ZEALAND_NHI_NUMBER",
            "UK_PASSPORT",
            "VENEZUELA_CDI_NUMBER",
            "PARAGUAY_CIC_NUMBER",
            "JAPAN_PASSPORT",
            "DOCUMENT_TYPE/R&D/DATABASE_BACKUP",
            "TAIWAN_PASSPORT",
            "UK_TAXPAYER_REFERENCE",
            "SPAIN_DNI_NUMBER",
            "INDIA_PAN_INDIVIDUAL",
            "DATE",
            "IRELAND_PPSN",
            "BASIC_AUTH_HEADER",
            "ARMENIA_PASSPORT",
            "DOCUMENT_TYPE/R&D/SYSTEM_LOG",
            "PASSWORD",
            "FRANCE_CNI",
            "AUSTRALIA_TAX_FILE_NUMBER",
            "US_PREPARER_TAXPAYER_IDENTIFICATION_NUMBER",
            "US_VEHICLE_IDENTIFICATION_NUMBER",
            "US_TOLLFREE_PHONE_NUMBER",
            "DOCUMENT_TYPE/LEGAL/BLANK_FORM",
            "ICCID_NUMBER",
            "FIRST_NAME",
            "UKRAINE_PASSPORT",
            "MEXICO_PASSPORT",
            "NETHERLANDS_PASSPORT",
            "CHINA_RESIDENT_ID_NUMBER",
            "CANADA_PASSPORT",
            "UZBEKISTAN_PASSPORT",
            "DATE_OF_BIRTH",
            "CREDIT_CARD_NUMBER",
            "TURKEY_ID_NUMBER",
            "CROATIA_PERSONAL_ID_NUMBER",
            "US_MEDICARE_BENEFICIARY_ID_NUMBER",
            "TECHNICAL_ID",
            "GERMANY_TAXPAYER_IDENTIFICATION_NUMBER",
            "CANADA_BC_PHN",
            "BELARUS_PASSPORT",
            "KOREA_DRIVERS_LICENSE_NUMBER",
            "GCP_API_KEY",
            "ISRAEL_IDENTITY_CARD_NUMBER",
            "INDIA_PASSPORT",
            "CVV_NUMBER",
            "DRIVERS_LICENSE_NUMBER",
            "UK_NATIONAL_HEALTH_SERVICE_NUMBER",
            "SPAIN_PASSPORT",
            "RUSSIA_PASSPORT",
            "GERMANY_IDENTITY_CARD_NUMBER",
            "IMMIGRATION_STATUS",
            "IP_ADDRESS",
            "SWEDEN_NATIONAL_ID_NUMBER",
            "FINANCIAL_ACCOUNT_NUMBER",
            "IBAN_CODE"
        ]
    ]
    return all_types

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

    # Get info types for redaction
    info_types = get_info_types()
    print(f"Info types used for identification: {[t['name'] for t in info_types]}")

    # Set up DLP API request for inspection
    inspect_config = {
        "info_types": info_types,
        "min_likelihood": dlp_v2.Likelihood.LIKELY,
        "include_quote": True,
    }

    # Use DLP to find all instances of sensitive information
    item = {"value": text}
    parent = f"projects/{project_id}"
    inspect_request = {
        "parent": parent,
        "inspect_config": inspect_config,
        "item": item,
    }

    print("Calling DLP API for content inspection")
    inspect_response = dlp_client.inspect_content(request=inspect_request)

    # Process each finding
    for finding in inspect_response.result.findings:
        info_type = finding.info_type.name
        quote = finding.quote
        print(f"Found {info_type}: {quote}")

        if info_type == "DATE_OF_BIRTH":
            try:
                standardized_date = standardize_date(quote)
                age = calculate_age(standardized_date)
                text = text.replace(quote, f"Age: {age}")
                print(f"Replaced DATE_OF_BIRTH with age: {age}")
            except Exception as e:
                print(f"Error processing DATE_OF_BIRTH: {str(e)}")
                text = text.replace(quote, "[REDACTED DATE_OF_BIRTH]")
                print(f"Redacted DATE_OF_BIRTH due to processing error")

    # Set up DLP API request for deidentification of remaining sensitive information
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

    deidentify_request = {
        "parent": parent,
        "deidentify_config": deidentify_config,
        "inspect_config": inspect_config,
        "item": {"value": text},
    }

    try:
        print("Calling DLP API for content deidentification")
        deidentify_response = dlp_client.deidentify_content(request=deidentify_request)
        
        print("DLP API Deidentification Response:")
        if hasattr(deidentify_response, 'overview') and hasattr(deidentify_response.overview, 'transformed_overview'):
            for transformation in deidentify_response.overview.transformed_overview.transformation_summaries:
                print(f"  Info type redacted: {transformation.info_type.name}")
                print(f"  Occurrences: {transformation.transformed_count}")
        else:
            print("  No transformation overview available in the response.")
        
        print(f"Final redacted text: {deidentify_response.item.value}")
        return deidentify_response.item.value
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
        print("Received request for redaction")
        
        if not request_json:
            print("No JSON data received in request")
            return jsonify({'error': 'No JSON data received'}), 400, headers

        # Extract text to redact
        text = request_json.get('text')
        if not text:
            print("No text provided for redaction")
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
        print(f"Error in redact_sensitive_info: {str(e)}")
        # Restore original print function in case of exception
        builtins.print = original_print
        return jsonify({'error': str(e), 'debugInfo': debug_info}), 500, headers


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
