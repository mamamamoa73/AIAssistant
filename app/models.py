from pydantic import BaseModel, Field, validator
from typing import List

class ListingRequest(BaseModel):
    """
    Request model for product listing generation.
    """
    product_name: str = Field(..., description="The name of the product")
    category: str = Field(..., description="Product category (e.g., Electronics, Kitchen, Beauty)")
    features: List[str] = Field(..., description="List of key product features/benefits")
    
    @validator('product_name')
    def validate_product_name(cls, v):
        if not v.strip():
            raise ValueError("Product name cannot be empty")
        return v
    
    @validator('category')
    def validate_category(cls, v):
        if not v.strip():
            raise ValueError("Category cannot be empty")
        return v
    
    @validator('features')
    def validate_features(cls, v):
        if not v or len(v) < 1:
            raise ValueError("At least one feature must be provided")
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "product_name": "Ultra Quiet Air Purifier",
                "category": "Home & Kitchen",
                "features": [
                    "HEPA filtration removes 99.97% of particles",
                    "Ultra-quiet 25dB operation",
                    "Coverage for rooms up to 500 sq ft",
                    "Smart air quality sensor",
                    "Energy-efficient design"
                ]
            }
        }

class ListingResponse(BaseModel):
    """
    Response model for generated Amazon listing.
    """
    title: str = Field(..., description="SEO-optimized product title for Amazon")
    bullets: List[str] = Field(..., description="List of 5 feature bullet points")
    description: str = Field(..., description="Detailed product description")
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Ultra Quiet Air Purifier with True HEPA Filter - Smart Air Quality Monitor for Large Rooms up to 500 sq ft - Energy Efficient Home Air Cleaner",
                "bullets": [
                    "ADVANCED HEPA FILTRATION: Removes 99.97% of dust, pollen, smoke, and other harmful particles as small as 0.3 microns for cleaner, fresher air",
                    "WHISPER-QUIET OPERATION: With noise levels as low as 25dB, this ultra-quiet air purifier won't disturb your sleep, work, or conversations",
                    "PERFECT FOR LARGE SPACES: Efficiently cleans the air in rooms up to 500 square feet, making it ideal for living rooms, bedrooms, and open-concept spaces",
                    "INTELLIGENT AIR QUALITY MONITORING: Built-in sensors automatically detect air quality and adjust fan speed accordingly for optimal air purification",
                    "ENERGY-SAVING DESIGN: ENERGY STAR certified with eco-mode that reduces power consumption by up to 50% compared to conventional air purifiers"
                ],
                "description": "Transform your home environment with our Ultra Quiet Air Purifier, designed to provide you with clean, fresh air without the noise. This powerful yet whisper-quiet air purifier features advanced True HEPA filtration technology that captures 99.97% of airborne particles, including dust, pollen, pet dander, smoke particles, and even bacteria.\n\nEngineered for modern living, our air purifier operates at just 25dB on its lowest setting—quieter than a library whisper—ensuring peaceful nights and productive days without distraction. The intelligent air quality sensor continuously monitors your environment, automatically adjusting the fan speed to maintain optimal air quality while conserving energy.\n\nPerfect for large spaces up to 500 square feet, this versatile purifier is ideal for living rooms, bedrooms, home offices, or any space where clean air is essential. The sleek, contemporary design complements any décor, while the intuitive touch controls make operation simple and convenient.\n\nInvest in your health and comfort with our Ultra Quiet Air Purifier—because everyone deserves to breathe clean air."
            }
        }
