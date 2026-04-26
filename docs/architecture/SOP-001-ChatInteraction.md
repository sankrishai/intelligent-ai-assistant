# SOP 001: Chat Interaction (React Frontend)

## Goal
Provide a responsive, enterprise-grade Web UI where users can paste code and receive generated test cases, interact with multiple AI providers, and customize their experience.

## Connectivity
- **Layer 2**: Calls the FastAPI backend (`server.py`) at `http://localhost:8000/api/generate` for AI processing.

## UI Components
1. **Header**: "Intelligent QA AI Assistant" with an AI brain icon.
2. **Sidebar**:
    - **Provider Selection**: Dropdown menu to select AI Provider (Ollama, Gemini, OpenAI, Claude, DeepSeek, Mistral, Moonshot Kimi).
    - **Model Selection**: Dynamic dropdown populated based on the chosen provider.
    - **API Key Input**: Dynamic input field to enter cloud API keys.
    - **Temperature Slider**: Adjust generation temperature (0.0 to 1.0).
    - **Connection Status**: Real-time checking of the backend API health.
    - **Theme Toggle**: Switch between dark and light modes.
3. **Chat Window**:
    - `MessageBubble`: Displays user inputs (blue gradient) and AI responses (markdown-formatted rendering).
    - Empty state view featuring helpful template query suggestions.
4. **Input Area**: `ChatInput` field supporting multi-line text and a character counter.

## State Management (React)
1. **User Preferences**: `theme`, `provider`, `apiKey`, `temperature`, and `model` preferences are tracked using React State and persisted where applicable.
2. **Messages**: Managed as a list state `[{role, content, timestamp}]`.
3. **Handle Input**:
    - On submit, append user message to local state.
    - Disable input and show a loading animation.
    - **Call Backend API**: Send `{provider, message, api_key, temperature, model_name}` via `fetch()` to `/api/generate`.
    - Append backend response to internal message state.
    - Re-enable input area.
4. **Error Handling**: Graceful error handling in the chat UI if the API is offline or the provider fails.
