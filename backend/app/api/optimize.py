from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Optional
import uuid
import logging

from backend.app.models.optimization_models import OptimizationRequest, OptimizationResponse, OptimizedContent, ProductInput
from backend.app.services import openai_service, amazon_product_api_service

router = APIRouter()
logging.basicConfig(level=logging.INFO) # Ensure logging is configured
logger = logging.getLogger(__name__)

@router.post("/optimize-listing", response_model=OptimizationResponse, tags=["Optimization"])
async def optimize_listing_endpoint(request: OptimizationRequest = Body(...)):
    """
    Receives product information and optimization configuration,
    then returns AI-generated listing content.
    """
    request_id = str(uuid.uuid4())
    logger.info(f"Received optimization request {request_id} for product ASIN: {request.product_input.asin if request.product_input.asin else 'N/A (Manual Input)'}")
    
    current_product_data_from_paapi: Optional[Dict] = None
    effective_product_input_for_openai: ProductInput = request.product_input

    try:
        if request.product_input.asin: # This ASIN is for fetching data via PAAPI
            logger.info(f"Fetching live product data for ASIN: {request.product_input.asin} using PAAPI.")
            current_product_data_from_paapi = amazon_product_api_service.fetch_product_details_by_asin(request.product_input.asin)
            
            if current_product_data_from_paapi:
                logger.info(f"Successfully fetched data from PAAPI for ASIN {request.product_input.asin}: {current_product_data_from_paapi}")
                # If we want to use PAAPI data as the primary source for OpenAI when ASIN is provided,
                # we can create a new ProductInput or modify the existing one.
                # For now, we'll just pass it separately to openai_service.
            else:
                logger.warning(f"Could not fetch data from PAAPI for ASIN {request.product_input.asin}. Proceeding with manual_details if provided, or OpenAI will have less context.")
                # Depending on requirements, we might want to return an error here if ASIN is provided but data fetch fails.
                # For now, we proceed, and the current_product_data_from_paapi will be None in the response.
        
        # Call the OpenAI service to generate optimized content
        # Pass both the original product_input (which might have manual details) 
        # AND the data fetched from PAAPI (if any)
        optimized_content: OptimizedContent = openai_service.generate_optimized_content(
            product_input=effective_product_input_for_openai, # This still holds original ASIN and manual_details
            optimization_config=request.optimization_config,
            current_listing_data=current_product_data_from_paapi # Pass PAAPI data here
        )

        logger.info(f"Successfully generated content for request {request_id}")
        return OptimizationResponse(
            request_id=request_id,
            status="success",
            current_product_data=current_product_data_from_paapi, # Include fetched PAAPI data in the response
            data=optimized_content
        )

    except Exception as e:
        logger.error(f"Error processing request {request_id}: {str(e)}", exc_info=True)
        # Return a structured error response instead of raising HTTPException directly
        # to include the request_id and current_product_data if fetched.
        return OptimizationResponse(
            request_id=request_id,
            status="error",
            current_product_data=current_product_data_from_paapi, # Still include if fetched before error
            data=None,
            error_message=f"An unexpected error occurred: {str(e)}"
        )

from backend.app.models.optimization_models import ListingUpdateRequest, ListingUpdateResponse

@router.post("/update-amazon-listing", response_model=ListingUpdateResponse, tags=["SP-API Listing Management"])
async def update_listing_on_amazon(request: ListingUpdateRequest = Body(...)):
    """
    Receives new listing content and attempts to update it on Amazon via SP-API.
    This is a placeholder and will return a mock response.
    """
    logger.info(f"Received request to update listing for SKU: {request.seller_sku} in marketplace: {request.marketplace_id}")
    
    # In a real scenario, you'd need to ensure the user is authenticated and authorized
    # to update this specific SKU in this marketplace.

    try:
        # Convert the simplified ListingUpdateData to the actual data dictionary expected by the service
        update_data_dict = request.updated_data.model_dump(exclude_none=True)

        # Call the SP-API service placeholder
        # Note: SP-API typically uses SKU, not ASIN, for listing updates.
        # The `update_amazon_listing` function in the service is designed to accept SKU.
        sp_api_response = amazon_sp_api_service.update_amazon_listing(
            seller_sku=request.seller_sku,
            marketplace_ids=[request.marketplace_id], # SP-API often expects a list
            updated_data=update_data_dict,
            language_tag=request.language_tag
        )
        
        # Return the response from the service
        return ListingUpdateResponse(
            status=sp_api_response.get("status", "UNKNOWN_MOCK_STATUS"),
            submission_id=sp_api_response.get("submission_id"),
            message=sp_api_response.get("message"),
            issues=sp_api_response.get("issues")
        )

    except Exception as e:
        logger.error(f"Error in /update-amazon-listing endpoint for SKU {request.seller_sku}: {str(e)}", exc_info=True)
        return ListingUpdateResponse(
            status="ERROR_ENDPOINT_EXCEPTION",
            message=f"An unexpected error occurred in the API endpoint: {str(e)}"
        )
