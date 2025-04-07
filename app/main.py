from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import ListingRequest, ListingResponse
from app.openai_utils import generate_amazon_listing
import logging
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Amazon Listing Generator API",
    description="API for generating Amazon product listings using OpenAI GPT-4o",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Amazon Listing Generator API is running"}

@app.post("/generate-listing", response_model=ListingResponse)
async def generate_listing(data: ListingRequest):
    """
    Generate an Amazon product listing based on product details.
    
    Args:
        data: The product information including name, category, and features
        
    Returns:
        A formatted product listing with title, bullet points, and description
    """
    try:
        logger.debug(f"Received request for product: {data.product_name}")
        
        if not data.product_name or not data.category or not data.features:
            raise HTTPException(status_code=400, detail="Missing required product information")
        
        result = generate_amazon_listing(
            data.product_name,
            data.category,
            data.features
        )
        
        logger.debug(f"Successfully generated listing for: {data.product_name}")
        return result
    
    except Exception as e:
        logger.error(f"Error generating listing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate listing: {str(e)}")

# If running directly (not imported)
if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000 as specified in the requirements
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
