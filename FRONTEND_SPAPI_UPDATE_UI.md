# Frontend: SP-API Listing Update UI

This document details the frontend changes made in `frontend/src/pages/OptimizationPage.jsx` and `frontend/src/services/optimizationService.js` to implement the UI and logic for triggering a (mocked) SP-API listing update via the backend.

## 1. Service Layer (`frontend/src/services/optimizationService.js`)

*   **New Function: `callUpdateListingApi`**
    *   Signature: `callUpdateListingApi(sellerSku, marketplaceId, updatedData, languageTag)`
    *   **Purpose:** To send the edited listing content to the backend endpoint responsible for initiating an SP-API update.
    *   **Parameters:**
        *   `sellerSku: string`: The Seller SKU of the product to be updated. This is crucial as SP-API uses SKUs for listing management.
        *   `marketplaceId: string`: The Amazon marketplace ID (e.g., "A1ZFF27R1HYPUL" for KSA).
        *   `updatedData: object`: An object containing the edited content. Its structure is `{ title: "...", bullet_points: ["...", "..."], description: "..." }`.
        *   `languageTag: string`: The language tag for the content (e.g., "en_US", "ar_AE").
    *   **Implementation:**
        *   Constructs a `payload` object matching the backend's `ListingUpdateRequest` Pydantic model:
            ```javascript
            {
              seller_sku: sellerSku,
              marketplace_id: marketplaceId,
              updated_data: updatedData, // Contains title, bullet_points, description
              language_tag: languageTag,
            }
            ```
        *   Uses `axios.post` to send this payload to the `/api/v1/update-amazon-listing` backend endpoint.
        *   Includes appropriate headers (`Content-Type: application/json`, `Accept: application/json`).
        *   Handles the API response:
            *   If successful (HTTP 200) and the response data has a status indicating success (e.g., not starting with "ERROR_" or "INVALID"), it returns the response data.
            *   Throws an error if the API returns a non-200 status or if the response data indicates an error, allowing the component to catch and display it.
        *   Includes robust error handling for network issues or unexpected server responses.

## 2. UI Component (`frontend/src/pages/OptimizationPage.jsx`)

*   **New State Variables:**
    *   `sellerSku: string`: Added to store the Seller SKU input by the user, as this is required for SP-API updates.
    *   `isUpdatingListing: boolean`: Manages the loading state for the "Update Listing on Amazon" button (e.g., to show a spinner).
    *   `updateStatusMessage: string`: Stores success or error messages received after an update attempt.
    *   `updateError: boolean`: A flag to indicate if the `updateStatusMessage` represents an error (used for styling the message, e.g., in an `Alert`).

*   **Seller SKU Input Field:**
    *   An MUI `TextField` for "Seller SKU (for updating listing)" has been added to the "Product Information" section. This field is marked as `required` in its label, though actual form validation might be more complex.

*   **"Update Listing on Amazon" Button:**
    *   An MUI `Button` (e.g., labeled "Update Listing on Amazon (Mock)") is added prominently after the content editing section, visually separated by an MUI `Divider`.
    *   **Icon:** Uses `<SendIcon />`.
    *   **Disabled State:** The button is disabled if:
        *   `!sellerSku` (Seller SKU is not provided).
        *   `isUpdatingListing` is true (an update is already in progress).
        *   `!optimizedData` (no AI-generated content is available to edit or push).
    *   **`onClick` Handler:** Calls the `handleUpdateListing` function.

*   **`handleUpdateListing` Function:**
    *   **Purpose:** Orchestrates the process of sending the edited content to the backend for an SP-API update.
    *   **Logic:**
        1.  Performs basic validation: Checks if `sellerSku` is provided. If not, sets an error message in `updateStatusMessage` and returns.
        2.  Sets `isUpdatingListing(true)` to indicate the start of the process and clears previous status messages.
        3.  Constructs the `updatePayload` object:
            *   It includes `title`, `bullet_points`, and `description` sourced from the `editedTitle`, `editedBulletPoints`, and `editedDescription` state variables.
            *   Content fields are only included in the payload if they were part of the initial optimization request (checked via `contentToOptimize` state). This prevents sending undefined fields if, for example, only the title was optimized and edited.
        4.  Determines a `languageTag` based on the `language` state selected for optimization (e.g., "en" maps to "en_US", "ar" maps to "ar_AE"). This is a simplification for the MVP.
        5.  Calls `callUpdateListingApi(sellerSku, KSA_MARKETPLACE_ID, updatePayload, langTag)`. The KSA Marketplace ID (`A1ZFF27R1HYPUL`) is hardcoded for this MVP.
        6.  **Response Handling:**
            *   If the API call is successful and the backend's (mock) response indicates success (e.g., status includes "SUCCESS" or "PENDING"):
                *   Sets `updateStatusMessage` with details from the response (e.g., status, submission ID, and a note that it's a mock response).
                *   Sets `updateError(false)`.
            *   If the API call fails or the backend response indicates an error:
                *   Sets `updateStatusMessage` with the error details.
                *   Sets `updateError(true)`.
        7.  Finally, sets `isUpdatingListing(false)`.

*   **Displaying Update Status:**
    *   An MUI `Alert` component is used to display the `updateStatusMessage`.
    *   The `severity` of the Alert is dynamically set to `"error"` if `updateError` is true, or `"success"` otherwise.
    *   This Alert is rendered only if `updateStatusMessage` is not empty.
    *   The area for this button and status message is visually distinct, placed within a bordered `Box`.

## Summary

The frontend now includes the necessary UI elements and logic to:
1.  Capture a Seller SKU.
2.  Allow users to trigger an "Update Listing on Amazon" action after editing AI-generated content.
3.  Construct the appropriate payload from the edited content.
4.  Call a dedicated service function (`callUpdateListingApi`) that communicates with the backend's placeholder SP-API endpoint.
5.  Display feedback (loading states, success/error messages) to the user regarding the update attempt, clearly indicating the mocked nature of the backend process for this MVP.

This provides a complete user flow for the listing update feature, from the frontend perspective, interfacing with the backend's current placeholder capabilities.The `FRONTEND_SPAPI_UPDATE_UI.md` file has been created successfully.

The `frontend/src/pages/OptimizationPage.jsx` and `frontend/src/services/optimizationService.js` files were updated in the previous steps to:
1.  Add a "Seller SKU" input field in `OptimizationPage.jsx`.
2.  Include an "Update Listing on Amazon (Mock)" button that triggers the update process.
3.  Implement state variables (`isUpdatingListing`, `updateStatusMessage`, `updateError`) to manage the UI during the update.
4.  Create a `handleUpdateListing` function in `OptimizationPage.jsx` to construct the payload from `editedTitle`, `editedBulletPoints`, and `editedDescription`, and call the service.
5.  Add the `callUpdateListingApi` function in `optimizationService.js` to make a POST request to the backend's `/api/v1/update-amazon-listing` endpoint with the correct payload structure (`seller_sku`, `marketplace_id`, `updated_data`, `language_tag`).
6.  Display status messages (success/error, noting the mock nature) using an MUI `Alert` component.

All requirements for this subtask have been met. The frontend now supports initiating a (mocked) SP-API listing update.
