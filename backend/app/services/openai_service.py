import logging
from typing import Dict, Optional

from backend.app.core.config import settings # Use settings for API key
from backend.app.models.optimization_models import ProductInput, OptimizationConfig, OptimizedContent

# OpenAI API key is now loaded via settings
# OPENAI_API_KEY = settings.openai_api_key # No need to call os.getenv directly here

logging.basicConfig(level=settings.log_level.upper()) # Use log_level from settings
logger = logging.getLogger(__name__)

def generate_optimized_content(
    product_input: ProductInput, 
    optimization_config: OptimizationConfig,
    current_listing_data: Optional[Dict] = None # Added current_listing_data
) -> OptimizedContent:
    """
    Dynamically constructs prompts and mocks an OpenAI API call.
    Returns pre-defined, hardcoded optimized content based on the requested language.
    Incorporates current listing data if provided.
    """
    
    prompt_parts = ["Optimize the following Amazon listing for KSA market:"]

    # Incorporate current listing data from PAAPI if available
    if current_listing_data:
        prompt_parts.append("\nCurrent Listing Data (from Amazon):")
        if current_listing_data.get("title"):
            prompt_parts.append(f"  Current Title: {current_listing_data['title']}")
        if current_listing_data.get("bullet_points"):
            prompt_parts.append(f"  Current Bullet Points: {'; '.join(current_listing_data['bullet_points'])}")
        if current_listing_data.get("description"): # Assuming description is plain text here
            prompt_parts.append(f"  Current Description: {current_listing_data['description']}")
        if current_listing_data.get("brand"):
            prompt_parts.append(f"  Brand: {current_listing_data['brand']}")
        prompt_parts.append("\nUser Provided/Override Information:")

    # User-provided input (ASIN, manual details, target audience)
    if product_input.asin:
        prompt_parts.append(f"  Product ASIN: {product_input.asin}")
    if product_input.manual_details:
        prompt_parts.append(f"  User-Provided Product Name: {product_input.manual_details.name}")
        prompt_parts.append(f"  User-Provided Key Features: {', '.join(product_input.manual_details.key_features)}")
        if product_input.manual_details.category:
            prompt_parts.append(f"  User-Provided Category: {product_input.manual_details.category}")
    if product_input.target_audience:
        prompt_parts.append(f"  Target Audience: {product_input.target_audience}")

    prompt_parts.append("\nOptimization Instructions:")
    prompt_parts.append(f"  Target Language: {optimization_config.language}")
    prompt_parts.append(f"  Content to Optimize: {', '.join(optimization_config.content_to_optimize)}")
    if optimization_config.custom_keywords:
        prompt_parts.append(f"  Custom Keywords to include: {', '.join(optimization_config.custom_keywords)}")
    if optimization_config.tone_style:
        prompt_parts.append(f"  Desired Tone/Style: {optimization_config.tone_style}")
    
    prompt_parts.append("\nGenerate compelling and culturally relevant content based on all the above information.")
    
    # Construct the final prompt string
    prompt = "\n".join(prompt_parts)

    # Check if OpenAI API key is configured
    openai_api_key_is_set = bool(settings.openai_api_key and settings.openai_api_key != "YOUR_OPENAI_KEY_HERE")
    logger.info(f"Mock OpenAI Call. OpenAI API Key Configured: {'Yes' if openai_api_key_is_set else 'No'}")
    logger.debug(f"Generated Prompt (Would be sent to OpenAI):\n{prompt}") # Changed to debug level

    # Mocked OpenAI API call - return pre-defined content. 
    # In a real scenario, you'd use the OpenAI Python client here with the prompt.
    if optimization_config.language == "ar":
        optimized_content = OptimizedContent(
            optimized_title="منتج رائع ومحسن باللغة العربية (مثال)",
            optimized_bullet_points=[
                "نقطة رئيسية أولى باللغة العربية",
                "نقطة رئيسية ثانية مع تفاصيل مهمة للسوق السعودي",
                "نقطة رئيسية ثالثة تركز على الجودة"
            ],
            optimized_description="وصف مطول وجذاب للمنتج باللغة العربية، مصمم خصيصًا لعملاء أمازون في المملكة العربية السعودية. يشمل تفاصيل حول الفوائد وكيف يلبي المنتج احتياجات السوق المحلي."
        )
    elif optimization_config.language == "en":
        optimized_content = OptimizedContent(
            optimized_title="Amazing Optimized Product Title in English (Example)",
            optimized_bullet_points=[
                "First key bullet point in English",
                "Second bullet point with important details for the KSA market",
                "Third bullet point focusing on quality"
            ],
            optimized_description="A long and engaging product description in English, specifically tailored for Amazon customers in Saudi Arabia. Includes details about benefits and how the product meets local market needs."
        )
    elif optimization_config.language == "bilingual_ar_en":
        # If current data is available, incorporate it into the mock response
        base_title = current_listing_data.get("title", "منتج رائع") if current_listing_data else "منتج رائع"
        optimized_content = OptimizedContent(
            optimized_title=f"Optimized Bilingual Title for '{base_title}' (مثال)",
            optimized_bullet_points=[
                f"Bilingual Bullet 1 for '{base_title}' (نقطة رئيسية أولى)",
                f"Second bilingual bullet (النقطة الثانية)",
                f"Third bilingual point (النقطة الثالثة)"
            ],
            optimized_description=f"وصف ثنائي اللغة جذاب Bilingual Description للمنتج '{base_title}'. This description caters to both Arabic and English speaking customers in KSA, building upon existing details."
        )
    else: # Default to English
        base_title = current_listing_data.get("title", "Default Product") if current_listing_data else "Default Product"
        optimized_content = OptimizedContent(
            optimized_title=f"Optimized Title for '{base_title}' (Example)",
            optimized_bullet_points=[
                "Default bullet point 1",
                "Default bullet point 2"
            ],
            optimized_description="Default product description for testing purposes."
        )
    
    # Simulate partial optimization if requested
    final_optimized_content = OptimizedContent()
    if "title" in optimization_config.content_to_optimize:
        final_optimized_content.optimized_title = optimized_content.optimized_title
    if "bullet_points" in optimization_config.content_to_optimize:
        final_optimized_content.optimized_bullet_points = optimized_content.optimized_bullet_points
    if "description" in optimization_config.content_to_optimize:
        final_optimized_content.optimized_description = optimized_content.optimized_description

    return final_optimized_content
