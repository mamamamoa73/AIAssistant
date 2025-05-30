# Testing Strategy: Amazon Listing Optimizer

This document outlines the comprehensive testing strategy for the Amazon Listing Optimizer application, covering both frontend and backend components.

## 1. Overall Testing Goals

The primary objectives of our testing efforts are to:

*   **Ensure Reliability and Correctness:** Verify that all core features, especially listing optimization generation and external API integrations (Amazon PAAPI, SP-API, OpenAI), function as expected and produce accurate results.
*   **Validate Data Integrity:** Confirm that data is handled correctly throughout its lifecycle within the application, from input and fetching to processing and display.
*   **Confirm UI/UX Quality:** Ensure that frontend components render correctly, behave as designed in response to user interactions, and provide a user-friendly experience.
*   **Validate Localization (i18n) and RTL Support:** Verify that the application correctly displays in supported languages (English, Arabic) and that Right-to-Left (RTL) layout functions properly for Arabic.
*   **Ensure API Robustness:** Validate that API endpoints handle requests correctly, respond appropriately to valid and invalid inputs, and manage errors gracefully.

## 2. Backend Testing Strategy (Python/FastAPI)

The backend testing will be divided into unit and integration tests using `pytest`.

*   **Unit Tests:**
    *   **Tool:** `pytest` (with `pytest-mock` for mocking).
    *   **Scope:**
        *   **Service Modules:** Individually test functions and methods within service modules (`openai_service.py`, `amazon_product_api_service.py`, `amazon_sp_api_service.py`). This includes testing business logic, data transformations, and interactions with mocked external dependencies.
        *   **External API Call Mocking:** Utilize `unittest.mock` or `pytest-mock` to simulate responses from external APIs (OpenAI, PAAPI, SP-API), isolating the service logic being tested.
        *   **Pydantic Model Validation:** Test the validation logic of Pydantic models used for API request/response schemas and data structures. Ensure they correctly parse valid data and raise errors for invalid data.
        *   **Utility Functions:** Test any standalone utility functions or core logic within shared modules (e.g., in `backend/app/core/`).
        *   **API Route Handler Logic (Minimal):** While complex logic resides in services, any simple data processing or parameter handling directly in API route handlers can be unit tested (again, with services mocked).
    *   **Location:** `backend/tests/unit/`
        *   Example structure: `backend/tests/unit/services/test_openai_service.py`

*   **Integration Tests:**
    *   **Tool:** `pytest` with `httpx` (via FastAPI's `TestClient`).
    *   **Scope:**
        *   **API Endpoint Testing:** Make HTTP requests to the FastAPI `TestClient` to test each API endpoint (`/optimize-listing`, `/update-amazon-listing`, `/ping`). Verify request/response schemas, HTTP status codes, and header correctness.
        *   **Business Logic Flow:** Test the end-to-end flow of requests through the API layer down to the service layer, ensuring correct data processing and business logic execution.
        *   **Service Interactions:** Verify the correct interaction and data flow between different service modules (e.g., how `optimize.py` endpoint orchestrates calls to `amazon_product_api_service.py` and then `openai_service.py`).
        *   **Database Interaction (Future):** If database interactions become more complex (e.g., for user accounts, history), integration tests would involve a dedicated test database (e.g., a separate PostgreSQL instance or schema) to ensure data is correctly persisted and retrieved. For the current MVP, this is less critical.
        *   **Boundary Mocking:** Mock external dependencies at the HTTP boundary (e.g., the actual calls to Amazon/OpenAI APIs) to ensure the internal integration works correctly without relying on live external services during most integration tests.
    *   **Location:** `backend/tests/integration/`
        *   Example structure: `backend/tests/integration/api/test_optimize_api.py`

## 3. Frontend Testing Strategy (React/Vite/MUI)

The frontend testing will use Vitest (or Jest) with React Testing Library.

*   **Unit Tests:**
    *   **Tool:** Vitest (recommended due to Vite integration) or Jest, with React Testing Library.
    *   **Scope:**
        *   **Individual Components:** Test React components in isolation (e.g., `LanguageSwitcher.jsx`, custom input fields, buttons, display elements from `OptimizationPage.jsx`).
        *   **Rendering Logic:** Verify that components render correctly based on different sets of props and states.
        *   **User Interactions:** Simulate user events (clicks, form input changes, selections) using React Testing Library's event utilities and assert that the component's state updates correctly or that mock callback functions are called as expected.
        *   **Service Call Mocking:** Mock API service calls (functions within `frontend/src/services/optimizationService.js`) to isolate component logic and prevent actual HTTP requests during unit tests.
    *   **Location:** `frontend/src/components/__tests__/` or `frontend/src/pages/__tests__/` (co-located with components or pages).
        *   Example: `frontend/src/components/__tests__/LanguageSwitcher.test.jsx`

*   **Integration Tests (Component Integration):**
    *   **Tool:** Vitest or Jest with React Testing Library.
    *   **Scope:**
        *   **Page-Level Interaction:** Test how multiple components interact within a larger page component (e.g., the entire `OptimizationPage.jsx`). This includes testing the main form submission flow.
        *   **Data Flow:** Verify correct data flow between parent and child components, context providers/consumers, and state management solutions if used (e.g., Zustand, Redux Toolkit later).
        *   **Form Submission Logic:** Test form submissions, ensuring data is correctly gathered from inputs, validation (basic client-side) works, and the appropriate service call is made (mocked at the service boundary).
        *   **Conditional Rendering:** Verify that UI elements are correctly shown or hidden based on application state (e.g., displaying optimized content only after API success, showing loading spinners, error messages).
    *   **Location:** `frontend/src/pages/__tests__/` (can overlap with unit tests for page components, focusing on broader interactions).
        *   Example: `frontend/src/pages/__tests__/OptimizationPage.integration.test.jsx`

*   **End-to-End (E2E) Tests (Optional for MVP, but good to outline):**
    *   **Tool:** Playwright or Cypress.
    *   **Scope:**
        *   **Real User Scenarios:** Simulate complete user workflows by interacting with the application running in a real browser environment.
        *   **Critical User Flows:**
            1.  **ASIN Optimization Flow:** User inputs ASIN -> System fetches data (mocked backend for external calls or a controlled test environment) -> User configures optimization -> System generates and displays optimized content -> User edits content -> User copies content.
            2.  **Manual Input Optimization Flow:** User inputs manual product data -> User configures optimization -> System generates and displays optimized content.
            3.  **Language Switching:** User changes language -> UI text updates correctly -> RTL layout is applied for Arabic.
            4.  **(Future) Listing Update Flow:** User generates/edits content -> User provides SKU -> User clicks "Update Listing on Amazon" -> System (mock) confirms submission.
        *   These tests would typically run against a fully deployed instance of the application (frontend and backend connected) in a development or staging environment.
    *   **Location:** A separate top-level directory, e.g., `e2e-tests/`
        *   Example: `e2e-tests/specs/optimization-flow.spec.js`

## 4. Localization (i18n) Testing Specifics

*   **Frontend:**
    *   **Translation Accuracy:** Ensure all UI text elements are correctly translated when switching between English and Arabic. This can be verified using snapshot tests for components or specific assertions in integration tests.
    *   **RTL Layout:** Visually inspect the application in Arabic to ensure correct RTL layout (text alignment, component ordering, scrollbar positions). Automated visual regression testing tools or specific E2E checks can aid here.
    *   **Language Persistence:** Test that language preference is correctly detected (e.g., from browser settings or localStorage) and applied on initial load, and that manual language changes persist across sessions.
    *   **Dynamic Content:** For any content that might include interpolated values (e.g., "Copied {{label}} to clipboard!"), ensure these are correctly rendered in all languages.
*   **Backend (if applicable):**
    *   Currently, the backend uses the language parameter primarily to guide OpenAI prompt generation. If the backend were to return language-specific error messages or data, API tests would need to verify that these respect the language preference if passed in the request headers or body.

## 5. Mocking Strategy

A clear mocking strategy is essential to isolate units of code and ensure stable, fast tests.

*   **Backend Testing:**
    *   **Unit Tests:** Use `unittest.mock.patch` or `pytest-mock` to mock:
        *   External API clients (OpenAI, PAAPI, SP-API) within service tests.
        *   Other service dependencies if testing a service that calls another internal service.
        *   Database connections/sessions if testing data access logic without hitting a real database.
    *   **Integration Tests:**
        *   Mock external HTTP calls at the boundary of the application (e.g., using `respx` for `httpx` or patching the `requests` library if used by SDKs directly). This allows testing the full internal request/response cycle without actual external network calls.
        *   The FastAPI `TestClient` inherently mocks the HTTP server part.

*   **Frontend Testing:**
    *   **Unit/Integration Tests:**
        *   Mock the API service module (`frontend/src/services/optimizationService.js`) or individual functions within it (e.g., `callOptimizeApi`, `callUpdateListingApi`). This prevents actual HTTP requests during component tests and allows simulating various API responses (success, error, different data payloads).
        *   Use `vi.fn()` (Vitest) or `jest.fn()` (Jest) for mock functions.
    *   **E2E Tests:** Generally, E2E tests should run against a live backend. However, for certain scenarios or to ensure stability, the backend itself might be configured to return mock responses from its external dependencies (OpenAI, Amazon APIs) in a dedicated test/staging environment.

This testing strategy aims to build confidence in the application's functionality, reliability, and user experience through a layered approach.The `TESTING_STRATEGY.md` file has been created successfully.

It outlines:
1.  **Overall Testing Goals:** Covering reliability, data integrity, UI/UX, localization/RTL, and API error handling.
2.  **Backend Testing Strategy (Python/FastAPI):**
    *   **Unit Tests:** Using `pytest` and `pytest-mock` for service modules, Pydantic models, and utilities, with external APIs mocked. Location: `backend/tests/unit/`.
    *   **Integration Tests:** Using `pytest` with FastAPI's `TestClient` (and `httpx`) for API endpoints, service interactions, and potentially test database interactions, with external dependencies mocked at the boundary. Location: `backend/tests/integration/`.
3.  **Frontend Testing Strategy (React/Vite/MUI):**
    *   **Unit Tests:** Using Vitest/Jest with React Testing Library for individual components, interactions, and rendering, with API service calls mocked. Location: `frontend/src/components/__tests__/` or `frontend/src/pages/__tests__/`.
    *   **Integration Tests (Component Integration):** Using Vitest/Jest with React Testing Library for page-level component interactions, data flow, and form submissions, with services mocked. Location: `frontend/src/pages/__tests__/`.
    *   **End-to-End (E2E) Tests (Optional Outline):** Using Playwright or Cypress for critical user flows against a live application instance. Location: `e2e-tests/`.
4.  **Localization (i18n) Testing Specifics:** Covering translation accuracy, RTL layout verification, and language preference persistence for the frontend.
5.  **Mocking Strategy:** Detailing the use of `unittest.mock`/`pytest-mock` for the backend and mocking of `optimizationService.js` for the frontend during unit/integration tests.

This document provides a comprehensive guide for future testing activities. No actual test code was written as per the subtask requirements.
