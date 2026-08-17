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
    "style", "noscript", "form", "iframe", "button",
    "input", "select",
]


def fetch_article_content(url: str, timeout: int = 10) -> tuple[str, str]:
    """
    Downloads an article page and extracts its main text content AND a
    representative image URL (free — no storage or proxy needed).

    Strategy for text:
        1. Try <article> or <main> element first (semantic HTML)
        2. Fall back to all <p> tags on the page
        3. Filter out short noise paragraphs (< 40 chars)
        4. Cap output at 5 000 characters

    Strategy for image:
        1. <meta property="og:image"> (the article's hero image)
        2. First <img> inside the article container

    Args:
        url:     Article URL to fetch
        timeout: HTTP timeout in seconds

    Returns:
        Tuple of (extracted plain text, image URL). Both are "" on failure.
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
        image = _extract_og_image(soup, container)
        return text[:5000], image

    except Exception:
        # Never crash the pipeline over a single bad URL
        return "", ""


def _extract_og_image(soup, container) -> str:
    """Returns the og:image URL, falling back to the first article <img>."""
    og = soup.find("meta", property="og:image")
    if og and og.get("content"):
        return str(og["content"]).strip()

    for img in container.find_all("img", limit=8):
        src = img.get("src") or img.get("data-src") or ""
        src = str(src).strip()
        if not src.startswith(("http://", "https://")):
            continue
        if "data:image" in src or src.endswith((".svg", ".gif")):
            continue
        # Skip tiny UI icons / trackers (heuristic: reasonable URL length)
        if len(src) < 25 or len(src) > 500:
            continue
        return src

    return ""