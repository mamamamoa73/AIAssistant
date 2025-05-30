import os
from dotenv import load_dotenv

# Load environment variables from .env file (especially for development)
# In a production environment, these variables would typically be set directly.
load_dotenv()

# PAAPI Credentials & Configuration
AMAZON_PAAPI_ACCESS_KEY = os.getenv("AMAZON_PAAPI_ACCESS_KEY")
AMAZON_PAAPI_SECRET_KEY = os.getenv("AMAZON_PAAPI_SECRET_KEY")
AMAZON_PAAPI_PARTNER_TAG = os.getenv("AMAZON_PAAPI_PARTNER_TAG")
AMAZON_PAAPI_HOST = os.getenv("AMAZON_PAAPI_HOST", "webservices.amazon.sa") # Default if not set
AMAZON_PAAPI_REGION = os.getenv("AMAZON_PAAPI_REGION", "me-south-1") # Default if not set

# OpenAI API Key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# SP-API Credentials (Placeholders - actual storage and refresh mechanisms are complex)
SPAPI_LWA_APP_ID = os.getenv("SPAPI_LWA_APP_ID")
SPAPI_LWA_CLIENT_SECRET = os.getenv("SPAPI_LWA_CLIENT_SECRET")
SPAPI_LWA_REFRESH_TOKEN = os.getenv("SPAPI_LWA_REFRESH_TOKEN") # Needs secure storage & refresh
SPAPI_AWS_ACCESS_KEY_ID = os.getenv("SPAPI_AWS_ACCESS_KEY_ID") # For SP-API IAM User
SPAPI_AWS_SECRET_ACCESS_KEY = os.getenv("SPAPI_AWS_SECRET_ACCESS_KEY") # For SP-API IAM User
SPAPI_ROLE_ARN = os.getenv("SPAPI_ROLE_ARN") # IAM Role ARN for SP-API access
SPAPI_ENDPOINT = os.getenv("SPAPI_ENDPOINT", "https://sellingpartnerapi-eu.amazon.com") # Example for Europe, KSA might be different or use global
SPAPI_REGION = os.getenv("SPAPI_REGION", "eu-west-1") # Example region


# Basic validation (optional, but good practice)
# You could add checks here to ensure critical variables are set,
# and raise an error if they are not, to prevent the app from starting
# in a misconfigured state. For example:
# if not AMAZON_PAAPI_ACCESS_KEY:
#     raise ValueError("Missing required environment variable: AMAZON_PAAPI_ACCESS_KEY")

# Database URL (if you had one, it would go here)
# DATABASE_URL = os.getenv("DATABASE_URL")

# For Uvicorn logging, if needed
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")

class Settings:
    PROJECT_NAME: str = "Amazon Listing Optimizer API"
    PROJECT_VERSION: str = "0.2.0" # Assuming version increment

    # PAAPI
    paapi_access_key: str = AMAZON_PAAPI_ACCESS_KEY
    paapi_secret_key: str = AMAZON_PAAPI_SECRET_KEY
    paapi_partner_tag: str = AMAZON_PAAPI_PARTNER_TAG
    paapi_host: str = AMAZON_PAAPI_HOST
    paapi_region: str = AMAZON_PAAPI_REGION

    # OpenAI
    openai_api_key: str = OPENAI_API_KEY
    
    # Logging
    log_level: str = LOG_LEVEL.lower()

    # SP-API (Placeholders)
    spapi_lwa_app_id: Optional[str] = SPAPI_LWA_APP_ID
    spapi_lwa_client_secret: Optional[str] = SPAPI_LWA_CLIENT_SECRET
    spapi_lwa_refresh_token: Optional[str] = SPAPI_LWA_REFRESH_TOKEN
    spapi_aws_access_key_id: Optional[str] = SPAPI_AWS_ACCESS_KEY_ID
    spapi_aws_secret_access_key: Optional[str] = SPAPI_AWS_SECRET_ACCESS_KEY
    spapi_role_arn: Optional[str] = SPAPI_ROLE_ARN
    spapi_endpoint: Optional[str] = SPAPI_ENDPOINT
    spapi_region: Optional[str] = SPAPI_REGION


settings = Settings()

# Example of how to use:
# from backend.app.core.config import settings
# print(settings.paapi_access_key)
# print(settings.spapi_lwa_app_id)
