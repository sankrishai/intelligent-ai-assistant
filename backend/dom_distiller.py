import re
from bs4 import BeautifulSoup
import httpx

async def fetch_and_distill_url(url: str) -> str:
    """Fetches a URL and distills its DOM."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # We add a user agent to prevent basic 403 blocks
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            html = response.text
            return distill_html(html)
    except Exception as e:
        return f"[Failed to fetch and distill URL {url}: {str(e)}]"

def distill_html(html_snippet: str) -> str:
    """
    Takes an HTML snippet or full DOM and distills it down to just semantic elements.
    Removes script, style, meta, svg, and generic wrappers like div/span unless they have important attributes.
    """
    if not html_snippet or len(html_snippet.strip()) == 0:
        return ""
        
    soup = BeautifulSoup(html_snippet, 'html.parser')
    
    # 1. Remove noise tags completely
    for tag in soup(["script", "style", "meta", "link", "noscript", "svg", "path", "iframe"]):
        tag.decompose()
        
    # 2. Define semantic tags and important attributes to keep
    semantic_tags = {"button", "a", "input", "select", "textarea", "form", "label", "h1", "h2", "h3", "h4", "h5", "h6", "nav", "header", "footer", "main", "article"}
    important_attrs = {"id", "name", "role", "aria-label", "data-testid", "data-test-id", "placeholder", "type", "href", "value"}

    # 3. Clean up the tree
    for tag in soup.find_all(True):
        # We want to keep the tag if it's semantic OR if it has an important attribute
        has_important_attr = any(attr in tag.attrs for attr in important_attrs)
        
        if tag.name not in semantic_tags and not has_important_attr:
            # If it's just a generic div/span with no ID/role/testid, we unwrap it 
            # (replace it with its children) to flatten the tree
            tag.unwrap()
        else:
            # If we keep the tag, clean up its attributes. Only keep important ones + class
            attrs_to_keep = {}
            for attr, val in tag.attrs.items():
                if attr in important_attrs or attr == "class":
                    if isinstance(val, list):
                        val = " ".join(val)
                    attrs_to_keep[attr] = val
            tag.attrs = attrs_to_keep

    # 4. Remove empty lines and return
    distilled = str(soup)
    # compress multiple spaces and newlines
    distilled = re.sub(r'\n\s*\n', '\n', distilled)
    return distilled.strip()

async def process_message_for_dom(message: str) -> str:
    """
    Checks if the message contains a URL or raw HTML snippet.
    If it contains a URL, fetches it and appends the distilled DOM.
    If it contains HTML, it distills it in place.
    """
    # 1. Check for URLs
    url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')
    urls = url_pattern.findall(message)
    
    processed_message = message
    
    # If the user pasted a raw HTML snippet directly in the prompt
    if "<div" in message or "<button" in message or "<a " in message or "<input" in message:
        # We try to extract and distill the HTML part.
        # For simplicity, if we detect HTML tags, we run the whole message through distill_html
        # Note: This might strip non-HTML text if not careful, so we only distill if it looks heavily like HTML
        # A safer approach: extract everything between < and > and assume it's a snippet.
        # Actually, let's just let BeautifulSoup parse the whole text. It will preserve text nodes.
        distilled = distill_html(message)
        if len(distilled) > 10:
            return f"User Prompt & Distilled HTML Snippet:\n\n{distilled}"
    
    # 2. If URLs are found, fetch and append
    if urls:
        appended_doms = []
        for url in urls[:2]: # Max 2 URLs to prevent abuse/timeouts
            distilled_dom = await fetch_and_distill_url(url)
            appended_doms.append(f"\n--- Distilled DOM for {url} ---\n{distilled_dom}\n---------------------------")
        
        if appended_doms:
            processed_message += "\n\n" + "\n".join(appended_doms)
            
    return processed_message
