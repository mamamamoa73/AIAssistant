from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import openai
import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Load OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Create FastAPI app
app = FastAPI()

# Serve HTML templates
templates = Jinja2Templates(directory="templates")

# Serve static files like JS or CSS
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/ask")
async def ask_openai(request: Request):
    data = await request.json()
    prompt = data.get("prompt", "")

    if not prompt:
        return JSONResponse(content={"response": "No prompt provided."})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        answer = response.choices[0].message.content.strip()
        return JSONResponse(content={"response": answer})
    except Exception as e:
        return JSONResponse(content={"response": f"Error: {str(e)}"})
