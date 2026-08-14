"""
content.py
----------
Fetches the full article body from a URL using httpx + BeautifulSoup.
Used to enrich RSS articles that only carry a short description (~150 chars).

Falls back gracefully to an empty string on any network / parse error
so the pipeline never breaks due to a single unreachable URL.
"""

import httpx
from bs4 import BeautifulSoup

# Realistic browser-like UA to avoid trivial bot blocks
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

# Tags that never contain article body text
_NOISE_TAGS = [
    "nav", "header", "footer", "aside", "script",
    "style", "noscript", "form", "figure", "figcaption",
    "iframe", "button", "input", "select",
]


def fetch_article_content(url: str, timeout: int = 10) -> str:
    """
    Downloads an article page and extracts its main text content.

    Strategy:
        1. Try <article> or <main> element first (semantic HTML)
        2. Fall back to all <p> tags on the page
        3. Filter out short noise paragraphs (< 40 chars)
        4. Cap output at 5 000 characters

    Args:
        url:     Article URL to fetch
        timeout: HTTP timeout in seconds

    Returns:
        Extracted plain text, or empty string on failure
    """
    try:
        response = httpx.get(
            url,
            headers=_HEADERS,
            timeout=timeout,
            follow_redirects=True,
        )
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")

        # Strip noise tags
        for tag in soup(_NOISE_TAGS):
            tag.decompose()

        # Prefer semantic article/main containers
        container = soup.find("article") or soup.find("main") or soup

        # Collect meaningful paragraphs
        paragraphs = [
            p.get_text(" ", strip=True)
            for p in container.find_all("p")
            if len(p.get_text(strip=True)) >= 40
        ]

        text = " ".join(paragraphs)
        return text[:5000]

    except Exception:
        # Never crash the pipeline over a single bad URL
        return ""