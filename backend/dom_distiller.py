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

async def process_message_for_dom(message: str, is_locator_mode: bool = False) -> dict:
    """
    Checks if the message contains a URL or raw HTML snippet.
    If it contains a URL, fetches it and appends the distilled DOM.
    If it contains HTML, it distills it in place.

    Returns a dict with:
      - message: the processed message string
      - distilled_dom: the raw distilled DOM (for showing to user), or None
      - source_url: the URL that was fetched, or None
      - fetch_error: error message if fetch failed, or None
    """
    # 1. Check for URLs
    url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')
    urls = url_pattern.findall(message)

    result = {
        "message": message,
        "distilled_dom": None,
        "source_url": None,
        "fetch_error": None,
    }

    # If the user pasted a raw HTML snippet directly in the prompt
    if "<div" in message or "<button" in message or "<a " in message or "<input" in message:
        distilled = distill_html(message)
        if len(distilled) > 10:
            result["distilled_dom"] = distilled
            if is_locator_mode:
                result["message"] = _build_grounded_locator_prompt(distilled, source="html_snippet")
            else:
                result["message"] = f"User Prompt & Distilled HTML Snippet:\n\n{distilled}"
            return result

    # 2. If URLs are found, fetch and append
    if urls:
        appended_doms = []
        all_distilled = []
        for url in urls[:2]:
            distilled_dom = await fetch_and_distill_url(url)
            result["source_url"] = url

            if distilled_dom.startswith("[Failed"):
                result["fetch_error"] = distilled_dom
                continue

            # Check if the distilled DOM is too thin (likely a JS-rendered SPA)
            if len(distilled_dom.strip()) < 50:
                result["fetch_error"] = f"[Warning] The page at {url} returned very little HTML. It may be a JavaScript-rendered SPA. The DOM shown below is from the initial server response only — actual interactive elements may not be present. Consider pasting the HTML source directly."

            all_distilled.append(distilled_dom)
            appended_doms.append(f"\n--- Distilled DOM for {url} ---\n{distilled_dom}\n---------------------------")

        if all_distilled:
            result["distilled_dom"] = "\n\n".join(all_distilled)

        if is_locator_mode and all_distilled:
            combined_dom = "\n\n".join(all_distilled)
            result["message"] = _build_grounded_locator_prompt(combined_dom, source=urls[0])
        elif appended_doms:
            result["message"] = message + "\n\n" + "\n".join(appended_doms)

    return result


def _build_grounded_locator_prompt(distilled_dom: str, source: str = "") -> str:
    """
    Builds a strictly grounded prompt that forces the LLM to ONLY use
    elements present in the distilled DOM. Prevents hallucination.
    """
    return f"""STRICT DOM LOCATOR GENERATION TASK

SOURCE: {source}

CRITICAL RULES:
1. ONLY generate locators for elements that appear in the DISTILLED DOM below. Do NOT invent, assume, or hallucinate any elements.
2. If the DOM appears empty or minimal (e.g., just a shell with no interactive elements), explicitly state that the page likely uses client-side JavaScript rendering and the server HTML does not contain the interactive elements. Do NOT guess what the page might contain.
3. Every locator you generate MUST reference a specific tag, attribute, or text that is literally present in the DOM below.
4. BEFORE generating locators, ask the user which framework and language they need (Playwright/Selenium/Cypress + language) if not already specified. If user previously specified in conversation, use that.
5. Generate framework-appropriate locators:
   - Playwright: getByRole > getByText > getByTestId > locator() with CSS
   - Selenium Java: By.id > By.name > By.cssSelector > By.xpath (short, relative)
   - Selenium Python: By.ID > By.CSS_SELECTOR > By.XPATH
   - Cypress: cy.get('[data-testid=...]') > cy.contains() > cy.get() with CSS
6. Generate a complete Page Object Model (POM) class matching the user's framework.
7. Prefer stable, non-flaky locators. Avoid absolute XPath, index-based selectors, or selectors dependent on layout/styling.

DISTILLED DOM (this is the ONLY source of truth):
```html
{distilled_dom}
```

Generate locators ONLY for elements found above. If an element is not in the DOM, do not create a locator for it."""
