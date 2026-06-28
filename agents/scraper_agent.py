"""
agents/scraper_agent.py
-----------------------
Scraper Agent — LangGraph node that fetches AI news from
multiple free sources: RSS feeds, ArXiv API, and HackerNews API.

Sources:
    1. Google News RSS (AI topic)
    2. TechCrunch AI RSS
    3. VentureBeat AI RSS
    4. MIT Technology Review RSS
    5. ArXiv API (cs.AI + cs.LG)
    6. HackerNews Top Stories API
"""

from datetime import date
from graph.state import GraphState
from tools.rss_tool import fetch_rss_articles
from tools.arxiv_tool import fetch_arxiv_articles
from tools.hackernews_tool import fetch_hackernews_articles


# ── RSS Feed URLs ─────────────────────────────────────────────────────
RSS_FEEDS = {
    "Google News AI":       "https://news.google.com/rss/search?q=artificial+intelligence&hl=en-IN&gl=IN&ceid=IN:en",
    "TechCrunch AI":        "https://techcrunch.com/category/artificial-intelligence/feed/",
    "VentureBeat AI":       "https://venturebeat.com/category/ai/feed/",
    "MIT Technology Review":"https://www.technologyreview.com/feed/",
}


def scraper_node(state: GraphState) -> dict:
    """
    Fetches AI news articles from all configured sources.

    Reads:  Nothing (this is the first node)
    Writes: raw_articles, run_date, total_fetched, errors
    """
    print("🔍 [Scraper] Fetching AI news from all sources...")

    all_articles: list[dict] = []
    errors: list[str] = []

    # 1. Fetch from RSS feeds
    for source_name, feed_url in RSS_FEEDS.items():
        try:
            articles = fetch_rss_articles(source_name, feed_url)
            all_articles.extend(articles)
            print(f"   ✅ {source_name}: {len(articles)} articles")
        except Exception as e:
            error_msg = f"Scraper RSS [{source_name}]: {str(e)}"
            errors.append(error_msg)
            print(f"   ❌ {source_name}: {e}")

    # 2. Fetch from ArXiv (latest AI research papers)
    try:
        arxiv_articles = fetch_arxiv_articles(max_results=10)
        all_articles.extend(arxiv_articles)
        print(f"   ✅ ArXiv: {len(arxiv_articles)} papers")
    except Exception as e:
        errors.append(f"Scraper ArXiv: {str(e)}")
        print(f"   ❌ ArXiv: {e}")

    # 3. Fetch from HackerNews
    try:
        hn_articles = fetch_hackernews_articles(keyword="AI", max_results=10)
        all_articles.extend(hn_articles)
        print(f"   ✅ HackerNews: {len(hn_articles)} posts")
    except Exception as e:
        errors.append(f"Scraper HackerNews: {str(e)}")
        print(f"   ❌ HackerNews: {e}")

    print(f"\n📦 [Scraper] Total fetched: {len(all_articles)} articles")

    return {
        "raw_articles":   all_articles,
        "run_date":       str(date.today()),
        "total_fetched":  len(all_articles),
        "errors":         errors,
    }
