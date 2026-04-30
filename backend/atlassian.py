import httpx
import base64
import re

# Shared client that skips SSL verification (corporate proxy compatibility)
_http_client = httpx.Client(verify=False)


def _normalize_domain(domain: str) -> str:
    """Ensure domain has https:// prefix and no trailing slash."""
    domain = domain.strip().rstrip('/')
    if not domain.startswith(('http://', 'https://')):
        domain = f"https://{domain}"
    return domain


def _auth_headers(email: str, api_token: str) -> dict:
    base64_auth = base64.b64encode(f"{email}:{api_token}".encode("ascii")).decode("ascii")
    return {
        "Authorization": f"Basic {base64_auth}",
        "Accept": "application/json"
    }


def get_jira_issue(domain: str, email: str, api_token: str, issue_key: str) -> str:
    """Fetch a Jira issue summary and description using Atlassian API v3."""
    domain = _normalize_domain(domain)
    url = f"{domain}/rest/api/3/issue/{issue_key}"
    headers = _auth_headers(email, api_token)

    try:
        response = _http_client.get(url, headers=headers, timeout=10.0)
        response.raise_for_status()
        data = response.json()

        summary = data.get("fields", {}).get("summary", "No Summary")
        description_obj = data.get("fields", {}).get("description", {})
        description_text = _extract_adf_text(description_obj)

        return f"Jira Issue: {issue_key}\nSummary: {summary}\n\nDescription:\n{description_text}"
    except httpx.HTTPStatusError as e:
        return f"[ERROR] Jira API returned {e.response.status_code}: {e.response.text}"
    except Exception as e:
        return f"[ERROR] Failed to fetch Jira issue: {str(e)}"


def get_confluence_page(domain: str, email: str, api_token: str, page_id: str) -> str:
    """Fetch a Confluence page content."""
    domain = _normalize_domain(domain)
    url = f"{domain}/wiki/rest/api/content/{page_id}?expand=body.storage"
    headers = _auth_headers(email, api_token)

    try:
        response = _http_client.get(url, headers=headers, timeout=10.0)
        response.raise_for_status()
        data = response.json()

        title = data.get("title", "No Title")
        body = data.get("body", {}).get("storage", {}).get("value", "No Content")
        body_text = re.sub('<[^<]+>', ' ', body).strip()

        return f"Confluence Page: {title}\n\nContent:\n{body_text}"
    except httpx.HTTPStatusError as e:
        return f"[ERROR] Confluence API returned {e.response.status_code}: {e.response.text}"
    except Exception as e:
        return f"[ERROR] Failed to fetch Confluence page: {str(e)}"


def _extract_adf_text(adf_node: dict) -> str:
    """Recursively extract plain text from Atlassian Document Format JSON."""
    if not isinstance(adf_node, dict):
        return ""

    text_content = ""
    if adf_node.get("type") == "text":
        text_content += adf_node.get("text", "") + " "

    if "content" in adf_node and isinstance(adf_node["content"], list):
        for node in adf_node["content"]:
            text_content += _extract_adf_text(node)
            if node.get("type") in ["paragraph", "heading", "listItem"]:
                text_content += "\n"

    return text_content.strip()


def search_jira_jql(domain: str, email: str, api_token: str, jql: str) -> str:
    """Search Jira using JQL to simulate Rovo capabilities."""
    domain = _normalize_domain(domain)
    url = f"{domain}/rest/api/3/search/jql"
    headers = _auth_headers(email, api_token)

    params = {
        "jql": jql,
        "maxResults": 15,
        "fields": ["summary", "status", "assignee", "priority"]
    }

    try:
        response = _http_client.post(url, headers=headers, json=params, timeout=15.0)
        response.raise_for_status()
        data = response.json()

        issues = data.get("issues", [])
        if not issues:
            return "No issues found matching this query."

        result_str = f"Found {len(issues)} issues:\n\n"
        for issue in issues:
            key = issue.get("key", "UNKNOWN")
            fields = issue.get("fields", {})
            summary = fields.get("summary", "No Summary")
            status = fields.get("status", {}).get("name", "Unknown Status")
            priority = fields.get("priority", {}).get("name", "Unknown Priority")
            assignee = fields.get("assignee")
            assignee_name = assignee.get("displayName", "Unassigned") if assignee else "Unassigned"

            result_str += f"- **{key}** [{status} | {priority}]: {summary} (Assignee: {assignee_name})\n"

        return result_str
    except httpx.HTTPStatusError as e:
        return f"[ERROR] Jira Search API returned {e.response.status_code}: {e.response.text}"
    except Exception as e:
        return f"[ERROR] Failed to search Jira: {str(e)}"
