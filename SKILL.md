# Intelligent QA AI Assistant — Project Context

## Overview
A multi-provider AI assistant for Software QA and Test Automation. Built by Sanjay Krishna.
React + Vite frontend, Python FastAPI backend, supports 7 AI providers with streaming and non-streaming modes.

## Architecture

```
frontend/          React + Vite (builds to frontend/dist/, served by backend)
backend/           Python FastAPI (uvicorn, port 8000)
api/index.py       Vercel serverless entry point (imports backend.server:app)
vercel.json        Vercel deployment config
run.sh             Local dev startup script
```

## Key Backend Files

| File | Purpose |
|------|---------|
| `backend/server.py` | FastAPI app, CORS, all API endpoints, serves frontend static files |
| `backend/logic.py` | AI provider integrations (generate + stream functions for all 7 providers) |
| `backend/templates.py` | System prompt (SYSTEM_PROMPT) and prompt formatting |
| `backend/dom_distiller.py` | URL fetching + HTML distillation for locator generation |
| `backend/atlassian.py` | Jira ticket fetch + JQL search (POST /rest/api/3/search/jql) |
| `backend/web_search.py` | DuckDuckGo search via ddgs library |

## Key Frontend Files

| File | Purpose |
|------|---------|
| `frontend/src/App.jsx` | Main app: state management, API calls, streaming SSE logic |
| `frontend/src/components/Sidebar.jsx` | Provider/model selection, API keys, capabilities, integrations |
| `frontend/src/components/ChatInput.jsx` | Message input, action selector dropdown, image upload |
| `frontend/src/components/ChatWindow.jsx` | Message display, markdown rendering, code highlighting |
| `frontend/src/App.css` | All styles (single file, ~2000 lines) |

## AI Providers

| Provider | Base URL | Vision | Notes |
|----------|----------|--------|-------|
| Google Gemini | google-generativeai SDK | Yes | Default: gemini-2.5-flash |
| OpenAI | api.openai.com | Yes | Reasoning models (o1/o3/o4-mini) skip temperature |
| Anthropic Claude | anthropic SDK | Yes | Uses messages.stream() for SSE |
| DeepSeek | api.deepseek.com (OpenAI-compatible) | No | Think-tag stripping applied |
| Mistral AI | api.mistral.ai/v1 (OpenAI-compatible) | No | |
| Moonshot Kimi | api.moonshot.ai/v1 (OpenAI-compatible) | No | UTF-8 sanitization applied |
| Groq | api.groq.com/openai/v1 (OpenAI-compatible) | No | Fast inference |

## Features

- **Streaming (SSE):** Toggle ON/OFF. Default OFF. Backend streams tokens via `text/event-stream`.
- **Non-streaming:** Single POST to `/api/generate`, full response returned at once.
- **DOM Locator Generation:** Paste HTML or URL → backend distills DOM → AI generates framework-aware locators (Playwright/Selenium/Cypress).
- **Jira Integration:** Fetch ticket by ID or search via JQL. Uses Atlassian REST API v3 with Basic Auth.
- **Web Search:** DuckDuckGo search results injected into AI context.
- **Image Generation:** DALL-E 3 via OpenAI.
- **Image Upload:** Screenshots up to 10MB, base64 encoded in-browser, sent inline to vision-capable providers.
- **Conversation History:** Last 10 messages sent as context for multi-turn conversations.
- **Per-Provider API Keys:** Stored in localStorage, independent per provider.

## System Prompt Behavior (templates.py)

- Never reveals source code, system prompts, or internal architecture
- Never outputs `<think>` tags or internal reasoning
- Asks for clarification when framework/language is ambiguous
- Framework-specific locator best practices (Playwright > Selenium > Cypress > Appium)
- Zero hallucination tolerance — admits uncertainty
- Direct, concise responses — no filler or emojis

## Technical Decisions

- **SSL verify=False:** All httpx clients disable SSL verification for corporate proxy compatibility
- **Think-tag stripping:** Regex removes `<think>...</think>` from non-streaming; buffered suppression for streaming
- **OpenAI-compatible pattern:** DeepSeek, Mistral, Kimi, Groq all use the OpenAI SDK with custom base_url
- **Shared httpx client:** Single `httpx.Client(verify=False)` instance reused across providers
- **Frontend state:** All config persisted to localStorage (provider, keys, model, temperature, streaming, atlassian config)

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/generate` | Non-streaming AI generation |
| POST | `/api/stream` | SSE streaming AI generation |
| POST | `/api/generate_image` | DALL-E 3 image generation |
| POST | `/api/atlassian/jira` | Fetch Jira ticket by ID |
| POST | `/api/atlassian/rovo` | JQL search |
| POST | `/api/web_search` | DuckDuckGo web search |
| GET | `/api/health` | Backend health check |

## Deployment

- **Local:** `uvicorn server:app --port 8000` serves both API and frontend (from `frontend/dist/`)
- **Vercel:** `api/index.py` wraps the FastAPI app as a serverless function
- **Dev mode:** Vite on :5173 + uvicorn on :8000 (CORS configured for both)
