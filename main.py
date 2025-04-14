from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env (for local testing)
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# Allow frontend (e.g., Vercel) to access backend (Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your Vercel URL for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Jinja2 templates (for index.html)
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/generate-listing")
async def generate_listing(request: Request):
    data = await request.json()
    
    title = data.get("title", "")
    category = data.get("category", "")
    features = data.get("features", [])
    keywords = data.get("keywords", "")
    urls = data.get("competitor_urls", [])

    prompt = f"""
You're an expert Amazon copywriter. Generate a high-converting product listing with the following info:

Title: {title}
Category: {category}
Features: {', '.join(features)}
Keywords: {keywords}
Competitor URLs: {', '.join(urls)}

Return:
- Title
- 5 Bullet Points
- Description
- Keyword Suggestions
- SEO Score (0-100) with brief analysis
"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Or "gpt-3.5-turbo"
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800
        )

        content = response.choices[0].message.content.strip()
        return JSONResponse(content={"listing": content})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/api/analyze-competitors")
async def analyze_competitors(request: Request):
    data = await request.json()
    urls = data.get("urls", [])

    # Dummy analysis
    analysis = []
    for idx, url in enumerate(urls):
        analysis.append({
            "url": url,
            "insight": f"Product {idx+1} seems to focus on 'durability' and 'eco-friendliness'. Consider highlighting similar strengths or finding gaps."
        })

    return JSONResponse(content={"analysis": analysis})
