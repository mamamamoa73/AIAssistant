# Backend API MVP Setup

This document describes the implementation of the initial MVP for the Amazon Listing Optimizer backend API.

## Implemented Features

1.  **FastAPI Application (`backend/app/main.py`):**
    *   Initialized a FastAPI application.
    *   Includes a `/ping` health check endpoint.
    *   Integrates the optimization API router.

2.  **Pydantic Models (`backend/app/models/optimization_models.py`):**
    *   `ManualProductDetails`: For manual product data input.
    *   `ProductInput`: For ASIN or manual product details.
    *   `OptimizationConfig`: For language, content types, keywords, tone.
    *   `OptimizationRequest`: Main request body for the optimization endpoint.
    *   `OptimizedContent`: To structure AI-generated titles, bullets, descriptions.
    *   `OptimizationResponse`: Standardized response format including request ID, status, data, and error messages.

3.  **OpenAI Service Mock (`backend/app/services/openai_service.py`):**
    *   `generate_optimized_content` function:
        *   Dynamically constructs a simplified prompt based on `ProductInput` and `OptimizationConfig`.
        *   Logs the generated prompt that *would* be sent to OpenAI.
        *   **Mocks the OpenAI API call:** Returns hardcoded English, Arabic, or Bilingual content based on the `language` in `OptimizationConfig`.
        *   Returns an `OptimizedContent` model, respecting the `content_to_optimize` list.
        *   Includes a placeholder for `OPENAI_API_KEY`.

4.  **Amazon Product API Service Placeholder (`backend/app/services/amazon_product_api_service.py`):**
    *   `fetch_product_details_by_asin` placeholder function:
        *   Logs the ASIN it's called with.
        *   Returns mock product data for a specific ASIN ("B08XYZ1234") or `None` for others.

5.  **Optimization API Endpoint (`backend/app/api/optimize.py`):**
    *   POST endpoint `/api/v1/optimize-listing`.
    *   Accepts `OptimizationRequest` in the request body.
    *   Calls `openai_service.generate_optimized_content`.
    *   (Logic for calling `amazon_product_api_service` is commented out for now but can be easily integrated).
    *   Generates a unique `request_id`.
    *   Returns an `OptimizationResponse`.
    *   Includes basic error handling, raising an HTTPException for now.

6.  **Requirements (`backend/requirements.txt`):**
    *   Includes `fastapi`, `uvicorn[standard]`, `pydantic`, `python-dotenv`, and `openai`.

## How to Run the FastAPI Server Locally

1.  **Navigate to the backend directory:**
    ```bash
    cd path/to/your/project/amazon-listing-optimizer/backend
    ```

2.  **Create and activate a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set the Python path (if running from the `backend` directory, to ensure `backend.app` imports work):**
    This step is crucial if your `PYTHONPATH` doesn't automatically include the project root or if `backend.app` is not recognized.
    One way is to run uvicorn from the directory *above* `backend`, or set `PYTHONPATH`.
    If running from the `amazon-listing-optimizer` directory (one level above `backend`):
    ```bash
    export PYTHONPATH=. # On Linux/macOS
    # set PYTHONPATH=. # On Windows (cmd)
    # $env:PYTHONPATH="." # On Windows (PowerShell)
    
    uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
    ```
    Alternatively, if you are inside the `backend` directory:
    ```bash
    # Ensure your IDE or terminal is configured so that the 'backend' directory's parent is in PYTHONPATH
    # Or, more directly for Uvicorn (if inside 'backend/'):
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

    The server will be available at `http://localhost:8000`.
    API documentation (Swagger UI) will be at `http://localhost:8000/docs`.
    Alternative API documentation (ReDoc) will be at `http://localhost:8000/redoc`.

## Example `curl` Command to Test

You can use the `/docs` endpoint for interactive testing. Alternatively, here's a `curl` command to test the `/api/v1/optimize-listing` endpoint.

**Example 1: Arabic Optimization with Manual Input**
```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/optimize-listing' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "product_input": {
      "manual_details": {
        "name": "سماعات بلوتوث لاسلكية",
        "key_features": ["إلغاء الضوضاء", "بطارية تدوم 20 ساعة", "صوت عالي الجودة"],
        "category": "إلكترونيات"
      },
      "target_audience": "الشباب ومحبي الموسيقى في السعودية"
    },
    "optimization_config": {
      "language": "ar",
      "content_to_optimize": ["title", "bullet_points", "description"],
      "custom_keywords": ["عروض", "جديد"],
      "tone_style": "persuasive"
    }
  }'
```

**Example 2: English Optimization with ASIN (uses mock data for ASIN)**
```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/optimize-listing' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "product_input": {
      "asin": "B08XYZ1234" 
    },
    "optimization_config": {
      "language": "en",
      "content_to_optimize": ["title", "bullet_points"],
      "custom_keywords": ["sale", "new_arrival"],
      "tone_style": "formal"
    }
  }'
```

**Example 3: Bilingual Optimization**
```bash
curl -X 'POST' \
  'http://localhost:8000/api/v1/optimize-listing' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "product_input": {
      "manual_details": {
        "name": "My Bilingual Product",
        "key_features": ["Feature A", "Feature B"]
      }
    },
    "optimization_config": {
      "language": "bilingual_ar_en",
      "content_to_optimize": ["title", "description"]
    }
  }'
```

Check the terminal where `uvicorn` is running for log outputs, including the mock prompt generated by `openai_service.py`.
The response will contain the `request_id`, `status`, and the `data` field with the mock optimized content.All files for the backend API MVP setup have been created as requested.

This includes:
*   `backend/app/main.py`: FastAPI app initialization, `/ping` endpoint, and router inclusion.
*   `backend/app/models/optimization_models.py`: All Pydantic models (`ProductInput`, `ManualProductDetails`, `OptimizationConfig`, `OptimizationRequest`, `OptimizedContent`, `OptimizationResponse`).
*   `backend/app/services/openai_service.py`: `generate_optimized_content` function with mock OpenAI call, dynamic prompt construction (simplified), logging of the prompt, and placeholder for API key. It returns hardcoded content based on language.
*   `backend/app/services/amazon_product_api_service.py`: Placeholder `fetch_product_details_by_asin` function.
*   `backend/app/api/optimize.py`: FastAPI router with the POST `/optimize-listing` endpoint, handling `OptimizationRequest` and returning `OptimizationResponse`.
*   `backend/requirements.txt`: Includes `fastapi`, `uvicorn[standard]`, `pydantic`, `python-dotenv`, and `openai`.
*   `BACKEND_API_MVP_SETUP.md`: Describes the implementation, how to run the server, and example `curl` commands for testing the endpoint with different language configurations.

The backend structure is in place, data models are defined, the OpenAI interaction is mocked, and the main optimization endpoint is functional.
