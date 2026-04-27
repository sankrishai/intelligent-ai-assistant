# -*- coding: utf-8 -*-

import os
os.environ['PYTHONIOENCODING'] = 'utf-8'

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from logic import (
    generate_tests_ollama, generate_tests_gemini, generate_tests_kimi,
    generate_tests_openai, generate_tests_claude, generate_tests_deepseek, generate_tests_mistral,
    generate_tests_groq
)

app = FastAPI(title="Intelligent QA Assistant API")

# CORS - allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    provider: str
    message: str
    api_key: str = ""
    temperature: float = 0.6
    model_name: str = ""
    image_data: Optional[str] = None

class GenerateResponse(BaseModel):
    response: str

from dom_distiller import process_message_for_dom

@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    model = req.model_name or ""
    
    # Pre-process message for URLs or DOM snippets
    processed_message = await process_message_for_dom(req.message)

    if req.provider == "ollama":
        result = generate_tests_ollama(processed_message, temperature=req.temperature)
    elif req.provider == "gemini":
        result = generate_tests_gemini(processed_message, req.api_key, model_name=model or "gemini-2.5-flash-lite", temperature=req.temperature)
    elif req.provider == "openai":
        result = generate_tests_openai(processed_message, req.api_key, model_name=model or "gpt-4o", temperature=req.temperature, image_data=req.image_data)
    elif req.provider == "claude":
        result = generate_tests_claude(processed_message, req.api_key, model_name=model or "claude-sonnet-4-20250514", temperature=req.temperature)
    elif req.provider == "deepseek":
        result = generate_tests_deepseek(processed_message, req.api_key, model_name=model or "deepseek-chat", temperature=req.temperature)
    elif req.provider == "mistral":
        result = generate_tests_mistral(processed_message, req.api_key, model_name=model or "mistral-large-latest", temperature=req.temperature)
    elif req.provider == "kimi":
        result = generate_tests_kimi(processed_message, req.api_key, temperature=req.temperature)
    elif req.provider == "groq":
        result = generate_tests_groq(processed_message, req.api_key, model_name=model or "llama-3.3-70b-versatile", temperature=req.temperature)
    else:
        result = f"Unknown provider: {req.provider}"
    
    return GenerateResponse(response=result)

@app.get("/api/health")
async def health():
    return {"status": "ok"}

class GenerateImageRequest(BaseModel):
    prompt: str
    api_key: str

@app.post("/api/generate_image", response_model=GenerateResponse)
async def generate_image(req: GenerateImageRequest):
    from logic import generate_image_openai
    result = generate_image_openai(req.prompt, req.api_key)
    return GenerateResponse(response=result)

# --- Atlassian Integration ---
from atlassian import get_jira_issue, get_confluence_page, search_jira_jql

class JiraRequest(BaseModel):
    domain: str
    email: str
    api_token: str
    issue_key: str

class RovoRequest(BaseModel):
    domain: str
    email: str
    api_token: str
    jql: str

class AtlassianResponse(BaseModel):
    content: str
    error: bool = False

@app.post("/api/atlassian/jira", response_model=AtlassianResponse)
async def fetch_jira(req: JiraRequest):
    result = get_jira_issue(req.domain, req.email, req.api_token, req.issue_key)
    return AtlassianResponse(content=result, error="[ERROR]" in result)

@app.post("/api/atlassian/rovo", response_model=AtlassianResponse)
async def fetch_rovo(req: RovoRequest):
    result = search_jira_jql(req.domain, req.email, req.api_token, req.jql)
    return AtlassianResponse(content=result, error="[ERROR]" in result)

# --- Web Search Integration ---
from web_search import perform_web_search

class WebSearchRequest(BaseModel):
    query: str

class WebSearchResponse(BaseModel):
    content: str
    error: bool = False

@app.post("/api/web_search", response_model=WebSearchResponse)
async def fetch_web_search(req: WebSearchRequest):
    result = perform_web_search(req.query)
    return WebSearchResponse(content=result, error="[ERROR]" in result)


# --- Serve React Frontend ---
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve index.html to allow React Router to handle client-side routing
        return FileResponse(os.path.join(frontend_dist, "index.html"))
