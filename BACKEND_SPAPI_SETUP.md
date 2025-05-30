# Backend: Amazon Selling Partner API (SP-API) Setup for Listing Updates

This document outlines the structural setup for integrating the Amazon Selling Partner API (SP-API) to enable product listing updates directly on Amazon. This initial phase focuses on establishing the necessary configurations, service placeholders, and API endpoint definitions.

**Note:** Full functional implementation of SP-API, especially the OAuth2 LWA token exchange, secure token storage, token refresh mechanisms, and dynamic JSON Patch document creation for various product types, is highly complex and is **not** part of this initial setup. This document describes the groundwork laid for future full implementation.

## 1. SP-API Credentials & Configuration Placeholders

*   **File:** `backend/app/core/config.py`
*   **Environment Variables:** Placeholder variables for SP-API credentials have been added. These are loaded via `python-dotenv` for local development.
    *   `SPAPI_LWA_APP_ID`: LWA (Login with Amazon) Application ID.
    *   `SPAPI_LWA_CLIENT_SECRET`: LWA Application Client Secret.
    *   `SPAPI_LWA_REFRESH_TOKEN`: The seller-specific LWA Refresh Token (requires secure storage and a robust refresh mechanism - **placeholder only**).
    *   `SPAPI_AWS_ACCESS_KEY_ID`: AWS IAM User Access Key ID (for signing requests, if not using an assumed role via STS that the SDK handles).
    *   `SPAPI_AWS_SECRET_ACCESS_KEY`: AWS IAM User Secret Access Key.
    *   `SPAPI_ROLE_ARN`: AWS IAM Role ARN (recommended for SP-API access, allowing temporary, scoped-down permissions).
    *   `SPAPI_ENDPOINT`: The regional SP-API endpoint (e.g., `https://sellingpartnerapi-eu.amazon.com` for Europe, which includes KSA).
    *   `SPAPI_REGION`: The AWS region corresponding to the SP-API endpoint (e.g., `eu-west-1`).
*   These variables are integrated into the `Settings` Pydantic model in `config.py` for typed access.
*   **Template:** `backend/.env.template` has been updated with these new SP-API environment variable placeholders, guiding users on what needs to be configured. **Actual `.env` files with sensitive credentials must not be committed to version control.**

## 2. SP-API SDK Installation (Recommended)

*   **File:** `backend/requirements.txt`
*   The `python-amazon-sp-api` library has been added as a dependency. This SDK is intended to simplify interactions with SP-API, including authentication and request signing, once fully configured.

## 3. SP-API Service Module (`amazon_sp_api_service.py`)

*   **File:** `backend/app/services/amazon_sp_api_service.py`
*   **Conceptual Authentication Flow (Docstrings/Comments):**
    *   The file includes detailed comments outlining the SP-API authentication process:
        1.  LWA token exchange (obtaining refresh and initial access tokens via OAuth2).
        2.  Secure storage and periodic refresh of the LWA refresh token.
        3.  Generation of short-lived LWA access tokens using the refresh token.
        4.  Signing of SP-API requests using AWS Signature Version 4 with appropriate IAM credentials (either direct IAM user keys or temporary credentials from an assumed IAM Role via STS).
    *   It's emphasized that while an SDK like `python-amazon-sp-api` handles many of these details, the initial acquisition and secure management of the LWA refresh token are significant application-level responsibilities.
*   **Placeholder `update_amazon_listing` Function:**
    *   Signature: `update_amazon_listing(seller_sku: str, marketplace_ids: List[str], updated_data: Dict, language_tag: str = "en_US") -> Dict`
        *   Accepts `seller_sku` (as SP-API uses SKUs for listing management), a list of `marketplace_ids` (e.g., `["A1ZFF27R1HYPUL"]` for KSA), the `updated_data` dictionary, and a `language_tag`.
    *   **Current Behavior (Mock):**
        1.  Logs the call parameters (SKU, marketplace, language, and the received `updated_data`).
        2.  Checks if `settings.spapi_lwa_refresh_token` is configured. If not, it returns an `ERROR_NO_AUTH` mock status, indicating that real updates cannot proceed.
        3.  Constructs a conceptual JSON Patch document based on the `updated_data` (e.g., for title, bullet points, description). This patch document is logged to illustrate what *would* be sent.
        4.  Returns a mock success response: `{"status": "PENDING_MOCK_SUCCESS", "submission_id": "mock_submission_...", "message": "This is a mock response...", "issues": []}`.
    *   **Comments on Real Implementation:** The function includes extensive comments detailing the actual SP-API operations that would be needed, primarily using the `ListingsItemsApi` and its `put_listings_item` method, which requires the seller ID, SKU, marketplace IDs, and the JSON Patch payload.
*   **Conceptual Data Model for Updates:**
    *   Comments within the service file explain the expected simplified structure of `updated_data` (title, bullet_points, description) received by the function.
    *   It also highlights that this simplified structure needs to be transformed into the SP-API's specific JSON Patch format, where each attribute update is an operation (e.g., `replace`), with a `path` (e.g., `/attributes/title`) and a `value` (which itself is often a list of objects containing the actual value and a `language_tag`).

## 4. New API Endpoint for Listing Update

*   **File:** `backend/app/api/optimize.py` (within the existing `optimize_router`)
*   **Endpoint Definition:**
    *   A new POST endpoint `/api/v1/update-amazon-listing` has been created.
    *   It is tagged under "SP-API Listing Management" in the OpenAPI documentation.
*   **Request/Response Models (in `backend/app/models/optimization_models.py`):**
    *   `ListingUpdateRequest`: Defines the request body, requiring `seller_sku`, `marketplace_id`, `updated_data` (using a nested `ListingUpdateData` model for title, bullet_points, description), and an optional `language_tag`.
    *   `ListingUpdateResponse`: Defines the response structure, including `status`, `submission_id`, `message`, and potential `issues`.
*   **Endpoint Logic:**
    *   Receives the `ListingUpdateRequest`.
    *   Logs the request.
    *   Calls the `amazon_sp_api_service.update_amazon_listing` function with the provided details.
    *   Returns the (currently mock) response from the service, mapped to the `ListingUpdateResponse` model.
    *   Includes basic error handling for exceptions within the endpoint itself.

## Summary of Current State

This setup establishes the necessary backend structure for future SP-API integration for listing updates. It defines how configuration should be handled, outlines the authentication complexities, provides a clear placeholder service function, and sets up the API endpoint that the frontend will eventually call.

**Next Steps for Full Implementation (Beyond this Subtask):**
1.  Implement a secure OAuth2 flow for sellers to authorize the application and obtain LWA refresh tokens.
2.  Develop a secure storage mechanism for LWA refresh tokens.
3.  Implement robust LWA access token generation and refresh logic within `get_sp_api_client` (or leverage the chosen SDK's capabilities for this).
4.  Fully implement the `update_amazon_listing` function in `amazon_sp_api_service.py` to:
    *   Correctly initialize and use the SP-API SDK.
    *   Dynamically and accurately convert the input `updated_data` into the precise JSON Patch document format required by the `put_listings_item` operation for various attributes and product types. This is a critical and complex step.
    *   Handle actual SP-API responses, including processing submission statuses and potential errors/issues.
5.  Implement comprehensive error handling and retry mechanisms for SP-API calls.
6.  Add user authentication and authorization to the `/update-amazon-listing` endpoint to ensure only authorized sellers can update their listings.The `BACKEND_SPAPI_SETUP.md` file has been created successfully.

All specified Python files (`backend/app/core/config.py`, `backend/app/services/amazon_sp_api_service.py`, `backend/app/api/optimize.py`, `backend/app/models/optimization_models.py`) have been updated to lay the groundwork for SP-API integration for listing updates. The `backend/requirements.txt` now includes `python-amazon-sp-api`, and `backend/.env.template` has been updated with SP-API related placeholders.

The current implementation includes:
1.  Configuration placeholders for SP-API credentials.
2.  The `python-amazon-sp-api` SDK added to requirements.
3.  A new `amazon_sp_api_service.py` with:
    *   Conceptual SP-API authentication flow outlined in comments.
    *   A placeholder `update_amazon_listing` function that logs input, shows a conceptual JSON Patch payload, and returns a mock success/error response.
4.  New Pydantic models (`ListingUpdateRequest`, `ListingUpdateData`, `ListingUpdateResponse`) for the update functionality.
5.  A new POST API endpoint `/api/v1/update-amazon-listing` that calls the placeholder service function.

This fulfills the requirements of the subtask by defining the structure and placeholders for SP-API listing update integration. Full functional implementation remains for future development.
