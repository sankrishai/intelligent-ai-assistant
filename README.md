# 🧠 Intelligent QA AI Assistant

An enterprise-grade, localized, and cloud-connected AI assistant designed specifically for Software Quality Assurance (QA) and Full-Stack Testing tasks. The assistant helps developers and QA engineers quickly generate test cases, automate scripts (Selenium, Playwright, Cypress), review code for bugs, interact with Atlassian tracking software, generate images, search the web, and draft comprehensive test plans.

![Intelligent QA AI Assistant](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)

## ✨ Key Features

- **Domain-Specific AI:** Uses highly tailored System Prompts optimized for full-stack software development, advanced test automation (UI/API/Performance), CI/CD coverage analysis, and precise QA consulting.
- **Strict Anti-Hallucination Guardrails:** The AI is strictly prompted to admit when it lacks information, demand clarification when a prompt is vague, and maintain a hyper-efficient, terse conversational style.
- **Modern Enterprise UI:** A beautiful React-based frontend featuring light/dark mode, real-time backend connection status, dynamic dropdown menus, markdown rendering, API key visibility toggling, "New Chat" clearing, and in-progress request cancellation (`Stop` button).
- **Multi-Provider Support:** Seamlessly switch between local offline inference models directly on your hardware and leading external cloud APIs.
- **Multi-Tool Integration Interface:** Replace traditional chat with powerful discrete actions available via the input action selector:
  - 💬 **Text / Code:** Standard chat and code generation.
  - 📸 **Visual QA (Image Upload):** Attach screenshots of your application UI and have the AI instantly generate Playwright/Selenium automation scripts or report bugs directly from the image!
  - 🌐 **Web Search:** Instantly fetch and summarize live data from the web using DuckDuckGo dynamically inside the answer prompt.
  - 🎨 **Generate Image:** Prompt DALL-E 3 image generation right inside the chat window.
  - 🤖 **Ask Rovo (Jira Search):** A lightweight agentic Rovo clone! Run JQL queries to search your entire Jira environment and have the AI synthesize the results instantly.
  - 🔵 **Query Jira:** Easily pull a specific Jira ticket data directly into your AI context to generate immediate test steps based on bug reports or feature tickets.
  - 📘 **Query Confluence:** Digest huge Confluence engineering docs directly into your chat.

## 🔌 Supported AI Providers

The system supports the leading frontier models from multiple top-tier providers out-of-the-box:

1. **Ollama (Local)** - Run models entirely local and privately (e.g., `llama3.2:3b`).
2. **OpenAI** - Connect to the bleeding edge `gpt-4.5-preview`, `o1`, `gpt-4o`, `gpt-4-turbo`, and more. (Supports Visual QA)
3. **Anthropic Claude** - Supports `claude-opus-4-7`, `claude-sonnet-4-7`, `claude-3-7-sonnet-20250219`, and more.
4. **Google Gemini** - Leverage `gemini-3.1-pro`, `gemini-1.5-pro`, `gemini-2.0-flash`, and more.
5. **Groq** - Extremely fast inference using `Llama-3.3-70B`, `DeepSeek R1 Llama 70B`, `Mixtral 8x7B`, etc.
6. **DeepSeek** - High-reasoning chat with `deepseek-chat` and `deepseek-reasoner`.
7. **Mistral AI** - Use powerful open weights like `mistral-large-latest` and `codestral-latest`.
8. **Moonshot Kimi** - Connect to the highly capable `kimi-k2.5`.

## 🏗️ Architecture Stack

- **Frontend:** React.js, Vite, Vanilla CSS. Built into optimized, static production payloads.
- **Backend:** Python, FastAPI, Uvicorn. Implements isolated controller logic for different APIs, tool use APIs (web search, Jira, Confluence, Image-gen), and a static directory mount capable of simultaneously serving the React UI natively alongside the API.

---

## 🚀 Setup & Installation (Single-Server Mode)

The application has been unified so that the backend natively serves the compiled frontend. This removes CORS issues and exposes the entire application seamlessly on port `8000`.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python 3.9+](https://www.python.org/)
- [Ollama](https://ollama.com/) (If using local offline inference)

### 1. Build the React Frontend
Navigate to the frontend directory and build the static assets:
```bash
cd frontend
npm install
npm run build
```

### 2. Start the Unified Backend
Navigate to the backend directory, install Python packages, and launch:
```bash
cd ../backend

# (Optional) Setup Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Start Server
python3 -m uvicorn server:app --reload --port 8000
```

### 3. Usage
- Open a browser and navigate to **`http://localhost:8000`**.
- Look for the **"API Connected"** status indicator.
- Select your target AI Provider and provide API keys in the sidebar (for cloud models).
- Add any needed credentials for Atlassian (Jira/Confluence) inside the sidebar if you intend to use those specific tools in the Chat Input dropdown.

---

## 🌍 Exposing to the Public Internet (Cloudflare / Localtunnel)

Since the entire application (Frontend UI + Backend API) has been fused securely onto Port `8000`, you can expose it globally to the internet securely without port-forwarding your router using `localtunnel`:

1. Keep the python `uvicorn` server running on port `8000`.
2. Open a new terminal and run:
   ```bash
   npx -y localtunnel --port 8000 --subdomain my-qa-assistant
   ```
3. Share the generated URL (e.g., `https://my-qa-assistant.loca.lt`) with your team! 

---

## 🤝 Developed By

Designed and Developed by **[Sanjay Krishna](https://in.linkedin.com/in/sanjay-krishna)**.
