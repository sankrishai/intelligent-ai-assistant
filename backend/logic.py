# -*- coding: utf-8 -*-

import os
os.environ['PYTHONIOENCODING'] = 'utf-8'

import ollama
import google.generativeai as genai
from openai import OpenAI
from templates import SYSTEM_PROMPT, format_user_prompt

def generate_tests_ollama(source_code: str, model: str = "llama3.2:3b", temperature: float = 0.6, host: str = None) -> str:
    """
    Generates tests using Local Ollama.
    """
    try:
        messages = [
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': format_user_prompt(source_code)}
        ]
        
        if host:
            client = ollama.Client(host=host)
            response = client.chat(
                model=model,
                messages=messages,
                options={'temperature': temperature}
            )
        else:
            response = ollama.chat(
                model=model,
                messages=messages,
                options={'temperature': temperature}
            )
        return response['message']['content']
    except Exception as e:
        return f"❌ Ollama Error: {str(e)}"

def generate_tests_gemini(source_code: str, api_key: str, model_name: str = "gemini-1.5-pro", temperature: float = 0.6) -> str:
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
        
        response = model.generate_content(
            format_user_prompt(source_code),
            generation_config=config
        )
        return response.text
    except Exception as e:
        return f"❌ Gemini Error: {str(e)}"

def _sanitize_utf8(text: str) -> str:
    """Ensure text is clean UTF-8 by encoding and decoding."""
    return text.encode('utf-8', errors='replace').decode('utf-8')

def generate_tests_kimi(source_code: str, api_key: str, model_name: str = "kimi-k2.5", temperature: float = 0.6) -> str:
    """
    Generates tests using Kimi K2.5 via Kimi for Coding API (OpenAI-compatible).
    """
    if not api_key:
        return "⚠️ Please enter your Kimi API Key in the sidebar."
    
    try:
        # Sanitize inputs to avoid encoding issues
        clean_system_prompt = _sanitize_utf8(SYSTEM_PROMPT)
        clean_user_prompt = _sanitize_utf8(format_user_prompt(source_code))
        
        import httpx
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.kimi.com/coding/v1",
            http_client=httpx.Client(
                headers={"User-Agent": "kilo-code"}
            )
        )
        
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": clean_system_prompt},
                {"role": "user", "content": clean_user_prompt}
            ],
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"[ERROR] Kimi K2.5 Error: {str(e)}"


def generate_tests_openai(source_code: str, api_key: str, model_name: str = "gpt-4o", temperature: float = 0.6, image_data: str = None) -> str:
    """Generates tests using OpenAI API."""
    if not api_key:
        return "⚠️ Please enter your OpenAI API Key in the sidebar."
    try:
        client = OpenAI(api_key=api_key)
        
        user_content = [{"type": "text", "text": format_user_prompt(source_code)}]
        
        if image_data:
            user_content.append({
                "type": "image_url",
                "image_url": {
                    "url": image_data
                }
            })
            
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ OpenAI Error: {str(e)}"

def generate_image_openai(prompt: str, api_key: str) -> str:
    """Generates an image via DALL-E 3 and returns markdown linking to it."""
    if not api_key:
        return "⚠️ Please enter your OpenAI API Key to generate images."
    try:
        client = OpenAI(api_key=api_key)
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


def generate_tests_claude(source_code: str, api_key: str, model_name: str = "claude-sonnet-4-20250514", temperature: float = 0.6) -> str:
    """Generates tests using Anthropic Claude API."""
    if not api_key:
        return "⚠️ Please enter your Anthropic API Key in the sidebar."
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model=model_name,
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": format_user_prompt(source_code)}
            ],
            temperature=temperature
        )
        return response.content[0].text
    except Exception as e:
        return f"❌ Claude Error: {str(e)}"


def generate_tests_deepseek(source_code: str, api_key: str, model_name: str = "deepseek-chat", temperature: float = 0.6) -> str:
    """Generates tests using DeepSeek API (OpenAI-compatible)."""
    if not api_key:
        return "⚠️ Please enter your DeepSeek API Key in the sidebar."
    try:
        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": format_user_prompt(source_code)}
            ],
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ DeepSeek Error: {str(e)}"


def generate_tests_mistral(source_code: str, api_key: str, model_name: str = "mistral-large-latest", temperature: float = 0.6) -> str:
    """Generates tests using Mistral API (OpenAI-compatible)."""
    if not api_key:
        return "⚠️ Please enter your Mistral API Key in the sidebar."
    try:
        client = OpenAI(api_key=api_key, base_url="https://api.mistral.ai/v1")
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": format_user_prompt(source_code)}
            ],
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ Mistral Error: {str(e)}"


def generate_tests_groq(source_code: str, api_key: str, model_name: str = "llama-3.3-70b-versatile", temperature: float = 0.6) -> str:
    """Generates tests using Groq API (OpenAI-compatible)."""
    if not api_key:
        return "⚠️ Please enter your Groq API Key in the sidebar."
    try:
        client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": format_user_prompt(source_code)}
            ],
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"❌ Groq Error: {str(e)}"
