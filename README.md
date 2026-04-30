# Intelligent QA AI Assistant

An enterprise-grade AI assistant designed for Software Quality Assurance (QA) and Full-Stack Testing. Helps developers and QA engineers generate test cases, automate scripts (Selenium, Playwright, Cypress), review code, interact with Atlassian Jira, generate images, search the web, and draft comprehensive test plans.

![Intelligent QA AI Assistant](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)

## Key Features

- **Domain-Specific AI:** Tailored system prompts optimized for full-stack software development, advanced test automation (UI/API/Performance), CI/CD coverage analysis, and QA consulting.
- **Anti-Hallucination Guardrails:** The AI is prompted to admit when it lacks information, demand clarification on vague prompts, and maintain a concise conversational style.
- **Streaming & Non-Streaming Modes:** Toggle between real-time SSE token streaming and single-response API calls via the sidebar.
- **Per-Provider API Keys:** Each provider stores its own API key independently — switch providers without re-entering keys.
- **Conversation History:** Last 10 messages are sent as context for multi-turn conversations.
- **Modern UI:** React-based frontend with light/dark mode, real-time backend status, markdown rendering, code syntax highlighting, copy buttons, message regeneration, chat export, and request cancellation (Stop button).
- **Multi-Provider Support:** Switch between 7 leading AI providers with provider-specific model selection.
- **Image Upload:** Attach screenshots (up to 10 MB) to your message for AI analysis. Images are converted to base64 in-browser and sent inline — no files are stored on the server.
- **Multi-Tool Actions** available via the input action selector:
  - **Text / Code:** Standard chat and code generation.
  - **DOM Locator Gen:** Paste a URL or raw HTML snippet — the backend fetches, cleans, and distills the DOM (removing scripts, styles, noise) to generate grounded Page Object Models and native locators for Playwright/Selenium. Works best with pasted HTML; URL fetching is limited for JS-rendered SPAs.
  - **Web Search:** Fetch and summarize live web results via DuckDuckGo, integrated into the AI response.
  - **Generate Image:** DALL-E 3 image generation directly in chat.
  - **Query Jira:** Pull a specific Jira ticket into AI context for instant test step generation.
  - **Rovo (JQL Search):** Run JQL queries to search your Jira environment and have the AI synthesize results.

## Supported AI Providers

| Provider | Models | Vision Support |
|----------|--------|----------------|
| **Google Gemini** | gemini-2.5-flash, gemini-2.5-pro, gemini-2.5-flash-lite, gemini-3.1-pro-preview, gemini-3-flash-preview | Yes |
| **OpenAI** | gpt-4o, gpt-4o-mini, gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, o4-mini, o3, o3-mini | Yes |
| **Anthropic Claude** | claude-opus-4-7, claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5, claude-sonnet-4-5, claude-3-7-sonnet, claude-3-5-sonnet | Yes |
| **DeepSeek** | deepseek-chat (V3), deepseek-reasoner (R1) | No |
| **Mistral AI** | mistral-large-latest, mistral-small-latest, codestral-latest, magistral-medium, magistral-small, devstral | No |
| **Moonshot Kimi** | kimi-k2.6, kimi-k2.5 | No |
| **Groq** | llama-3.3-70b-versatile, llama-3.1-8b-instant, llama-4-scout-17b, qwen3-32b, gemma2-9b-it | No |

> Note: OpenAI reasoning models (o3, o3-mini, o4-mini) do not support custom temperature settings.

## Architecture

- **Frontend:** React.js + Vite + Vanilla CSS. Builds to optimized static assets.
- **Backend:** Python + FastAPI + Uvicorn. Handles AI provider routing, DOM distilling, Atlassian integration, web search, and serves the React UI as static files.
- **SSL:** All backend HTTP clients use `verify=False` for corporate proxy/firewall compatibility.

---

## Setup & Installation

The backend natively serves the compiled frontend on port `8000`.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python 3.9+](https://www.python.org/)

### 1. Build the React Frontend
```bash
cd frontend
npm install
npm run build
```

### 2. Start the Backend
```bash
cd ../backend

# (Optional) Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Start Server
python3 -m uvicorn server:app --reload --port 8000
```

### 3. Usage
- Open **`http://localhost:8000`** in your browser.
- Check for the **"Online"** status indicator in the sidebar.
- Select your AI provider and enter the API key (saved per-provider in localStorage).
- Configure Atlassian credentials (domain, email, API token) under Integrations if using Jira features.
- Toggle streaming ON/OFF in the Configuration section.

---

## Exposing to the Public Internet

Since the full app runs on port `8000`, you can expose it via localtunnel:

```bash
npx -y localtunnel --port 8000 --subdomain my-qa-assistant
```

Share the generated URL (e.g., `https://my-qa-assistant.loca.lt`) with your team.

---

## Developed By

Designed and developed by **[Sanjay Krishna](https://in.linkedin.com/in/sanjay-krishna)**.
