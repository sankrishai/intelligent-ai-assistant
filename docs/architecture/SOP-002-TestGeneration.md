# SOP 002: Test Generation API Logic (FastAPI)

## Goal
Provide a unified, multi-provider REST API backend that securely handles generation requests and orchestrates interactions with both local and cloud-based LLM platforms.

## Inputs (GenerateRequest)
- `provider`: String representing the chosen AI platform (`ollama`, `gemini`, `openai`, `claude`, etc).
- `message`: String (User's source code or query).
- `api_key`: String (Optional API key for cloud services).
- `temperature`: Float (Generation temperature, default 0.6).
- `model_name`: String (Specific model identifier for the provider).

## Outputs (GenerateResponse)
- `response`: String (Markdown formatted AI generation).

## Connectivity
- **Layer 3**: Uses `templates.py` for standardizing System Prompts.
- **Layer 4**: Uses `logic.py` for provider-specific SDK wrappers (Ollama, Anthropic, OpenAI, Google GenAI).

## API Core (`server.py`)
1. **Health Check** (`GET /api/health`): Returns `{"status": "ok"}` for frontend connection polling.
2. **Generate Route** (`POST /api/generate`):
    - Parses the incoming `GenerateRequest` Pydantic model.
    - Routes the request to the corresponding function in `logic.py` based on `provider`.

## Logic Flow (`logic.py`)
1. **Prepare Prompt**:
    - Import `SYSTEM_PROMPT` from `templates.py`.
    - Construct standard message arrays containing the System Prompt and the User's query formatted via `format_user_prompt(source_code)`.
2. **Execute Generation Call**:
    - **Ollama**: Calls local Ollama service (`ollama.chat`).
    - **OpenAI / Mistral / DeepSeek / Kimi**: Calls the standardized OpenAI HTTP client pointing to their respective `base_url`.
    - **Claude**: Calls `anthropic.Anthropic`.
    - **Gemini**: Calls `google.generativeai`.
3. **Format Output**:
    - Extract raw markdown text from the provider's specific response schemas.
4. **Error Handling**:
    - Surround executions with `try/except`.
    - If a connection fails or an API key is invalid/missing, return a friendly, visible error message directly to the chat interface.
