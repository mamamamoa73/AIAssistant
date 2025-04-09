import json
import os
import logging

from openai import OpenAI

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user
MODEL = "gpt-4o"

# Create OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def generate_amazon_listing(product_name, category, features, target_keywords=None):
    """
    Generate an Amazon product listing using OpenAI's GPT-4o model.
    
    Args:
        product_name (str): The name of the product
        category (str): Product category
        features (list): List of key product features
        target_keywords (list, optional): List of target keywords for SEO optimization
        
    Returns:
        dict: Generated listing with title, bullets, description, keywords, and SEO analysis
    """
    logger.info(f"Generating listing for {product_name} using OpenAI GPT-4o")
    
    # Format feature list for prompt
    features_formatted = "\n".join([f"- {feature}" for feature in features])
    
    # Prepare keywords section for prompt
    keywords_section = ""
    if target_keywords and len(target_keywords) > 0:
        keywords_formatted = ", ".join(target_keywords)
        keywords_section = f"\nTarget Keywords: {keywords_formatted}"
    
    # Craft the system prompt
    system_message = """You are an expert Amazon listing generator specialized in creating high-converting product listings.
Your goal is to create listings that rank well in Amazon search (SEO), optimize for Amazon's A9 algorithm (AEO),
and incorporate proven psychological selling techniques to maximize conversion rates.

You will provide:
1. A compelling product title (under 200 characters) 
2. 5 powerful bullet points that highlight key benefits
3. A persuasive product description (4-5 paragraphs)
4. SEO analysis including keyword placement and density
5. AEO (Amazon Everything Optimizer) analysis for Amazon's algorithms
6. Psychological selling techniques incorporated (scarcity, social proof, authority, reciprocity)

Format your response as a valid JSON object with the following structure:
{
  "title": "string",
  "bullets": ["string", "string", "string", "string", "string"],
  "description": "string",
  "keywords": ["string", "string", ...],
  "seo_analysis": {
    "title_analysis": {
      "character_count": number,
      "character_limit": number,
      "within_limit": boolean,
      "recommendation": "string"
    },
    "keyword_placement": {
      "keywords_in_title": ["string", ...],
      "keywords_in_bullets": ["string", ...],
      "missing_keywords": ["string", ...]
    },
    "keyword_density": {
      "keyword1": {"count": number, "percentage": number},
      "keyword2": {"count": number, "percentage": number},
      ...
    },
    "seo_score": {
      "score": number,
      "max_score": number,
      "percentage": number,
      "rating": "string"
    },
    "recommendations": ["string", ...]
  },
  "aeo_analysis": {
    "strategies_applied": ["string", ...],
    "recommendations": ["string", ...]
  },
  "psychological_techniques": {
    "applied_techniques": ["string", ...],
    "impact_analysis": {
      "scarcity": "string",
      "social_proof": "string",
      "authority": "string",
      "reciprocity": "string"
    }
  }
}"""

    # Craft the user prompt
    user_message = f"""Generate a professional Amazon product listing for the following product:

Product Name: {product_name}
Category: {category}
Key Features:
{features_formatted}{keywords_section}

Create a listing that:
1. Is optimized for Amazon SEO and AEO (Amazon's A9 algorithm)
2. Includes psychological selling techniques to increase conversions
3. Follows Amazon's best practices for product listings
4. Is tailored specifically for the {category} category
5. Highlights the product's unique benefits and competitive advantages

The listing should be comprehensive, persuasive, and ready to use on Amazon."""

    try:
        # Call the OpenAI API
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        
        # Parse the response
        content = response.choices[0].message.content
        listing_data = json.loads(content)
        
        logger.info("Successfully generated listing using OpenAI GPT-4o")
        return listing_data
        
    except Exception as e:
        logger.error(f"Error generating listing with OpenAI: {str(e)}")
        raise Exception(f"Failed to generate listing: {str(e)}")

def analyze_competitive_listings(competitors, product_name, category):
    """
    Analyze competitive listings to extract insights and keywords.
    
    Args:
        competitors (list): List of competitor URLs or listing titles
        product_name (str): Name of the product
        category (str): Product category
        
    Returns:
        dict: Analysis of competitive listings
    """
    if not competitors or len(competitors) == 0:
        return None
    
    competitors_formatted = "\n".join([f"- {comp}" for comp in competitors])
    
    system_message = """You are an expert Amazon competitive analyst.
Your goal is to analyze competitor listings and extract useful insights for creating a better listing.
Focus on identifying keywords, selling strategies, and unique selling propositions."""

    user_message = f"""Analyze the following competitor listings for a product named "{product_name}" in the {category} category:

{competitors_formatted}

Provide insights on:
1. Common keywords used
2. Psychological selling techniques employed
3. Unique selling propositions
4. Common benefits highlighted
5. Title structure patterns

Format as a structured JSON response."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            response_format={"type": "json_object"},
            temperature=0.5
        )
        
        content = response.choices[0].message.content
        analysis_data = json.loads(content)
        
        return analysis_data
        
    except Exception as e:
        logger.error(f"Error analyzing competitors with OpenAI: {str(e)}")
        return None