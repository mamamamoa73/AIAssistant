# Frontend: Internationalization (i18n) Setup

This document details the implementation of internationalization (i18n) in the frontend application, enabling support for English (en) and Arabic (ar) languages, including Right-to-Left (RTL) layout for Arabic.

## 1. Libraries Installed

The following libraries were added to `frontend/package.json` to support i18n:

*   **`i18next`**: The core internationalization framework.
*   **`react-i18next`**: React bindings for `i18next`, providing hooks and components.
*   **`i18next-browser-languagedetector`**: A plugin to detect the user's language from various sources (localStorage, navigator, htmlTag).

These were installed via `npm install` or `yarn add`.

## 2. i18next Configuration

*   **File:** `frontend/src/i18n.js`
*   **Initialization:**
    *   `i18next` is initialized using `LanguageDetector` and `initReactI18next`.
    *   **Resources:** Translation files are loaded from `frontend/src/locales/en/translation.json` and `frontend/src/locales/ar/translation.json`.
    *   **Fallback Language:** Set to `'en'`. If the detected language is not available or a translation key is missing, English will be used.
    *   **Interpolation:** `escapeValue` is set to `false` as React already protects against XSS.
    *   **Language Detection:** Configured to detect language in the order: `localStorage`, `navigator` (browser settings), `htmlTag`. Detected language is cached in `localStorage`.
    *   **Debugging:** Enabled in development mode (`process.env.NODE_ENV === 'development'`).

## 3. Translation Files

*   **Structure:**
    *   `frontend/src/locales/en/translation.json`: Contains English translations.
    *   `frontend/src/locales/ar/translation.json`: Contains Arabic translations.
*   **Content:**
    *   These JSON files store key-value pairs, where the key is a unique identifier for a string, and the value is the translated text.
    *   All user-facing text from `OptimizationPage.jsx` and `App.jsx` (including labels, button text, helper text, titles, menu items, and messages) has been extracted and added to these files.
    *   Placeholders for dynamic values (e.g., `{{label}}`, `{{index}}`, `{{status}}`, `{{submissionId}}`, `{{message}}`) are used in translation strings for interpolation.

## 4. Integration in `main.jsx`

*   **File:** `frontend/src/main.jsx`
*   The `frontend/src/i18n.js` configuration file is imported at the top, ensuring `i18next` is initialized before the application renders.
*   An `AppWithTheme` component was created to dynamically set the MUI theme's direction (`theme.direction`) based on `i18n.dir()`. This ensures MUI components adapt to RTL/LTR layouts correctly.

## 5. Using Translations in Components

*   **Hook:** The `useTranslation` hook from `react-i18next` is used in components like `OptimizationPage.jsx` and `App.jsx`.
*   **`t` Function:** Destructured from `useTranslation()`, the `t` function is used to access translated strings. For example, `t('appTitle')` will render the "Amazon Listing Optimizer KSA" string in English or its Arabic equivalent.
*   **Interpolation:** For strings with dynamic values, the `t` function is used with an options object, e.g., `t('copiedFeedback', { label: 'Title' })`.

## 6. Language Switcher Component

*   **File:** `frontend/src/components/LanguageSwitcher.jsx`
*   **Functionality:**
    *   Provides two MUI `Button` components (within a `ButtonGroup`) for "English" and "العربية".
    *   Uses `i18n.changeLanguage(lng)` to switch the application's language.
    *   Buttons are disabled if their respective language is already active.
*   **Integration:** The `LanguageSwitcher` component is included in `frontend/src/App.jsx` to be accessible globally.

## 7. RTL Support for Arabic

*   **MUI Theme:** As mentioned, `frontend/src/main.jsx` now includes `AppWithTheme` which sets `direction: i18n.dir()` in the MUI theme. This automatically handles most MUI component styling for RTL.
*   **Global HTML Direction:**
    *   In `frontend/src/i18n.js`, an event listener for `languageChanged` updates the `lang` and `dir` attributes on the `document.documentElement` (the `<html>` tag):
        ```javascript
        i18n.on('languageChanged', (lng) => {
          document.documentElement.lang = lng;
          document.documentElement.dir = getDirection(lng); // getDirection returns 'rtl' for 'ar'
        });
        ```
    *   The `getDirection(lng)` helper function is defined in `i18n.js` to return `'rtl'` for `'ar'` and `'ltr'` otherwise.
*   **CSS Considerations:** While MUI handles much of RTL, custom CSS should use logical properties (e.g., `margin-inline-start` instead of `margin-left`) for full RTL compatibility. This was noted but not explicitly implemented as part of this i18n setup, assuming existing CSS is minimal or already uses logical properties where appropriate.

## 8. Adding New Translatable Strings

1.  **Identify the String:** Find any hardcoded user-facing text in a component.
2.  **Choose a Key:** Decide on a unique, descriptive key (e.g., `newUserGreeting`, `submitButtonLabel`).
3.  **Add to JSON Files:**
    *   Add the key and its English translation to `frontend/src/locales/en/translation.json`.
    *   Add the key and its Arabic translation to `frontend/src/locales/ar/translation.json`.
4.  **Use in Component:**
    *   Import `useTranslation` hook: `import { useTranslation } from 'react-i18next';`
    *   Get the `t` function: `const { t } = useTranslation();`
    *   Replace the hardcoded string with `t('yourKey')`. If using dynamic values, pass them as an object: `t('greetingUser', { userName: name })`.

This setup provides a comprehensive i18n solution for the frontend, allowing easy addition of new languages and translations in the future.The `FRONTEND_I18N.md` file has been created successfully.

The internationalization (i18n) for the frontend application has been implemented, including:
1.  **Installed Libraries:** `i18next`, `react-i18next`, and `i18next-browser-languagedetector` were added to `frontend/package.json`.
2.  **i18next Configuration (`frontend/src/i18n.js`):** Configured with English and Arabic resources, language detection (localStorage, navigator), fallback to English, and React integration.
3.  **Translation Files:**
    *   `frontend/src/locales/en/translation.json`
    *   `frontend/src/locales/ar/translation.json` (Populated with keys from `OptimizationPage.jsx` and `App.jsx`)
4.  **Integration in `main.jsx`:** `i18n.js` is imported, and an `AppWithTheme` component dynamically sets MUI theme direction based on `i18n.dir()`.
5.  **`useTranslation` Hook:** `OptimizationPage.jsx` and `App.jsx` were updated to use the `t` function for all user-facing text.
6.  **`LanguageSwitcher.jsx` Component:** Created and added to `App.jsx` to allow users to switch between English and Arabic.
7.  **RTL Support:** Handled by updating `document.documentElement.dir` via an `i18n.on('languageChanged', ...)` listener in `i18n.js` and by setting MUI theme direction.

All requirements for this subtask have been met. The frontend now supports UI in both English and Arabic with appropriate RTL layout for Arabic.
