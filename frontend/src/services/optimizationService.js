import axios from 'axios';

// Ensure this URL matches your backend configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Calls the backend API to optimize listing content.
 * @param {object} payload - The data payload for the API.
 *                           Should match the backend's OptimizationRequest Pydantic model.
 *                           Example:
 *                           {
 *                             product_input: {
 *                               asin: "ASIN_HERE", // or null
 *                               manual_details: { // or null if ASIN provided
 *                                 name: "Product Name",
 *                                 key_features: ["Feature 1", "Feature 2"]
 *                               },
 *                               target_audience: "Target Audience Here" // or null
 *                             },
 *                             optimization_config: {
 *                               language: "en", // "ar", "bilingual_ar_en"
 *                               content_to_optimize: ["title", "bullet_points"], // list of strings
 *                               custom_keywords: ["keyword1", "keyword2"], // or null
 *                               tone_style: "ksa_default" // or null
 *                             }
 *                           }
 * @returns {Promise<object>} The JSON response from the API.
 * @throws {Error} If the API call fails or returns a non-success status.
 */
export const callOptimizeApi = async (payload) => {
  try {
    console.log("Sending payload to API:", payload);
    const response = await axios.post(`${API_BASE_URL}/optimize-listing`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log("Received response from API:", response.data);

    if (response.status === 200 && response.data) {
        if (response.data.status === "error" && response.data.error_message) {
            throw new Error(`API Error: ${response.data.error_message}`);
        }
      return response.data;
    } else {
      // This case might not be hit often if backend always returns 200 with a status field
      throw new Error(`API returned status ${response.status} with data: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error("Error calling optimization API:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error data:", error.response.data);
      console.error("Error status:", error.response.status);
      console.error("Error headers:", error.response.headers);
      throw new Error(
        `API Error: ${error.response.data.detail || error.response.statusText || 'Server error'}`
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request:", error.request);
      throw new Error("API Error: No response received from server. Please ensure the backend is running.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
      throw error; // re-throw the original error or a new one
    }
  }
};

/**
 * Calls the backend API to update a listing on Amazon via SP-API (placeholder).
 * @param {string} sellerSku - The SKU of the product to update.
 * @param {string} marketplaceId - The marketplace ID for the update.
 * @param {object} updatedData - The content to update (title, bullet_points, description).
 *                               Example: { title: "New Title", bullet_points: ["BP1"], description: "New Desc" }
 * @param {string} languageTag - The language tag for the content (e.g., "en_US", "ar_AE")
 * @returns {Promise<object>} The JSON response from the API.
 * @throws {Error} If the API call fails or returns a non-success status.
 */
export const callUpdateListingApi = async (sellerSku, marketplaceId, updatedData, languageTag) => {
  const payload = {
    seller_sku: sellerSku,
    marketplace_id: marketplaceId,
    updated_data: updatedData, // This should match the ListingUpdateData Pydantic model on the backend
    language_tag: languageTag,
  };

  try {
    console.log("Sending update listing payload to API:", payload);
    // The endpoint in the backend is /api/v1/update-amazon-listing and it's a POST request.
    // It does not take ASIN in the path, but SKU in the body.
    const response = await axios.post(`${API_BASE_URL}/update-amazon-listing`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log("Received response from update listing API:", response.data);

    if (response.status === 200 && response.data) {
      // The backend's /update-amazon-listing endpoint directly returns ListingUpdateResponse
      // which has fields like status, submission_id, message, issues.
      // We don't need to check response.data.status === "error" here unless the
      // ListingUpdateResponse itself has a sub-status field that indicates an error
      // despite a 200 HTTP status. The current model for ListingUpdateResponse has a top-level 'status'.
      if (response.data.status && (response.data.status.startsWith("ERROR_") || response.data.status === "INVALID")) {
         throw new Error(`API Error: ${response.data.message || response.data.status}`);
      }
      return response.data; // This is expected to be the ListingUpdateResponse model
    } else {
      throw new Error(`API returned status ${response.status} with data: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error("Error calling update listing API:", error);
    if (error.response) {
      console.error("Error data (update API):", error.response.data);
      throw new Error(
        `API Error: ${error.response.data.detail || error.response.data.message || error.response.statusText || 'Server error during update'}`
      );
    } else if (error.request) {
      throw new Error("API Error: No response received from server for update listing. Please ensure the backend is running.");
    } else {
      throw error;
    }
  }
};
