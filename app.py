import os
import json
import logging
from flask import Flask, render_template, request, jsonify
from openai import OpenAI

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY environment variable is not set")

client = OpenAI(api_key=OPENAI_API_KEY)

@app.route('/')
def index():
    """Render the main page with the listing generator form."""
    return render_template('index.html')

def generate_amazon_listing(product_name, category, features):
    """
    Generate an Amazon product listing using OpenAI's GPT-4o model.
    
    Args:
        product_name (str): The name of the product
        category (str): Product category
        features (list): List of key product features
        
    Returns:
        dict: Generated listing with title, bullets, and description
    """
    # Validate inputs
    if not product_name or not category or not features:
        raise ValueError("Missing required product information")
    
    # Format features as a bulleted list for the prompt
    features_text = "\n".join([f"- {feature}" for feature in features])
    
    # Create the prompt for OpenAI
    prompt = f"""
    Create an Amazon product listing in JSON format for the following product:
    
    Product Name: {product_name}
    Category: {category}
    Key Features:
    {features_text}
    
    Please generate:
    1. A compelling SEO-optimized title for Amazon (max 200 characters)
    2. 5 benefit-focused bullet points (each under 200 characters)
    3. A detailed product description (300-500 words)
    
    Structure your response as a valid JSON object with these keys:
    "title", "bullets" (an array of 5 strings), and "description".
    """
    
    try:
        # Call the OpenAI API
        # The newest OpenAI model is "gpt-4o" which was released May 13, 2024.
        # do not change this unless explicitly requested by the user
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert e-commerce copywriter specializing in Amazon product listings."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1000
        )
        
        # Extract and parse the response
        content = response.choices[0].message.content
        listing_data = json.loads(content)
        
        # Validate the response structure
        if not all(key in listing_data for key in ["title", "bullets", "description"]):
            raise ValueError("API response missing required fields")
        
        if len(listing_data["bullets"]) < 5:
            # Ensure we have exactly 5 bullets, pad if necessary
            listing_data["bullets"] = listing_data["bullets"] + [""] * (5 - len(listing_data["bullets"]))
            listing_data["bullets"] = listing_data["bullets"][:5]  # Truncate if more than 5
            
        return {
            "title": listing_data["title"],
            "bullets": listing_data["bullets"],
            "description": listing_data["description"]
        }
        
    except Exception as e:
        logger.error(f"Error in OpenAI API call: {str(e)}")
        raise Exception(f"Failed to generate listing: {str(e)}")

@app.route('/api/generate-listing', methods=['POST'])
def generate_listing():
    """Generate Amazon product listing directly using OpenAI."""
    try:
        # Get request data from the frontend
        data = request.json
        logger.debug(f"Received request data: {data}")
        
        # Validate input data
        if not data or not all(key in data for key in ['product_name', 'category', 'features']):
            return jsonify({"detail": "Missing required fields"}), 400
        
        # Generate the listing using OpenAI
        result = generate_amazon_listing(
            data['product_name'],
            data['category'],
            data['features']
        )
        
        logger.debug(f"Successfully generated listing for: {data['product_name']}")
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error generating listing: {str(e)}")
        return jsonify({"detail": f"Failed to generate listing: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)