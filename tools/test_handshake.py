
import subprocess
import json
import sys

def check_ollama_status():
    """
    Handshake: Verifies that Ollama is running and accessible.
    """
    try:
        # Check if Ollama is running via curl (no dependency req for this basic check)
        result = subprocess.run(
            ["curl", "-s", "http://localhost:11434/api/tags"],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print("❌ Ollama not reachable via curl.")
            return False
            
        try:
            data = json.loads(result.stdout)
            models = data.get('models', [])
            print(f"✅ Ollama Connected. Found {len(models)} models.")
            
            # Check for llama3.2 specifically
            fn_models = [m['name'] for m in models]
            llama_present = any('llama3.2' in m for m in fn_models)
            
            if llama_present:
                print("✅ Model 'llama3.2' found.")
            else:
                print("⚠️ Model 'llama3.2' NOT found. You may need to run 'ollama pull llama3.2'")
                print(f"   Available models: {fn_models}")
                
            return True
        except json.JSONDecodeError:
            print("❌ Failed to decode Ollama response.")
            return False

    except FileNotFoundError:
        print("❌ 'curl' command not found.")
        return False

if __name__ == "__main__":
    if check_ollama_status():
        sys.exit(0)
    else:
        sys.exit(1)
