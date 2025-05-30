# Frontend: Editing, Side-by-Side Preview & Regeneration

This document details the enhancements made to `frontend/src/pages/OptimizationPage.jsx` to enable side-by-side content preview (with mocked "current" content), in-place editing of AI-generated suggestions, and a "Regenerate" option.

## 1. State Management for Edited Content

*   New state variables were introduced to hold the user-editable versions of the AI-generated content:
    *   `editedTitle`, `setEditedTitle` (for the product title)
    *   `editedBulletPoints`, `setEditedBulletPoints` (an array for bullet points)
    *   `editedDescription`, `setEditedDescription` (for the product description)
*   A `useEffect` hook monitors changes to `optimizedData` (the raw AI output from the API). When `optimizedData` is populated or changes:
    *   `editedTitle` is initialized with `optimizedData.optimized_title || ''`.
    *   `editedBulletPoints` is initialized with `optimizedData.optimized_bullet_points || []`.
    *   `editedDescription` is initialized with `optimizedData.optimized_description || ''`.
    *   This ensures that whenever new AI suggestions arrive (either from the initial optimization or after regeneration), the editable fields are populated with these new suggestions. If `optimizedData` is null (e.g., on error or initial load), the edited fields are cleared.

## 2. Side-by-Side Preview and Editing Layout

The "Optimized Content" display section was restructured to provide a side-by-side comparison and editing experience:

*   **Overall Structure:** A main header "Review & Edit Optimized Content" was added, along with a "Regenerate All" button at the top of this section.
*   **Layout per Field (Title, Bullet Points, Description):**
    *   Each content type (title, bullet points, description) is presented in its own `Box` container.
    *   Inside each `Box`, an MUI `Grid container spacing={2}` is used to create two columns.
    *   **"Current Content" Column (Left Side - `Grid item xs={12} md={6}`):**
        *   This column serves as a placeholder to show where the user's current Amazon listing content would appear.
        *   For this MVP, it uses disabled MUI `TextField` components.
        *   The `value` of these TextFields is set to a placeholder string like:
            *   `Current title for ASIN ${asin} would show here.` (if ASIN was provided)
            *   "Current title (if any) would show here." (if no ASIN)
        *   These fields are styled with a light grey background (`sx={{backgroundColor: 'grey.100'}}`) to visually differentiate them as non-interactive mockups.
    *   **"AI-Generated & Editable Content" Column (Right Side - `Grid item xs={12} md={6}`):**
        *   **Title:** An MUI `TextField` is used.
            *   `value` is bound to `editedTitle`.
            *   `onChange` updates `editedTitle` via `setEditedTitle(e.target.value)`.
        *   **Bullet Points:**
            *   The `editedBulletPoints` array is mapped. For each bullet point string at a given `index`:
                *   An MUI `TextField` is rendered.
                *   `value` is bound to `bullet` (the current bullet point string).
                *   `onChange` calls `handleBulletPointChange(index, e.target.value)`, which updates the specific bullet point in the `editedBulletPoints` array.
                *   Alongside each bullet point's `TextField`, "Copy" and "Remove" (`<RemoveCircleOutlineIcon />`) buttons are provided.
            *   An "Add Bullet Point" (`<AddCircleOutlineIcon />`) button is available below the list of bullet points to append a new empty string to the `editedBulletPoints` array, allowing users to add new points.
        *   **Description:** An MUI `TextField` (multiline) is used.
            *   `value` is bound to `editedDescription`.
            *   `onChange` updates `editedDescription` via `setEditedDescription(e.target.value)`.
        *   Each editable field (or group of fields for bullets) has its own "Copy" button that now targets the edited content.

## 3. "Regenerate" Functionality

*   **Button:** An MUI `Button` labeled "Regenerate All" with a `<RefreshIcon />` is prominently placed at the top of the "Review & Edit Optimized Content" section.
*   **Logic:**
    *   The `onClick` handler for this button calls a `handleRegenerate` function.
    *   `handleRegenerate` simply calls the existing `handleSubmit()` function.
    *   `handleSubmit()` already constructs the API request payload based on the *current values in the main form fields* (ASIN, manual product name/features, target audience, language, content types to optimize, custom keywords, tone/style).
    *   Therefore, regeneration uses the user's original (or currently set in the top form) product input and configuration settings, not the content in the `editedTitle`, `editedBulletPoints`, or `editedDescription` fields.
    *   When the API response is received, `optimizedData` is updated. The `useEffect` hook then automatically updates `editedTitle`, `editedBulletPoints`, and `editedDescription` with the new suggestions from the AI, effectively refreshing the editable fields.
    *   The "Regenerate All" button is disabled while an API call is in progress (`loading` state is true).

## 4. Updating "Copy to Clipboard"

*   The `handleCopyToClipboard(textToCopy, label)` function remains the same.
*   However, the "Copy" buttons associated with the title, individual bullet points, "Copy All Edited Bullets", and description now pass the corresponding values from the `editedTitle`, `editedBulletPoints` (or specific bullet string), and `editedDescription` state variables to this function.
    *   For example, the title copy button now calls `handleCopyToClipboard(editedTitle, 'Title')`.
    *   The "Copy All Edited Bullets" button calls `handleCopyToClipboard(editedBulletPoints.join('\n'), 'All Edited Bullet Points')`.

This setup provides a user-friendly way to review AI suggestions alongside (mocked) current content, make direct edits to the suggestions, and request new suggestions from the AI based on the original input criteria.The `FRONTEND_EDITING_REGENERATION.md` file has been created successfully.

The `frontend/src/pages/OptimizationPage.jsx` was updated in the previous step to include:
1.  **State Management for Edited Content:** Added `editedTitle`, `editedBulletPoints`, and `editedDescription` states, initialized/reset by a `useEffect` hook when `optimizedData` changes.
2.  **Side-by-Side Preview Layout:** Implemented a two-column `Grid` layout where:
    *   The left column shows disabled `TextField` components with placeholder text for "Current Content" (mocked).
    *   The right column uses `TextField` components for `editedTitle`, `editedBulletPoints` (with add/remove functionality), and `editedDescription`, allowing in-place editing.
3.  **"Regenerate" Functionality:**
    *   A "Regenerate All" button triggers the main `handleSubmit` function, re-using the original form inputs (ASIN, manual details, language, keywords, etc.) for the API call.
    *   The new API response updates `optimizedData`, which then updates the editable fields with fresh AI suggestions.
4.  **Updated "Copy to Clipboard":** Copy buttons now source their content from the `editedTitle`, `editedBulletPoints`, and `editedDescription` states.

All requirements for this subtask have been met. The frontend now supports reviewing, editing, and regenerating AI-optimized content in a side-by-side view.
