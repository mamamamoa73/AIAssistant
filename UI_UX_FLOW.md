# UI/UX Flow: AI-Powered Amazon Listing Optimization Tool (Bolt AI)

This document outlines the user interface (UI) and user experience (UX) flow for the Amazon Listing Optimization tool, assuming it's built on a platform like Bolt AI.

## 0. Global UI Elements

*   **Language Switcher:** A persistent toggle/dropdown (e.g., in the header or sidebar) allowing users to switch the tool's interface language between English and Arabic. This affects all UI labels, buttons, and instructions.
*   **Navigation:** Clear navigation (e.g., sidebar or top menu) for main sections like "Dashboard," "New Optimization," "History," "Account Settings."

## 1. User Authentication & Onboarding

*   **1.1. Login/Sign-Up:**
    *   **UI:** Standard login page (email/password) and a "Sign Up" link.
    *   **UX:** Users log in with existing credentials or create a new account. OAuth options (e.g., "Sign in with Google") could be provided.
*   **1.2. Initial Setup (Simplified for now):**
    *   **UI:** A welcome screen or a prompt after first login.
    *   **UX:**
        *   Briefly introduce the tool's capabilities.
        *   For now, this step is minimal. The primary focus is on ASIN/manual input.
        *   *(Future)*: Prompt to connect their Amazon Seller Central account via OAuth2 for SP-API integration. This would be a guided process with clear instructions and permissions requests. If skipped, the tool relies on public data (Product Advertising API) and manual input.

## 2. Product Selection/Input

*   **UI:** A dedicated "Start New Optimization" page or section.
*   **UX:** User chooses how to input product information.

*   **2.1. Option 1: Enter ASIN (for existing Amazon.sa listings)**
    *   **UI:**
        *   A prominent text input field labeled "Enter Amazon Product ASIN (for Amazon.sa)".
        *   A "Fetch Product Details" button.
        *   Helper text: "Example: B08XYZ1234. We'll retrieve current listing details from Amazon.sa."
    *   **UX:**
        1.  User enters a valid ASIN for a product on `amazon.sa`.
        2.  User clicks "Fetch Product Details."
        3.  System displays a loading indicator while fetching data via the Amazon Product Advertising API.
        4.  On success: The fetched details (current title, bullet points, description, main image URL) are displayed read-only for reference and automatically populate relevant fields in the "Optimization Configuration" step.
        5.  On failure (e.g., invalid ASIN, product not found on Amazon.sa): An error message is displayed (e.g., "Product not found for ASIN on Amazon.sa. Please check the ASIN or use manual input.").

*   **2.2. Option 2: Manual Product Input (for new or unlisted products)**
    *   **UI:**
        *   A clear toggle or tab to switch to "Manual Product Input."
        *   Input fields for:
            *   "Product Name/Type" (e.g., "Wireless Headphones") (Required)
            *   "Brand" (Optional)
            *   "Product Category on Amazon" (e.g., "Electronics > Headphones > Bluetooth Headphones") (Optional, but helps with keyword suggestions later)
            *   "Key Features / Selling Points" (Text area, user can list features) (Required)
            *   "Target Audience" (e.g., "Gamers," "Business Professionals," "Saudi Youth") (Optional)
            *   "Current Draft Title" (Optional, text input)
            *   "Current Draft Bullet Points" (Optional, text area, one bullet per line)
            *   "Current Draft Description" (Optional, rich text editor or markdown)
    *   **UX:**
        1.  User selects "Manual Product Input."
        2.  User fills in the necessary product details. Required fields are clearly marked.
        3.  This information will be used directly to construct prompts for the AI.

## 3. Optimization Configuration

*   **UI:** A dedicated section or step, appearing after product information is successfully fetched or entered.
*   **UX:** User specifies how they want the listing to be optimized.

*   **3.1. Content to Optimize:**
    *   **UI:** Checkboxes:
        *   `[x] Optimize Title` (default checked)
        *   `[x] Optimize Bullet Points` (default checked)
        *   `[x] Optimize Product Description` (default checked)
    *   **UX:** User checks/unchecks the listing elements they want the AI to generate.

*   **3.2. Language Selection:**
    *   **UI:**
        *   Dropdown labeled "Optimization Language":
            *   "Arabic (عربي)"
            *   "English"
            *   "Bilingual - Arabic Primary, English Secondary"
            *   "Bilingual - English Primary, Arabic Secondary"
        *   Conditional UI (if "Bilingual" is selected):
            *   Checkboxes or dropdowns for each content type (Title, Bullets, Description) to specify language. E.g., "Title Language: [Arabic | English | Both]", "Bullet Points Language: [Arabic | English | Both]".
    *   **UX:**
        *   User selects the desired language(s) for the optimized content.
        *   If "Bilingual" is chosen, they specify how languages should be applied to each element. This guides the AI prompt. For "Both", the AI would be asked to provide distinct versions.

*   **3.3. Keywords:**
    *   **UI:**
        *   Text input field labeled "Keywords to Prioritize (comma-separated)". Example: "شاحن سريع, ايفون, أصلي"
        *   *(Future Feature Display)*: A disabled section or a note: "Trending KSA keywords based on your product category will be suggested here soon!"
    *   **UX:**
        *   User can input specific keywords they want the AI to try and incorporate. These are added to the prompts.

*   **3.4. Tone/Style (Optional):**
    *   **UI:**
        *   Dropdown labeled "Desired Tone (Optional)":
            *   "Default (KSA Appropriate)"
            *   "Formal (رسمي)"
            *   "Persuasive (مقنع)"
            *   "Friendly (ودي)"
            *   "Technical (تقني)"
            *   "Luxury (فاخر)"
    *   **UX:** User can select a tone to guide the AI's writing style. "Default" will use a generally accepted persuasive and clear tone for KSA.

## 4. Content Generation & Preview

*   **UI:**
    *   A prominent button: "Optimize My Listing (تحسين القائمة)" or "Generate Suggestions (إنشاء الاقتراحات)".
*   **UX:**
    1.  User finalizes configurations and clicks "Optimize My Listing."
    2.  **Loading Indicator:** A clear loading animation or progress bar is displayed. Text like "Optimizing your listing... (جاري تحسين القائمة...)" or "Generating content with AI... (جاري إنشاء المحتوى بالذكاء الاصطناعي...)" is shown. This process might take several seconds.
    3.  **Preview Screen Appears:**
        *   **Layout:** Two-column layout or tabbed view for easy comparison.
            *   **Column 1 (or Tab 1): "Current Listing"** (If ASIN was provided and data fetched). Displays the original title, bullet points, and description. If manual input was used, this section might be hidden or show the manually entered drafts.
            *   **Column 2 (or Tab 2): "AI-Optimized Suggestions"**.
        *   **Content Display:**
            *   For each element (Title, Bullet Points, Description) that was selected for optimization:
                *   Clear labels, e.g., "Current English Title:", "Optimized Arabic Title:", "Optimized English Title:" (if bilingual and "Both" was selected for title).
                *   The AI-generated content is shown in editable text boxes or rich text areas.
                *   Text input fields automatically adjust for RTL (Arabic) or LTR (English) content.
        *   **Keyword Highlighting:** Any user-provided keywords or system-suggested keywords (future) that are present in the AI-generated content are visually highlighted (e.g., bolded or with a different background color).

## 5. Editing & Refinement

*   **UI:** The "AI-Optimized Suggestions" are presented in editable fields.
*   **UX:** Users review the AI-generated content and can make changes.

*   **5.1. Direct Editing:**
    *   **UI:** Standard text input fields or rich text editors for each generated piece of content (Title, each Bullet Point, Description).
    *   **UX:** User can click into any field and type to make modifications, corrections, or additions. Changes are saved locally in the browser session.

*   **5.2. Regenerate Specific Sections:**
    *   **UI:**
        *   A "Regenerate (إعادة إنشاء)" button next to each optimized section (e.g., "Regenerate Title," "Regenerate Bullet Point 3," "Regenerate Description").
        *   *(Optional Advanced)* A small "Adjust Prompt" icon or link next to the regenerate button.
    *   **UX:**
        1.  If a user is not satisfied with a specific piece of generated content, they click "Regenerate" for that section.
        2.  *(Optional Advanced)* If they click "Adjust Prompt," a modal could show the last prompt fragment used for that section and allow minor edits (e.g., add/remove a keyword, slightly change an instruction) before regeneration.
        3.  The system sends a request back to the AI to generate a new version for that specific section only, using the original product info and configuration, plus any minor prompt adjustments.
        4.  A loading indicator appears for that section, and then the new content replaces the old one.
        5.  Users can iterate this process.

## 6. Output Delivery/Update

*   **UI:** A section below the preview/editing area with action buttons.
*   **UX:** User decides what to do with the finalized optimized content.

*   **6.1. Option 1: Copy to Clipboard:**
    *   **UI:**
        *   Button: "Copy Title (نسخ العنوان)"
        *   Button: "Copy Bullet Points (نسخ النقاط الرئيسية)"
        *   Button: "Copy Description (نسخ الوصف)"
        *   Button: "Copy All Optimized Content (نسخ كل المحتوى المحسن)"
    *   **UX:** Clicking a button copies the respective finalized text to the user's clipboard. A small confirmation message ("Copied!") appears.

*   **6.2. Option 2: Download:**
    *   **UI:**
        *   Button: "Download Content (تحميل المحتوى)"
        *   Dropdown (optional, or based on settings): Format [ .txt | .csv ]
    *   **UX:**
        *   User clicks "Download Content."
        *   The system prepares a file (e.g., `optimized_listing_ASIN.txt` or a CSV with columns for Title, Bullet1, Bullet2, ..., Description).
        *   The file is downloaded to the user's computer.

*   **6.3. (Future Feature) Option 3: Update Listing on Amazon:**
    *   **UI:**
        *   Button: "Update Listing on Amazon (تحديث القائمة على أمازون)" (This button would be disabled if the Amazon Seller Central account is not connected, with a tooltip explaining why).
    *   **UX:**
        1.  User clicks "Update Listing on Amazon."
        2.  **Confirmation Modal:** "Are you sure you want to update your listing [ASIN/Product Name] on Amazon.sa with the new content? This will overwrite the existing data." Buttons: "Confirm Update (تأكيد التحديث)" and "Cancel (إلغاء)."
        3.  If confirmed, the system uses the Amazon Selling Partner (SP-API) integration to submit the changes.
        4.  **Feedback:**
            *   Loading indicator: "Updating listing on Amazon..."
            *   Success message: "Listing updated successfully on Amazon.sa! Please allow some time for changes to reflect."
            *   Error message: "Failed to update listing. Error: [Amazon API Error Message]. Please try again or update manually via Seller Central."

## 7. Multi-Language Support Logic (Summary from UI Perspective)

*   **Tool Interface Language:** As mentioned in "Global UI Elements," a language switcher (e.g., English/Arabic) for the tool's own labels, buttons, and instructions. The Bolt AI platform should ideally support this localization.
*   **Content Language:**
    *   **Input Fields:** Text areas and input fields for product details, keywords, and AI-generated content must correctly support both LTR (English) and RTL (Arabic) text entry and display. This includes proper alignment and cursor behavior.
    *   **Previews:** When displaying current vs. optimized content, or bilingual content, labels must be unambiguous (e.g., "Optimized Arabic Title," "Current English Description"). The rendering of Arabic text should be accurate (correct character joining, RTL).
    *   **Configuration:** Language selection options (Section 3.2) are key to defining the output language and are clearly labeled in the current UI language.

This flow aims to be intuitive, providing flexibility for different user scenarios (existing vs. new products) and guiding the user through the optimization process with clear options and feedback.
