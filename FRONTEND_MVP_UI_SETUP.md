# Frontend MVP UI Setup: Amazon Listing Optimizer

This document describes the setup and implementation of the initial MVP for the Amazon Listing Optimizer frontend.

## 1. Project Setup & Dependencies

*   The project is initialized as a Vite + React application in the `frontend/` directory.
*   **Key Dependencies:**
    *   `react`, `react-dom`
    *   `vite`
    *   `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material` (for Material UI components)
    *   `axios` (for making HTTP requests to the backend API)
*   All dependencies are listed in `frontend/package.json`.

## 2. Key Components Created

*   **`frontend/src/main.jsx`:**
    *   The main entry point for the React application.
    *   Wraps the `App` component with `React.StrictMode` and MUI's `ThemeProvider` and `CssBaseline` for consistent styling. A basic MUI theme is initialized.

*   **`frontend/src/App.jsx`:**
    *   The root component of the application.
    *   Sets up a basic page layout using MUI's `Container` and `Box`.
    *   Renders a main title and the `OptimizationPage`.

*   **`frontend/src/pages/OptimizationPage.jsx`:**
    *   This is the core component for the MVP, containing the user interface for product input and optimization configuration.
    *   **Features:**
        *   **Product Input Section:**
            *   MUI `TextField` for ASIN.
            *   MUI `TextField` for Manual Product Name.
            *   MUI `TextField` for Manual Key Features (multiline, comma-separated input).
            *   MUI `TextField` for Target Audience (optional).
        *   **Optimization Configuration Section:**
            *   MUI `Select` for Language (Options: English, Arabic, Bilingual).
            *   MUI `FormGroup` with `Checkbox` controls for selecting content to optimize (Title, Bullet Points, Description).
            *   MUI `TextField` for Custom Keywords (comma-separated input).
            *   MUI `Select` for Tone/Style (optional).
        *   **Submission & Feedback:**
            *   MUI `Button` to trigger the optimization process.
            *   Displays a loading indicator (`CircularProgress`) and disables the button during API calls.
            *   Displays error messages using MUI `Alert` if the API call fails or input validation fails.
            *   Displays the raw JSON response from the API in an `Alert` for now (success or informational).
        *   **Layout:** Uses MUI `Grid` for structuring the form elements and `Paper` for a card-like appearance.

*   **`frontend/src/services/optimizationService.js`:**
    *   Contains the `callOptimizeApi(payload)` function.
    *   Uses `axios` to send a POST request to the backend's `/api/v1/optimize-listing` endpoint.
    *   Constructs the payload according to the backend's `OptimizationRequest` Pydantic model.
    *   Includes error handling for API requests (network errors, server errors).
    *   The API base URL is configurable via Vite environment variables (`VITE_API_BASE_URL`) or defaults to `http://localhost:8000/api/v1`.

*   **`frontend/src/index.css`:**
    *   Provides basic global styles and a light background color for the application.

## 3. State Management

*   State management within `OptimizationPage.jsx` is handled using React's `useState` hook.
*   Individual states are maintained for:
    *   Product input fields (`asin`, `manualProductName`, `manualKeyFeatures`, `targetAudience`).
    *   Optimization configuration fields (`language`, `contentToOptimize` object, `customKeywords`, `toneStyle`).
    *   API call status (`loading`, `error`, `apiResponse`).
*   Form input changes update these states, and on submission, these states are used to construct the payload for the API call.

## 4. How to Run the Frontend Vite Development Server

1.  **Navigate to the frontend directory:**
    ```bash
    cd path/to/your/project/amazon-listing-optimizer/frontend
    ```

2.  **Install dependencies (if not already done):**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The server will typically start on `http://localhost:5173` (Vite's default port, but it might vary if the port is in use). Check the terminal output for the exact URL.

## 5. API Call Confirmation

*   The frontend is fully capable of constructing the request payload based on user input in the form.
*   It calls the `callOptimizeApi` service, which makes a POST request to the backend endpoint (`http://localhost:8000/api/v1/optimize-listing` by default).
*   **Testing:**
    *   To test successfully, the backend server (FastAPI) must be running and accessible at the configured URL.
    *   If the backend is running and the request is successful, the API response is stored in the `apiResponse` state and displayed as a JSON string within an MUI `Alert` component.
    *   If there's an error (e.g., backend not running, network issue, backend returns an error status), an error message is displayed in an MUI `Alert`.
    *   Console logs are also present in `optimizationService.js` and `OptimizationPage.jsx` to trace the payload and response.

This setup fulfills the requirements for the frontend MVP UI, allowing users to input product data, configure optimization parameters, and initiate an API call to the backend.
