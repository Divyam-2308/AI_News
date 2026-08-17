"""
rss.py
------
Fetches articles from RSS feeds using feedparser.
Returns a normalized list of article dicts.
"""

import re
from datetime import datetime
from time import struct_time

import feedparser


def fetch_rss_articles(source_name: str, feed_url: str, max_articles: int = 15) -> list[dict]:
    """
    Fetches and normalizes articles from an RSS feed URL.

    Args:
        source_name:  Human-readable name (e.g. "TechCrunch AI")
        feed_url:     Full RSS feed URL
        max_articles: Max number of articles to return

    Returns:
        List of normalized article dicts with keys:
        title, url, source, content, image, published_at
    """
    feed = feedparser.parse(feed_url)
    articles = []

    for entry in feed.entries[:max_articles]:
        # Extract content — try different fields
        content = str(
            entry.get("summary")
            or entry.get("description")
            or (entry.get("content") or [{}])[0].get("value", "")
        )

        # Strip HTML tags from content
        content = _strip_html(content)

        # Parse publication date
        published_at = None
        published = entry.get("published_parsed")
        if isinstance(published, struct_time):
            try:
                published_at = datetime(
                    published.tm_year, published.tm_mon, published.tm_mday,
                    published.tm_hour, published.tm_min, published.tm_sec,
                ).isoformat()
            except Exception:
                published_at = None

        articles.append({
            "title":        str(entry.get("title") or "No Title").strip(),
            "url":          str(entry.get("link") or ""),
            "source":       source_name,
            "content":      content[:3000],  # Cap at 3000 chars
            "image":        _extract_image(entry),
            "published_at": published_at,
        })

    return articles


def _extract_image(entry) -> str:
    """
    Pulls a thumbnail from RSS media tags (free — feeds already carry them).
    Priority: <media:content> → <media:thumbnail> → <enclosure type=image/*>.
    Returns the first usable image URL, or "" if the feed has none.
    """
    for src in (entry.get("media_content") or []):
        if isinstance(src, dict):
            url = src.get("url")
            if url:
                return str(url)

    for src in (entry.get("media_thumbnail") or []):
        if isinstance(src, dict):
            url = src.get("url")
            if url:
                return str(url)

    for enc in (entry.get("enclosures") or []):
        url = getattr(enc, "href", None) or (enc.get("href") if isinstance(enc, dict) else None)
        etype = getattr(enc, "type", "") or (enc.get("type", "") if isinstance(enc, dict) else "")
        if url and str(etype).startswith("image"):
            return str(url)

    return ""


def _strip_html(text: str) -> str:
    """Remove HTML tags from a string."""
    clean = re.compile(r"<[^>]+>")
    return re.sub(clean, "", text).strip()