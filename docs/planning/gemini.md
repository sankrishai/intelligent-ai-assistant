# Project Constitution

## 1. Vision
**North Star:** A Local LLM Test Case Generator (UI Chat) that uses Ollama (Llama 3.2) OR Gemini Cloud to generate test cases based on user input.

## 2. Integrations
- **Core Engine 1:** Ollama (specifically `llama3.2:3b`)
- **Core Engine 2:** Google Gemini SDK (`gemini-1.5-flash`)
- **Libraries:** `ollama`, `google-generativeai`, `streamlit`.

## 3. Technology Stack (Backend & Frontend)
- **Language**: Python 3.10+
- **Backend Logic**: Pure Python (orchestrated via Streamlit).
- **Frontend**: Streamlit.
- **LLM Interface**: `ollama` Python library & `google.generativeai`.

## 4. Data Schemas

### Core Domain: Test Generation
**InputObject**
```json
{
  "user_input": "string (Code snippet)",
  "provider": "string (Ollama or Gemini)",
  "api_key": "string (If Gemini selected)"
}
```

**OutputObject**
```json
{
  "response": "string (The generated test cases/chat response)",
  "model_used": "string"
}
```

## 5. Behavioral Rules
- ** Determinism**: Responses must be consistent.
- ** Template-Driven**: Use a strict prompt template stored in the codebase.
- ** Interaction**: Chat-based UI.

## 6. Architectural Invariants
- **Source of Truth**: User Input (NA for DB).
- **Layer 1 (Interface)**: Streamlit App (`app.py`).
- **Layer 2 (Logic)**: Handler (`logic.py`) with Provider Selector.
- **Layer 3 (Data)**: In-memory / APIs.

## 7. Maintenance Log (Phase 5)
- **2026-01-25 (v1.0)**: Initial Deployment (Ollama Only).
- **2026-01-25 (v1.1)**: Added Gemini Cloud Support.
    - Updated `requirements.txt`.
    - Added Provider Switcher to `app.py`.
    - Refactored `logic.py` for multi-provider support.
