from ddgs import DDGS

def perform_web_search(query: str, max_results: int = 5) -> str:
    """Performs a DuckDuckGo web search and formats the top results."""
    try:
        results = []
        with DDGS() as ddgs:
            # text() queries DuckDuckGo search
            for r in ddgs.text(query, max_results=max_results):
                results.append(r)
                
        if not results:
            return f"No web search results found for '{query}'."

        formatted_results = f"Web Search Results for '{query}':\n\n"
        for idx, res in enumerate(results, 1):
            title = res.get('title', 'No Title')
            href = res.get('href', '#')
            body = res.get('body', 'No description available.')
            formatted_results += f"{idx}. **[{title}]({href})**\n   {body}\n\n"
            
        return formatted_results.strip()
    except Exception as e:
        return f"[ERROR] Web search failed: {str(e)}"
