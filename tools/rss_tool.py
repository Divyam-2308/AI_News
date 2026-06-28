"""
tools/rss_tool.py
-----------------
Fetches articles from RSS feeds using feedparser.
Returns a normalized list of article dicts.
"""

import feedparser
import httpx
from datetime import datetime


def fetch_rss_articles(source_name: str, feed_url: str, max_articles: int = 15) -> list[dict]:
    """
    Fetches and normalizes articles from an RSS feed URL.

    Args:
        source_name:  Human-readable name (e.g. "TechCrunch AI")
        feed_url:     Full RSS feed URL
        max_articles: Max number of articles to return

    Returns:
        List of normalized article dicts with keys:
        title, url, source, content, published_at
    """
    feed = feedparser.parse(feed_url)
    articles = []

    for entry in feed.entries[:max_articles]:
        # Extract content — try different fields
        content = ""
        if hasattr(entry, "summary"):
            content = entry.summary
        elif hasattr(entry, "description"):
            content = entry.description
        elif hasattr(entry, "content"):
            content = entry.content[0].get("value", "") if entry.content else ""

        # Strip HTML tags from content
        content = _strip_html(content)

        # Parse publication date
        published_at = None
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            try:
                published_at = datetime(*entry.published_parsed[:6]).isoformat()
            except Exception:
                published_at = None

        articles.append({
            "title":        entry.get("title", "No Title").strip(),
            "url":          entry.get("link", ""),
            "source":       source_name,
            "content":      content[:3000],  # Cap at 3000 chars
            "published_at": published_at,
        })

    return articles


def _strip_html(text: str) -> str:
    """Remove HTML tags from a string."""
    import re
    clean = re.compile(r"<[^>]+>")
    return re.sub(clean, "", text).strip()
