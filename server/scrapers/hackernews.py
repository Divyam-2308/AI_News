"""
hackernews.py
-------------
Fetches top HackerNews stories filtered by AI-related keywords.
Uses the HackerNews Firebase REST API (no authentication needed).
"""

from datetime import datetime

import httpx


HN_TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM_URL        = "https://hacker-news.firebaseio.com/v0/item/{}.json"

AI_KEYWORDS = [
    "ai", "artificial intelligence", "machine learning", "llm", "gpt",
    "gemini", "claude", "openai", "deepmind", "anthropic", "neural",
    "transformer", "diffusion", "chatgpt", "robot", "deep learning",
    "langchain", "langgraph", "rag", "vector", "embedding", "model",
]


def fetch_hackernews_articles(keyword: str = "AI", max_results: int = 10) -> list[dict]:
    """
    Fetches top HackerNews posts that are AI-related.

    Args:
        keyword:     Unused (kept for API consistency); filtering uses AI_KEYWORDS
        max_results: Max number of relevant posts to return

    Returns:
        List of normalized article dicts
    """
    response = httpx.get(HN_TOP_STORIES_URL, timeout=10)
    response.raise_for_status()
    story_ids = response.json()[:100]  # Check top 100 stories

    ai_articles = []

    for story_id in story_ids:
        if len(ai_articles) >= max_results:
            break

        try:
            item_resp = httpx.get(HN_ITEM_URL.format(story_id), timeout=5)
            item_resp.raise_for_status()
            item = item_resp.json()

            if not item or item.get("type") != "story":
                continue

            title = str(item.get("title", "")).lower()
            url   = item.get("url", f"https://news.ycombinator.com/item?id={story_id}")

            # Filter for AI-related stories
            if any(kw in title for kw in AI_KEYWORDS):
                published_at = None
                if item.get("time"):
                    published_at = datetime.fromtimestamp(int(item["time"])).isoformat()

                ai_articles.append({
                    "title":        item.get("title", "HN Story"),
                    "url":          url,
                    "source":       "HackerNews",
                    "content":      item.get("title", ""),  # HN stories often just have a title+link
                    "published_at": published_at,
                })

        except Exception:
            continue  # Skip problematic stories silently

    return ai_articles