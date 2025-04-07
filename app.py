import os
import requests
import logging
from flask import Flask, render_template, request, jsonify

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# FastAPI backend URL
API_URL = "http://localhost:5000"  # Since both apps are running on the same machine

@app.route('/')
def index():
    """Render the main page with the listing generator form."""
    return render_template('index.html')

@app.route('/api/generate-listing', methods=['POST'])
def generate_listing():
    """Proxy endpoint that forwards requests to the FastAPI backend."""
    try:
        # Get request data from the frontend
        data = request.json
        logger.debug(f"Received request data: {data}")
        
        # Validate input data
        if not data or not all(key in data for key in ['product_name', 'category', 'features']):
            return jsonify({"detail": "Missing required fields"}), 400
        
        # Forward the request to the FastAPI backend
        response = requests.post(f"{API_URL}/generate-listing", json=data)
        
        # Check for successful response
        if response.status_code == 200:
            result = response.json()
            logger.debug(f"Successfully generated listing for: {data['product_name']}")
            return jsonify(result)
        else:
            # Handle error from the API
            error_detail = response.json().get('detail', 'Failed to generate listing')
            logger.error(f"API error: {error_detail}")
            return jsonify({"detail": error_detail}), response.status_code
    
    except requests.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return jsonify({"detail": "Could not connect to the API service"}), 503
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"detail": "An unexpected error occurred"}), 500

if __name__ == '__main__':
    # Run the Flask app on port 3000 to avoid conflict with the FastAPI app
    app.run(host='0.0.0.0', port=3000, debug=True)