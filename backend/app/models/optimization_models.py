from typing import List, Optional
from pydantic import BaseModel, Field
import uuid

class ManualProductDetails(BaseModel):
    name: str
    key_features: List[str]
    category: Optional[str] = None
    # Add other fields as necessary, e.g., current_description, current_title

class ProductInput(BaseModel):
    asin: Optional[str] = None
    manual_details: Optional[ManualProductDetails] = None
    target_audience: Optional[str] = None

class OptimizationConfig(BaseModel):
    language: str  # e.g., "en", "ar", "bilingual_ar_en"
    content_to_optimize: List[str] = Field(default_factory=lambda: ["title", "bullet_points", "description"])
    custom_keywords: Optional[List[str]] = None
    tone_style: Optional[str] = None # e.g., "formal", "persuasive", "ksa_default"

class OptimizationRequest(BaseModel):
    product_input: ProductInput
    optimization_config: OptimizationConfig

class OptimizedContent(BaseModel):
    optimized_title: Optional[str] = None
    optimized_bullet_points: Optional[List[str]] = None
    optimized_description: Optional[str] = None

class OptimizationResponse(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str  # e.g., "success", "error", "processing"
    current_product_data: Optional[Dict] = None # Added for PAAPI data
    data: Optional[OptimizedContent] = None
    error_message: Optional[str] = None


# --- Models for SP-API Listing Update ---

class ListingUpdateData(BaseModel):
    """
    Represents the content to be updated for a listing.
    This is a simplified model; actual SP-API updates use a JSON Patch format.
    """
    title: Optional[str] = None
    bullet_points: Optional[List[str]] = None
    description: Optional[str] = None
    # Add other common fields as needed, e.g., keywords

class ListingUpdateRequest(BaseModel):
    seller_sku: str = Field(..., description="The SKU of the product to update.")
    marketplace_id: str = Field(..., description="The marketplace ID (e.g., 'A1ZFF27R1HYPUL' for KSA).")
    updated_data: ListingUpdateData
    language_tag: str = Field(default="en_US", description="Language of the content, e.g., 'en_US', 'ar_AE'.")

class ListingUpdateResponse(BaseModel):
    status: str # e.g., PENDING, ACCEPTED, INVALID, ERROR_NO_AUTH, PENDING_MOCK_SUCCESS
    submission_id: Optional[str] = None
    message: Optional[str] = None
    issues: Optional[List[Dict]] = None # To hold any errors or warnings from SP-API
