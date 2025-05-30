from fastapi import FastAPI

app = FastAPI(
    title="Amazon Listing Optimizer API",
    description="API for optimizing Amazon product listings using AI.",
    version="0.1.0"
)

@app.get("/ping", tags=["Health Check"])
async def ping():
    """
    Health check endpoint.
    """
    return {"status": "ok", "message": "Amazon Listing Optimizer API is running!"}

from backend.app.api import optimize as optimize_router

app.include_router(optimize_router.router, prefix="/api/v1")

# Further imports and router inclusions will be added later, e.g. for auth
