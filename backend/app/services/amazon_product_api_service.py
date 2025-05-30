import logging
from typing import Optional, Dict, List

from paapi5_python_sdk.api.default_api import DefaultApi
from paapi5_python_sdk.models.partner_type import PartnerType
from paapi5_python_sdk.models.get_items_request import GetItemsRequest
from paapi5_python_sdk.models.get_items_resource import GetItemsResource
from paapi5_python_sdk.rest import ApiException

from backend.app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_paapi_client() -> DefaultApi:
    """Initializes and returns a PAAPI DefaultApi client instance."""
    return DefaultApi(
        access_key=settings.paapi_access_key,
        secret_key=settings.paapi_secret_key,
        host=settings.paapi_host,
        region=settings.paapi_region,
    )

def fetch_product_details_by_asin(asin: str) -> Optional[Dict]:
    """
    Fetches product details from Amazon Product Advertising API (PAAPI) for a given ASIN.
    """
    if not all([settings.paapi_access_key, settings.paapi_secret_key, settings.paapi_partner_tag, settings.paapi_host, settings.paapi_region]):
        logger.error("PAAPI credentials or configuration are missing. Cannot fetch live data.")
        # Fallback to mock data if credentials are not set
        return _get_mock_data_if_credentials_missing(asin)

    api_client = get_paapi_client()

    # Define the resources to fetch
    # More comprehensive list: Images.Primary.Large, ItemInfo.Title, ItemInfo.ByLineInfo, ItemInfo.ContentInfo, 
    # ItemInfo.Classifications, ItemInfo.ExternalIds, ItemInfo.Features, ItemInfo.ManufactureInfo, 
    # ItemInfo.ProductInfo, ItemInfo.TechnicalInfo, ItemInfo.TradeInInfo, Offers.Listings.Price, 
    # Offers.Listings.Promotions, BrowseNodeInfo.BrowseNodes, BrowseNodeInfo.WebsiteSalesRank
    resources = [
        GetItemsResource.ITEMINFO_TITLE,
        GetItemsResource.ITEMINFO_FEATURES,          # For bullet points
        GetItemsResource.ITEMINFO_CONTENTINFO,        # Potentially for description
        GetItemsResource.ITEMINFO_PRODUCTINFO,        # For brand and other info
        GetItemsResource.ITEMINFO_BYLINEINFO,         # For brand
        GetItemsResource.IMAGES_PRIMARY_MEDIUM,       # For main image
        GetItemsResource.OFFERS_LISTINGS_PRICE        # For price (optional here, but good to have)
    ]

    get_items_request = GetItemsRequest(
        partner_tag=settings.paapi_partner_tag,
        partner_type=PartnerType.ASSOCIATES,
        marketplace="www.amazon.sa", # Hardcoded for KSA marketplace
        item_ids=[asin],
        resources=resources,
    )

    try:
        logger.info(f"Fetching PAAPI details for ASIN: {asin} with host {settings.paapi_host} and region {settings.paapi_region}")
        api_response = api_client.get_items(get_items_request)
        logger.info(f"PAAPI response received for ASIN: {asin}")

        if api_response.items_result and api_response.items_result.items:
            item = api_response.items_result.items[0]
            if item.asin.lower() != asin.lower(): # ASIN mismatch check (should not happen)
                 logger.warning(f"PAAPI returned item for ASIN {item.asin} which does not match requested ASIN {asin}")
                 return None

            product_details = {}
            
            # Title
            if item.item_info and item.item_info.title:
                product_details["title"] = item.item_info.title.display_value
            
            # Bullet Points (Features)
            if item.item_info and item.item_info.features:
                product_details["bullet_points"] = item.item_info.features.display_values
            
            # Description (can be tricky)
            # Often found in ContentInfo.WebViewContent or other fields, may contain HTML
            # For simplicity, we'll try to get it from ContentInfo if available
            description_text = None
            if item.item_info and item.item_info.content_info:
                # This is a simplification; PAAPI might provide description in various forms.
                # A more robust solution would check multiple fields or parse HTML.
                # For now, if web_view_content is available, we might take it, otherwise a generic message.
                # This part needs careful checking against actual PAAPI responses for typical KSA products.
                # Sometimes `ContentInfo.Content` or other sub-fields might be more appropriate.
                # For now, we'll assume ContentInfo.Description might exist or be derived
                # Let's assume for now it's not readily available in a simple text field for this example.
                # A real implementation would need to inspect various ContentInfo fields.
                # For instance, some product types have `ItemInfo.ProductInfo.Description` or similar.
                # We'll make a placeholder for it.
                pass # No simple text description field guaranteed in PAAPI v5. Content usually HTML.

            product_details["description"] = description_text if description_text else "Description not easily extractable from PAAPI response for this product. Consider manual input or HTML parsing."


            # Main Image URL
            if item.images and item.images.primary and item.images.primary.medium:
                product_details["main_image_url"] = item.images.primary.medium.url
            
            # Brand
            if item.item_info and item.item_info.by_line_info and item.item_info.by_line_info.brand:
                product_details["brand"] = item.item_info.by_line_info.brand.display_value
            elif item.item_info and item.item_info.manufacture_info and item.item_info.manufacture_info.brand:
                 product_details["brand"] = item.item_info.manufacture_info.brand.display_value


            logger.info(f"Successfully extracted details for ASIN: {asin}: {product_details}")
            return product_details

        elif api_response.errors:
            logger.error(f"PAAPI errors for ASIN {asin}: {[err.message for err in api_response.errors]}")
            return None
        else:
            logger.warning(f"No items found or unexpected response for ASIN {asin} in PAAPI.")
            return None

    except ApiException as e:
        logger.error(f"PAAPI ApiException for ASIN {asin}: {e.body} - {e.reason}", exc_info=True)
        # Check for specific error types if needed
        # For example, if e.status == 429, it's a throttling error.
        # If e.status == 400 and "InvalidParameterValue" is in body, it might be an invalid ASIN.
        # if "InvalidParameterValue" in str(e.body) and "ItemId" in str(e.body): # crude check
        #     logger.error(f"ASIN {asin} might be invalid.")

        # For this MVP, we return mock data on any API exception if credentials were set,
        # to allow frontend to proceed without real data.
        # In a production system, you might want to raise the exception or return a specific error object.
        logger.info("Falling back to mock data due to PAAPI ApiException.")
        return _get_mock_data_if_credentials_missing(asin, is_fallback=True)
        
    except Exception as e:
        logger.error(f"Unexpected error fetching PAAPI details for ASIN {asin}: {str(e)}", exc_info=True)
        logger.info("Falling back to mock data due to unexpected error.")
        return _get_mock_data_if_credentials_missing(asin, is_fallback=True)

def _get_mock_data_if_credentials_missing(asin: str, is_fallback: bool = False) -> Optional[Dict]:
    """
    Returns mock data if PAAPI credentials are not set or as a fallback.
    """
    if is_fallback:
        reason = "API call failed or encountered an error."
    else:
        reason = "PAAPI credentials not configured."
        
    logger.info(f"Using mock data for ASIN {asin} because: {reason}")
    mock_db = {
        "B08XYZ1234": {
            "title": "Mock Product: Wireless Bluetooth Earbuds (Live API Fallback/Not Configured)",
            "bullet_points": [
                "Mock Feature 1: Great sound quality",
                "Mock Feature 2: Long battery life (20 hours)",
                "Mock Feature 3: Comfortable fit for KSA users"
            ],
            "description": "This is a mock description for product B08XYZ1234. PAAPI integration is either not configured or encountered an error. Ideal for tech-savvy users in Riyadh and Jeddah.",
            "main_image_url": "https://via.placeholder.com/150/0000FF/808080?Text=Product+Image",
            "brand": "MockBrand"
        }
    }
    if asin in mock_db:
        return mock_db[asin]
    else:
        return { # Generic mock for any other ASIN
            "title": f"Mock Product for ASIN {asin} (Fallback/Not Configured)",
            "bullet_points": ["Feature A", "Feature B", "Feature C for KSA market"],
            "description": f"This is a generic mock product description for {asin}. Live data fetch failed or was not attempted.",
            "main_image_url": "https://via.placeholder.com/150/CCCCCC/000000?Text=No+Image",
            "brand": "GenericBrand"
        }
