# -*- coding: utf-8 -*-

import os
os.environ['PYTHONIOENCODING'] = 'utf-8'

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import json

from logic import (
    generate_tests_gemini, generate_tests_kimi,
    generate_tests_openai, generate_tests_claude, generate_tests_deepseek, generate_tests_mistral,
    generate_tests_groq, generate_tests_ollama, generate_image_openai,
    stream_tests_gemini, stream_tests_openai, stream_tests_claude,
    stream_tests_deepseek, stream_tests_mistral, stream_tests_groq, stream_tests_kimi,
    stream_tests_ollama, get_ollama_models
)
from dom_distiller import process_message_for_dom
from atlassian import get_jira_issue, get_confluence_page, search_jira_jql
from web_search import perform_web_search

app = FastAPI(title="Intelligent QA Assistant API")

# CORS - allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request/Response Models ---

class GenerateRequest(BaseModel):
    provider: str
    message: str
    api_key: str = ""
    temperature: float = 0.6
    model_name: str = ""
    image_data: Optional[str] = None
    is_locator_mode: bool = False
    conversation_history: Optional[list] = None

class GenerateResponse(BaseModel):
    response: str
    distilled_dom: Optional[str] = None
    source_url: Optional[str] = None
    dom_warning: Optional[str] = None

class GenerateImageRequest(BaseModel):
    prompt: str
    api_key: str

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

class WebSearchRequest(BaseModel):
    query: str

class WebSearchResponse(BaseModel):
    content: str
    error: bool = False

# --- API Endpoints ---

@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    model = req.model_name or ""

    dom_result = await process_message_for_dom(req.message, is_locator_mode=req.is_locator_mode)
    processed_message = dom_result["message"]
    history = req.conversation_history or []

    if req.provider == "gemini":
        result = generate_tests_gemini(processed_message, req.api_key, model_name=model or "gemini-2.5-flash", temperature=req.temperature, image_data=req.image_data, history=history)
    elif req.provider == "openai":
        result = generate_tests_openai(processed_message, req.api_key, model_name=model or "gpt-4o", temperature=req.temperature, image_data=req.image_data, history=history)
    elif req.provider == "claude":
        result = generate_tests_claude(processed_message, req.api_key, model_name=model or "claude-opus-4-7", temperature=req.temperature, image_data=req.image_data, history=history)
    elif req.provider == "deepseek":
        result = generate_tests_deepseek(processed_message, req.api_key, model_name=model or "deepseek-chat", temperature=req.temperature, history=history)
    elif req.provider == "mistral":
        result = generate_tests_mistral(processed_message, req.api_key, model_name=model or "mistral-large-latest", temperature=req.temperature, history=history)
    elif req.provider == "kimi":
        result = generate_tests_kimi(processed_message, req.api_key, model_name=model or "kimi-k2.6", temperature=req.temperature, history=history)
    elif req.provider == "groq":
        result = generate_tests_groq(processed_message, req.api_key, model_name=model or "llama-3.3-70b-versatile", temperature=req.temperature, history=history)
    elif req.provider == "ollama":
        result = generate_tests_ollama(processed_message, model_name=model or "llama3.2", temperature=req.temperature, history=history)
    else:
        result = f"Unknown provider: {req.provider}"

    return GenerateResponse(
        response=result,
        distilled_dom=dom_result.get("distilled_dom"),
        source_url=dom_result.get("source_url"),
        dom_warning=dom_result.get("fetch_error"),
    )


@app.post("/api/stream")
async def stream_generate(req: GenerateRequest):
    """SSE streaming endpoint for real-time token delivery."""
    model = req.model_name or ""

    dom_result = await process_message_for_dom(req.message, is_locator_mode=req.is_locator_mode)
    processed_message = dom_result["message"]
    history = req.conversation_history or []

    stream_map = {
        "gemini": lambda: stream_tests_gemini(processed_message, req.api_key, model_name=model or "gemini-2.5-flash", temperature=req.temperature, image_data=req.image_data, history=history),
        "openai": lambda: stream_tests_openai(processed_message, req.api_key, model_name=model or "gpt-4o", temperature=req.temperature, image_data=req.image_data, history=history),
        "claude": lambda: stream_tests_claude(processed_message, req.api_key, model_name=model or "claude-opus-4-7", temperature=req.temperature, image_data=req.image_data, history=history),
        "deepseek": lambda: stream_tests_deepseek(processed_message, req.api_key, model_name=model or "deepseek-chat", temperature=req.temperature, history=history),
        "mistral": lambda: stream_tests_mistral(processed_message, req.api_key, model_name=model or "mistral-large-latest", temperature=req.temperature, history=history),
        "kimi": lambda: stream_tests_kimi(processed_message, req.api_key, model_name=model or "kimi-k2.6", temperature=req.temperature, history=history),
        "groq": lambda: stream_tests_groq(processed_message, req.api_key, model_name=model or "llama-3.3-70b-versatile", temperature=req.temperature, history=history),
        "ollama": lambda: stream_tests_ollama(processed_message, model_name=model or "llama3.2", temperature=req.temperature, history=history),
    }

    async def event_stream():
        meta = {}
        if dom_result.get("distilled_dom"):
            meta["distilled_dom"] = dom_result["distilled_dom"][:3000]
        if dom_result.get("source_url"):
            meta["source_url"] = dom_result["source_url"]
        if dom_result.get("fetch_error"):
            meta["dom_warning"] = dom_result["fetch_error"]
        if meta:
            yield f"data: {json.dumps({'type': 'meta', **meta})}\n\n"

        if req.provider not in stream_map:
            yield f"data: {json.dumps({'type': 'error', 'content': f'Unknown provider: {req.provider}'})}\n\n"
            yield "data: [DONE]\n\n"
            return

        try:
            stream_fn = stream_map[req.provider]
            async for chunk in stream_fn():
                yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/generate_image", response_model=GenerateResponse)
async def generate_image(req: GenerateImageRequest):
    result = generate_image_openai(req.prompt, req.api_key)
    return GenerateResponse(response=result)


@app.post("/api/atlassian/jira", response_model=AtlassianResponse)
async def fetch_jira(req: JiraRequest):
    result = get_jira_issue(req.domain, req.email, req.api_token, req.issue_key)
    return AtlassianResponse(content=result, error="[ERROR]" in result)


@app.post("/api/atlassian/rovo", response_model=AtlassianResponse)
async def fetch_rovo(req: RovoRequest):
    result = search_jira_jql(req.domain, req.email, req.api_token, req.jql)
    return AtlassianResponse(content=result, error="[ERROR]" in result)


@app.post("/api/web_search", response_model=WebSearchResponse)
async def fetch_web_search(req: WebSearchRequest):
    result = perform_web_search(req.query)
    return WebSearchResponse(content=result, error="[ERROR]" in result)


@app.get("/api/ollama/models")
async def ollama_models():
    """Returns installed Ollama models and connection status."""
    models = get_ollama_models()
    return {"models": models, "connected": len(models) > 0}


# --- Serve React Frontend ---
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))
