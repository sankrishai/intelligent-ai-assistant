# -*- coding: utf-8 -*-

import os
os.environ['PYTHONIOENCODING'] = 'utf-8'

import httpx
import google.generativeai as genai
from openai import OpenAI
from templates import SYSTEM_PROMPT, format_user_prompt

# Shared httpx client that skips SSL verification (needed for corporate proxies/firewalls)
_http_client = httpx.Client(verify=False)


def _openai_client(api_key: str, base_url: str = None) -> OpenAI:
    """Create an OpenAI client with SSL verification disabled for corporate proxy compatibility."""
    kwargs = {"api_key": api_key, "http_client": _http_client}
    if base_url:
        kwargs["base_url"] = base_url
    return OpenAI(**kwargs)

def _build_history_messages(history: list, system_prompt: str, user_prompt: str) -> list:
    """Build messages list with conversation history for OpenAI-compatible APIs."""
    messages = [{"role": "system", "content": system_prompt}]
    # Add last N turns of history (keep context window manageable)
    for msg in history[-10:]:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": user_prompt})
    return messages


def generate_tests_gemini(source_code: str, api_key: str, model_name: str = "gemini-2.5-flash", temperature: float = 0.6, image_data: str = None, history: list = None) -> str:
    """
    Generates tests using Google Gemini API.
    """
    if not api_key:
        return "⚠️ Please enter your Gemini API Key in the sidebar."
        
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=SYSTEM_PROMPT
        )
        
        # Configure generation config
        config = genai.GenerationConfig(temperature=temperature)
        
        # Build Gemini conversation with history
        gemini_history = []
        if history:
            for msg in history[-10:]:
                role = "user" if msg.get("role") == "user" else "model"
                gemini_history.append({"role": role, "parts": [msg.get("content", "")]})

        content = [format_user_prompt(source_code)]

        if image_data:
            import base64
            # Handle data:image/png;base64, format
            if "," in image_data:
                header, encoded = image_data.split(",", 1)
                mime_type = header.split(":")[1].split(";")[0]
                img_bytes = base64.b64decode(encoded)
                content.append({
                    "mime_type": mime_type,
                    "data": img_bytes
                })

        if gemini_history:
            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(content, generation_config=config)
        else:
            response = model.generate_content(content, generation_config=config)
        return response.text
    except Exception as e:
        return f"❌ Gemini Error: {str(e)}"

def _sanitize_utf8(text: str) -> str:
    """Ensure text is clean UTF-8 by encoding and decoding."""
    return text.encode('utf-8', errors='replace').decode('utf-8')

def generate_tests_kimi(source_code: str, api_key: str, model_name: str = "kimi-k2.6", temperature: float = 0.6, history: list = None) -> str:
    """
    Generates tests using Kimi via Moonshot AI API (OpenAI-compatible).
    """
    if not api_key:
        return "⚠️ Please enter your Kimi API Key in the sidebar."

    try:
        # Sanitize inputs to avoid encoding issues
        clean_system_prompt = _sanitize_utf8(SYSTEM_PROMPT)
        clean_user_prompt = _sanitize_utf8(format_user_prompt(source_code))

        client = _openai_client(api_key=api_key, base_url="https://api.moonshot.ai/v1")

        response = client.chat.completions.create(
            model=model_name,
            messages=_build_history_messages(history or [], clean_system_prompt, clean_user_prompt),
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ Kimi Error: {str(e)}"


# OpenAI reasoning models that don't support custom temperature (must omit or use 1)
_OPENAI_REASONING_MODELS = {"o1", "o1-mini", "o1-preview", "o3", "o3-mini", "o4-mini"}


def generate_tests_openai(source_code: str, api_key: str, model_name: str = "gpt-4o", temperature: float = 0.6, image_data: str = None, history: list = None) -> str:
    """Generates tests using OpenAI API."""
    if not api_key:
        return "⚠️ Please enter your OpenAI API Key in the sidebar."
    try:
        client = _openai_client(api_key=api_key)

        user_content = [{"type": "text", "text": format_user_prompt(source_code)}]

        if image_data:
            user_content.append({
                "type": "image_url",
                "image_url": {
                    "url": image_data
                }
            })

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in (history or [])[-10:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": user_content})

        params = {"model": model_name, "messages": messages}
        if model_name not in _OPENAI_REASONING_MODELS:
            params["temperature"] = temperature

        response = client.chat.completions.create(**params)
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ OpenAI Error: {str(e)}"

def generate_image_openai(prompt: str, api_key: str) -> str:
    """Generates an image via DALL-E 3 and returns markdown linking to it."""
    if not api_key:
        return "⚠️ Please enter your OpenAI API Key to generate images."
    try:
        client = _openai_client(api_key=api_key)
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        return f"![Generated Image]({image_url})"
    except Exception as e:
        return f"❌ Image Generation Error: {str(e)}"


def generate_tests_claude(source_code: str, api_key: str, model_name: str = "claude-opus-4-7", temperature: float = 0.6, image_data: str = None, history: list = None) -> str:
    """Generates tests using Anthropic Claude API."""
    if not api_key:
        return "⚠️ Please enter your Anthropic API Key in the sidebar."
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key, http_client=_http_client)
        
        user_content = [{"type": "text", "text": format_user_prompt(source_code)}]

        if image_data:
            import base64
            # Handle data:image/png;base64, format
            if "," in image_data:
                header, encoded = image_data.split(",", 1)
                media_type = header.split(":")[1].split(";")[0]
                user_content.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": encoded,
                    },
                })

        claude_messages = []
        for msg in (history or [])[-10:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant") and content:
                claude_messages.append({"role": role, "content": content})
        claude_messages.append({"role": "user", "content": user_content})

        response = client.messages.create(
            model=model_name,
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=claude_messages,
            temperature=temperature
        )
        return response.content[0].text
    except Exception as e:
        return f"❌ Claude Error: {str(e)}"


def generate_tests_deepseek(source_code: str, api_key: str, model_name: str = "deepseek-chat", temperature: float = 0.6, history: list = None) -> str:
    """Generates tests using DeepSeek API (OpenAI-compatible)."""
    if not api_key:
        return "⚠️ Please enter your DeepSeek API Key in the sidebar."
    try:
        client = _openai_client(api_key=api_key, base_url="https://api.deepseek.com")
        response = client.chat.completions.create(
            model=model_name,
            messages=_build_history_messages(history or [], SYSTEM_PROMPT, format_user_prompt(source_code)),
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ DeepSeek Error: {str(e)}"


def generate_tests_mistral(source_code: str, api_key: str, model_name: str = "mistral-large-latest", temperature: float = 0.6, history: list = None) -> str:
    """Generates tests using Mistral API (OpenAI-compatible)."""
    if not api_key:
        return "⚠️ Please enter your Mistral API Key in the sidebar."
    try:
        client = _openai_client(api_key=api_key, base_url="https://api.mistral.ai/v1")
        response = client.chat.completions.create(
            model=model_name,
            messages=_build_history_messages(history or [], SYSTEM_PROMPT, format_user_prompt(source_code)),
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ Mistral Error: {str(e)}"


def generate_tests_groq(source_code: str, api_key: str, model_name: str = "llama-3.3-70b-versatile", temperature: float = 0.6, history: list = None) -> str:
    """Generates tests using Groq API (OpenAI-compatible)."""
    if not api_key:
        return "⚠️ Please enter your Groq API Key in the sidebar."
    try:
        client = _openai_client(api_key=api_key, base_url="https://api.groq.com/openai/v1")
        response = client.chat.completions.create(
            model=model_name,
            messages=_build_history_messages(history or [], SYSTEM_PROMPT, format_user_prompt(source_code)),
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ Groq Error: {str(e)}"


# ═══════════════════════════════════════════
#  STREAMING FUNCTIONS (SSE)
# ═══════════════════════════════════════════

async def stream_tests_gemini(source_code: str, api_key: str, model_name: str = "gemini-2.5-flash", temperature: float = 0.6, image_data: str = None, history: list = None):
    if not api_key:
        yield "⚠️ Please enter your Gemini API Key in the sidebar."
        return
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name=model_name, system_instruction=SYSTEM_PROMPT)
        config = genai.GenerationConfig(temperature=temperature)

        gemini_history = []
        if history:
            for msg in history[-10:]:
                role = "user" if msg.get("role") == "user" else "model"
                gemini_history.append({"role": role, "parts": [msg.get("content", "")]})

        content = [format_user_prompt(source_code)]
        if image_data:
            import base64
            if "," in image_data:
                header, encoded = image_data.split(",", 1)
                mime_type = header.split(":")[1].split(";")[0]
                img_bytes = base64.b64decode(encoded)
                content.append({"mime_type": mime_type, "data": img_bytes})

        if gemini_history:
            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(content, generation_config=config, stream=True)
        else:
            response = model.generate_content(content, generation_config=config, stream=True)

        for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        yield f"❌ Gemini Error: {str(e)}"


async def _stream_openai_compatible(client, model_name, messages, temperature, skip_temperature=False):
    """Shared streaming logic for all OpenAI-compatible APIs."""
    params = {"model": model_name, "messages": messages, "stream": True}
    if not skip_temperature:
        params["temperature"] = temperature
    response = client.chat.completions.create(**params)
    for chunk in response:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


async def stream_tests_openai(source_code: str, api_key: str, model_name: str = "gpt-4o", temperature: float = 0.6, image_data: str = None, history: list = None):
    if not api_key:
        yield "⚠️ Please enter your OpenAI API Key in the sidebar."
        return
    try:
        client = _openai_client(api_key=api_key)
        user_content = [{"type": "text", "text": format_user_prompt(source_code)}]
        if image_data:
            user_content.append({"type": "image_url", "image_url": {"url": image_data}})

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in (history or [])[-10:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": user_content})

        async for token in _stream_openai_compatible(client, model_name, messages, temperature, skip_temperature=model_name in _OPENAI_REASONING_MODELS):
            yield token
    except Exception as e:
        yield f"❌ OpenAI Error: {str(e)}"


async def stream_tests_claude(source_code: str, api_key: str, model_name: str = "claude-opus-4-7", temperature: float = 0.6, image_data: str = None, history: list = None):
    if not api_key:
        yield "⚠️ Please enter your Anthropic API Key in the sidebar."
        return
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key, http_client=_http_client)

        user_content = [{"type": "text", "text": format_user_prompt(source_code)}]
        if image_data:
            import base64
            if "," in image_data:
                header, encoded = image_data.split(",", 1)
                media_type = header.split(":")[1].split(";")[0]
                user_content.append({"type": "image", "source": {"type": "base64", "media_type": media_type, "data": encoded}})

        claude_messages = []
        for msg in (history or [])[-10:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant") and content:
                claude_messages.append({"role": role, "content": content})
        claude_messages.append({"role": "user", "content": user_content})

        with client.messages.stream(
            model=model_name,
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=claude_messages,
            temperature=temperature
        ) as stream:
            for text in stream.text_stream:
                yield text
    except Exception as e:
        yield f"❌ Claude Error: {str(e)}"


async def stream_tests_deepseek(source_code: str, api_key: str, model_name: str = "deepseek-chat", temperature: float = 0.6, history: list = None):
    if not api_key:
        yield "⚠️ Please enter your DeepSeek API Key in the sidebar."
        return
    try:
        client = _openai_client(api_key=api_key, base_url="https://api.deepseek.com")
        messages = _build_history_messages(history or [], SYSTEM_PROMPT, format_user_prompt(source_code))
        async for token in _stream_openai_compatible(client, model_name, messages, temperature):
            yield token
    except Exception as e:
        yield f"❌ DeepSeek Error: {str(e)}"


async def stream_tests_mistral(source_code: str, api_key: str, model_name: str = "mistral-large-latest", temperature: float = 0.6, history: list = None):
    if not api_key:
        yield "⚠️ Please enter your Mistral API Key in the sidebar."
        return
    try:
        client = _openai_client(api_key=api_key, base_url="https://api.mistral.ai/v1")
        messages = _build_history_messages(history or [], SYSTEM_PROMPT, format_user_prompt(source_code))
        async for token in _stream_openai_compatible(client, model_name, messages, temperature):
            yield token
    except Exception as e:
        yield f"❌ Mistral Error: {str(e)}"


async def stream_tests_kimi(source_code: str, api_key: str, model_name: str = "kimi-k2.6", temperature: float = 0.6, history: list = None):
    if not api_key:
        yield "⚠️ Please enter your Kimi API Key in the sidebar."
        return
    try:
        clean_system_prompt = _sanitize_utf8(SYSTEM_PROMPT)
        clean_user_prompt = _sanitize_utf8(format_user_prompt(source_code))
        client = _openai_client(api_key=api_key, base_url="https://api.moonshot.ai/v1")
        messages = _build_history_messages(history or [], clean_system_prompt, clean_user_prompt)
        async for token in _stream_openai_compatible(client, model_name, messages, temperature):
            yield token
    except Exception as e:
        yield f"❌ Kimi Error: {str(e)}"


async def stream_tests_groq(source_code: str, api_key: str, model_name: str = "llama-3.3-70b-versatile", temperature: float = 0.6, history: list = None):
    if not api_key:
        yield "⚠️ Please enter your Groq API Key in the sidebar."
        return
    try:
        client = _openai_client(api_key=api_key, base_url="https://api.groq.com/openai/v1")
        messages = _build_history_messages(history or [], SYSTEM_PROMPT, format_user_prompt(source_code))
        async for token in _stream_openai_compatible(client, model_name, messages, temperature):
            yield token
    except Exception as e:
        yield f"❌ Groq Error: {str(e)}"
