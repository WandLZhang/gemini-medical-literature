import functions_framework
from flask import jsonify, request
from flask_cors import CORS
import pg8000
from google.cloud.sql.connector import Connector, IPTypes
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PostgresDocumentStorage:
    """Stores documents in Google CloudSQL Postgres."""

    def __init__(
        self,
        instance_connection_string: str,
        user: str,
        password: str,
        db: str
    ) -> None:
        self._conn: pg8000.dbapi.Connection = Connector().connect(
            instance_connection_string,
            "pg8000",
            user=user,
            password=password,
            db=db,
            ip_type=IPTypes.PUBLIC,
        )

    def get_documents_by_pmids(self, pmids):
        """Gets documents by their PMIDs."""
        cursor = self._conn.cursor()
        
        # Convert PMIDs to strings if they aren't already
        pmids = [str(pmid) for pmid in pmids]
        
        # Use parameterized query with IN clause
        placeholders = ','.join(['%s'] * len(pmids))
        query = f"SELECT id, title, abstract FROM articles WHERE id IN ({placeholders})"
        
        cursor.execute(query, pmids)
        results = cursor.fetchall()
        cursor.close()

        # Convert results to list of dictionaries
        documents = []
        for result in results:
            documents.append({
                "pmid": result[0],
                "title": result[1],
                "abstract": result[2]
            })
        
        return documents

def get_postgres_connection():
    """Creates a connection to the Postgres database."""
    return PostgresDocumentStorage(
        instance_connection_string="gemini-med-lit-review:us-central1:pubmed-postgres",
        user="postgres",
        password="pubmedpostgres",
        db="pubmed"
    )

@functions_framework.http
def retrieve_abstracts(request):
    """HTTP Cloud Function that retrieves documents from Postgres based on PMIDs."""
    # Configure CORS
    cors = CORS(
        origins=[
            "http://localhost:3000",
            "https://medical-assistant-934163632848.us-central1.run.app",
            "https://gemini-med-lit-review.web.app",
            "http://localhost:5000"
        ],
        methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
        supports_credentials=True,
        max_age=3600
    )
    
    # Handle preflight request
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": request.headers.get("Origin", "*"),
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600"
        }
        return ("", 204, headers)

    # Apply CORS to the main request
    headers = {
        "Access-Control-Allow-Origin": request.headers.get("Origin", "*"),
        "Access-Control-Allow-Credentials": "true"
    }

    try:
        # Get PMIDs from request
        request_json = request.get_json(silent=True)
        if not request_json or 'pmids' not in request_json:
            return (jsonify({'error': 'No PMIDs provided'}), 400, headers)

        pmids = request_json['pmids']
        if not isinstance(pmids, list):
            return (jsonify({'error': 'PMIDs must be provided as a list'}), 400, headers)

        # Get documents from Postgres
        postgres = get_postgres_connection()
        documents = postgres.get_documents_by_pmids(pmids)

        # Return documents
        return (jsonify({
            'documents': documents,
            'total': len(documents)
        }), 200, headers)

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return (jsonify({"error": str(e)}), 500, headers)

if __name__ == "__main__":
    app = functions_framework.create_app(target="retrieve_abstracts")
    app.run(host="0.0.0.0", port=8080, debug=True)
