"""
tools/arxiv_tool.py
--------------------
Fetches the latest AI research papers from ArXiv API.
Categories: cs.AI (Artificial Intelligence), cs.LG (Machine Learning)
"""

import httpx
import xml.etree.ElementTree as ET
from datetime import datetime


ARXIV_API_URL = "https://export.arxiv.org/api/query"
ARXIV_NS = {"atom": "http://www.w3.org/2005/Atom"}


def fetch_arxiv_articles(max_results: int = 10) -> list[dict]:
    """
    Fetches latest papers from ArXiv cs.AI and cs.LG categories.

    Args:
        max_results: Number of papers to fetch per category

    Returns:
        List of normalized article dicts
    """
    articles = []

    for category in ["cs.AI", "cs.LG"]:
        params = {
            "search_query": f"cat:{category}",
            "start":        0,
            "max_results":  max_results // 2,
            "sortBy":       "submittedDate",
            "sortOrder":    "descending",
        }

        try:
            response = httpx.get(ARXIV_API_URL, params=params, timeout=15)
            response.raise_for_status()
            root = ET.fromstring(response.text)

            for entry in root.findall("atom:entry", ARXIV_NS):
                title   = entry.findtext("atom:title", "", ARXIV_NS).replace("\n", " ").strip()
                summary = entry.findtext("atom:summary", "", ARXIV_NS).replace("\n", " ").strip()
                url     = entry.findtext("atom:id", "", ARXIV_NS).strip()
                pub_raw = entry.findtext("atom:published", "", ARXIV_NS)

                published_at = None
                if pub_raw:
                    try:
                        published_at = datetime.fromisoformat(pub_raw.replace("Z", "+00:00")).isoformat()
                    except Exception:
                        pass

                articles.append({
                    "title":        f"[Paper] {title}",
                    "url":          url,
                    "source":       f"ArXiv ({category})",
                    "content":      summary[:3000],
                    "published_at": published_at,
                })

        except Exception as e:
            raise RuntimeError(f"ArXiv fetch failed for {category}: {e}")

    return articles
