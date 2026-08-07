"""
agents/scraper_agent.py
-----------------------
Scraper Agent — LangGraph node that fetches AI news from
multiple free sources: RSS feeds, ArXiv API, and HackerNews API.

Sources (13 RSS + ArXiv + HackerNews — all free, no API key):
    RSS:
        1.  Google News AI (Indian edition)
        2.  TechCrunch AI
        3.  VentureBeat AI
        4.  MIT Technology Review
        5.  The Verge — AI
        6.  Wired — AI
        7.  IEEE Spectrum — AI
        8.  The Batch (deeplearning.ai newsletter)
        9.  TLDR AI newsletter
        10. Towards Data Science (Medium)
        11. AI News (ainews.org)
        12. Synced Review
        13. InfoQ AI
    API:
        14. ArXiv (cs.AI + cs.LG) — latest research papers
        15. HackerNews — top AI-tagged stories
"""

from datetime import date
from graph.state import GraphState
from tools.rss_tool import fetch_rss_articles
from tools.arxiv_tool import fetch_arxiv_articles
from tools.hackernews_tool import fetch_hackernews_articles


# ── RSS Feed URLs ─────────────────────────────────────────────────────
RSS_FEEDS = {
    # Already had these
    "Google News AI":           "https://news.google.com/rss/search?q=artificial+intelligence&hl=en-IN&gl=IN&ceid=IN:en",
    "TechCrunch AI":            "https://techcrunch.com/category/artificial-intelligence/feed/",
    "VentureBeat AI":           "https://venturebeat.com/category/ai/feed/",
    "MIT Technology Review":    "https://www.technologyreview.com/feed/",
    # New high-quality sources
    "The Verge":                "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
    "Wired":                    "https://www.wired.com/feed/category/artificial-intelligence/latest/rss",
    "IEEE Spectrum":            "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss",
    "The Batch":                "https://www.deeplearning.ai/the-batch/feed/",
    "TLDR AI":                  "https://tldr.tech/ai/rss",
    "Towards Data Science":     "https://towardsdatascience.com/feed",
    "AI News":                  "https://www.artificialintelligence-news.com/feed/",
    "Synced Review":            "https://syncedreview.com/feed/",
    "InfoQ AI":                 "https://feed.infoq.com/ai-ml-data-eng/",
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
        arxiv_articles = fetch_arxiv_articles(max_results=15)
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
