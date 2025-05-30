# Non-Functional Testing Approach: Amazon Listing Optimizer

## 1. Introduction

**Purpose:**
This document outlines the strategy and approach for conducting Non-Functional Testing (NFT) for the Amazon Listing Optimizer application. The goal is to evaluate aspects of the application that are not related to specific user actions but are critical to user satisfaction and application quality, such as usability, localization, basic security posture, and high-level performance characteristics.

**References:**
This document should be read in conjunction with:
*   `QA_SCOPE_DOCUMENT.md`: Defines what is in and out of scope for overall QA.
*   `TEST_PLAN.md`: Outlines the general testing activities, including functional testing.
*   `UI_UX_FLOW.md`: Describes the intended user interface flow.
*   `KSA_LOCALIZATION_GUIDELINES.md`: Provides guidelines for KSA market appropriateness.
*   `COMPLIANCE_BEST_PRACTICES.md`: Outlines security and data handling best practices.
*   `DEPLOYMENT_SETUP.md`: Details deployment considerations, including HTTPS.

## 2. Usability Testing (Heuristic Evaluation Approach)

*   **Objective:** Ensure the application is user-friendly, intuitive, efficient, and aligns with the defined `UI_UX_FLOW.md`. The aim is to identify usability problems in the user interface design.
*   **Method:** A manual heuristic evaluation will be performed by the QA engineer while executing functional test cases. This involves inspecting the UI and its interactive elements against a set of established usability principles (adapted from Nielsen's Heuristics). Usability issues and suggestions for improvement will be logged.
*   **Heuristics/Checks:**
    *   **Visibility of System Status:**
        *   Are there clear loading indicators (e.g., spinners, disabled buttons) during API calls (optimization, PAAPI fetch, SP-API mock update)?
        *   Does the system provide timely feedback on actions (e.g., "Content copied to clipboard!", success/error messages for optimization and updates)?
    *   **Match Between System and the Real World:**
        *   Is the language, terminology, and phrasing used in the UI (both English and Arabic) clear, understandable, and appropriate for Amazon sellers, particularly those targeting the KSA market?
        *   Do icons and symbols have clear and conventional meanings?
    *   **User Control and Freedom:**
        *   Can users easily navigate back and forth? (e.g., browser back button, clear navigation paths).
        *   Is it clear how to cancel or exit from an operation or modal (if any)?
        *   Can users easily correct input errors in forms?
        *   Is it easy to modify or discard edited AI suggestions?
    *   **Consistency and Standards:**
        *   Is terminology consistent throughout the application (e.g., "Optimize", "Generate", "ASIN", "SKU")?
        *   Are MUI components used consistently for similar functions (e.g., button styles, input field presentation)?
        *   Is the placement of common elements (e.g., primary action buttons, language switcher) predictable?
    *   **Error Prevention:**
        *   Are input fields clearly labeled, with placeholder text or helper text where appropriate (e.g., ASIN format, comma-separated keywords)?
        *   Are there client-side validations for critical inputs (e.g., ensuring ASIN or manual details are provided before optimization)?
        *   Are buttons disabled when actions are not applicable (e.g., "Update Listing" if no SKU or no optimized content)?
    *   **Recognition Rather Than Recall:**
        *   Are options and features clearly visible and accessible?
        *   Is the UI free of clutter, making it easy for users to find what they need without having to remember information from other parts of the interface?
        *   Are selected options (e.g., language, content types) clearly indicated?
    *   **Flexibility and Efficiency of Use:**
        *   Is the flow for optimizing a listing efficient for the primary use case?
        *   (Future consideration) Are there any accelerators for expert users (e.g., keyboard shortcuts - likely out of scope for MVP)?
        *   Can users easily manage multiple bullet points (add, edit, remove)?
    *   **Aesthetic and Minimalist Design:**
        *   Is the UI clean, organized, and visually appealing?
        *   Is there any irrelevant or distracting information presented?
        *   Is the information hierarchy clear?
    *   **Help Users Recognize, Diagnose, and Recover from Errors:**
        *   Are error messages (e.g., from form validation, API errors, SP-API mock updates) clear, polite, and constructive?
        *   Do error messages provide enough information for the user to understand the problem and how to potentially resolve it? (e.g., `updateStatusMessage`).
    *   **Help and Documentation (Conceptual):**
        *   Are there tooltips for icons or less obvious features (if any)?
        *   (Future consideration) Is there a clear path to access help or documentation (e.g., a help icon or link - the documentation itself is out of scope for MVP).

## 3. Localization (i18n) & Cultural Appropriateness Testing

*   **Objective:** Verify complete and accurate translation of the UI into English and Arabic, ensure proper RTL layout and functionality for Arabic, and confirm cultural suitability for the KSA market as per `KSA_LOCALIZATION_GUIDELINES.md`.
*   **Method:** Manual testing by switching between English and Arabic languages using the language switcher. This will be done in conjunction with functional testing.
*   **Checks:**
    *   **Translation Accuracy & Completeness:**
        *   Spot-check all UI text elements (labels, buttons, titles, messages, placeholders, dropdown options) in Arabic against `frontend/src/locales/ar/translation.json`.
        *   Ensure no text is truncated or awkwardly phrased due to translation length differences.
        *   Verify that interpolated strings (e.g., `t('copiedFeedback', { label: '...' })`) are correctly rendered in both languages.
    *   **RTL Layout Integrity (Arabic):**
        *   Verify that the overall page layout correctly switches to RTL when Arabic is selected.
        *   Check text alignment (should be right-aligned).
        *   Ensure MUI components (input fields, buttons, dropdowns, checkboxes, alerts, snackbars) render correctly in RTL.
        *   Verify the positioning of icons relative to text (e.g., icons leading text should be on the right in RTL).
        *   Check for any layout breakage, overlapping elements, or incorrect scrollbar positioning.
    *   **Numbers, Dates, Calendars:**
        *   Currently, the application does not feature complex number formatting, dates, or calendars. If these are added, they must be tested for KSA local conventions (e.g., Hijri calendar if relevant, Arabic numerals - though Western numerals are common in digital KSA contexts).
    *   **Cultural Sensitivity & Appropriateness:**
        *   Review all UI text, icons, and any imagery (though currently minimal beyond standard MUI icons) against the `KSA_LOCALIZATION_GUIDELINES.md`.
        *   Ensure terminology is respectful and culturally appropriate for the Saudi Arabian context.
        *   Confirm that example texts or placeholders do not contain culturally insensitive content.
    *   **Language Persistence:**
        *   Verify that the selected language preference (English or Arabic) is maintained across browser sessions (e.g., after closing and reopening the browser), as per the `i18next-browser-languagedetector` configuration using `localStorage`.
    *   **Language Switcher Functionality:**
        *   Ensure the language switcher correctly changes the UI language and that the current language is clearly indicated or the other language button is enabled.

## 4. Basic Security Testing (Conceptual Review & Design Verification)

*   **Objective:** Identify potential basic security vulnerabilities by reviewing the application's design, code structure (conceptually), and adherence to best practices outlined in `COMPLIANCE_BEST_PRACTICES.md`. This is not a substitute for formal penetration testing.
*   **Method:** Review of documentation and conceptual verification during functional testing.
*   **Areas of Review:**
    *   **Input Validation (Conceptual Backend Review):**
        *   Verify that Pydantic models are used in FastAPI endpoints for request body validation, as this helps prevent basic data type mismatches and some forms of injection attacks. (Review `backend/app/models/*_models.py` and `backend/app/api/*.py`).
    *   **API Key Management:**
        *   Confirm (based on `backend/app/core/config.py` and frontend structure) that sensitive API keys (OpenAI, PAAPI, SP-API) are not hardcoded in frontend code.
        *   Verify that backend configuration intends for these keys to be loaded from environment variables.
    *   **Data Handling (SP-API Mock & PAAPI):**
        *   Review the mock SP-API service (`amazon_sp_api_service.py`) to ensure it doesn't inadvertently log or expose more data than necessary, even in its mocked state.
        *   Ensure that data fetched from PAAPI is handled appropriately and not exposed unnecessarily.
    *   **Error Message Content:**
        *   During functional testing, observe error messages returned from the backend to the frontend. Ensure they do not reveal sensitive system information (e.g., full stack traces, internal file paths, raw database errors). Error messages should be informative but generic.
    *   **HTTPS Usage (Deployment Design):**
        *   Confirm that the `DEPLOYMENT_SETUP.md` explicitly recommends and is designed for HTTPS for all communication in a production environment to protect data in transit.
    *   **Authentication/Authorization (User Accounts - Conceptual):**
        *   If user accounts were fully implemented, review the conceptual design for basic authentication security (e.g., are passwords intended to be hashed? Is session management considered?). For the current MVP, this is less applicable if user accounts are very basic or not implemented.
    *   **Secrets in Client-Side Code:**
        *   Double-check that no part of the frontend build process could inadvertently bundle backend secrets into client-side JavaScript.

## 5. Performance Testing (Conceptual - High-Level Observation)

*   **Objective:** Identify any obvious or significant performance bottlenecks during manual functional testing. This does not include formal load, stress, or soak testing.
*   **Method:** Subjective observation of application responsiveness while performing functional test cases across different features and with varying amounts of data (e.g., long descriptions, many bullet points). Log any noticeable delays, sluggishness, or high resource consumption (via browser dev tools).
*   **Areas to Observe:**
    *   **Application Initial Load Time:** How quickly does the frontend application load and become interactive? (Consider first load vs. cached).
    *   **API Response Times (Qualitative):**
        *   **PAAPI Fetch:** Is there a noticeable delay when an ASIN is provided and data is (conceptually) fetched?
        *   **OpenAI Content Generation:** How long does the "Optimizing..." state typically last? (This is highly dependent on the external OpenAI API).
        *   **Backend Endpoint Responsiveness:** Do backend calls for optimization or mock updates feel snappy under single-user load?
    *   **UI Responsiveness:**
        *   How quickly do UI elements respond to user interaction (e.g., typing in editable fields, adding/removing bullet points, switching languages)?
        *   Are there any freezes or noticeable lags during UI transitions or data display updates?
    *   **Large Data Handling (Conceptual):**
        *   If a user inputs a very long product description or many bullet points, does the UI remain responsive during editing and processing?
        *   (This is more for future consideration as current mocks don't stress this).
    *   **Browser Resource Usage (Basic Check):** Briefly monitor browser CPU/memory usage during intensive operations to catch any extreme anomalies.

This Non-Functional Testing Approach aims to complement functional testing by ensuring the application is not only correct but also usable, culturally appropriate for the KSA market, follows basic security design principles, and performs adequately for its intended purpose.The `NON_FUNCTIONAL_TESTING_APPROACH.md` file has been created successfully.

It includes the following sections:

1.  **Introduction:** Purpose and references to other relevant documents.
2.  **Usability Testing (Heuristic Evaluation Approach):** Objective, method, and a detailed list of heuristics/checks (Visibility of System Status, Match Between System and Real World, User Control, Consistency, Error Prevention, Recognition vs. Recall, Flexibility, Aesthetic Design, Error Handling, Help/Documentation).
3.  **Localization (i18n) & Cultural Appropriateness Testing:** Objective, method, and checks (Translation Accuracy, RTL Layout Integrity, Numbers/Dates, Cultural Sensitivity, Language Persistence, Language Switcher Functionality).
4.  **Basic Security Testing (Conceptual Review & Design Verification):** Objective, method, and areas of review (Input Validation, API Key Management, Data Handling, Error Message Content, HTTPS, AuthN/AuthZ conceptuals, Secrets in client-side code).
5.  **Performance Testing (Conceptual - High-Level Observation):** Objective, method, and areas to observe (Application Load Time, API Response Times, UI Responsiveness, Large Data Handling conceptuals, Basic Browser Resource Usage).

This document provides a structured approach for evaluating the non-functional aspects of the Amazon Listing Optimizer application.
