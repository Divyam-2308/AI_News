"""
db/article_store.py
--------------------
CRUD operations for the ai_articles table.
Uses pgvector for semantic deduplication via cosine similarity.
"""

import psycopg
from db.connection import get_connection_string

# Similarity threshold — articles above this score are considered duplicates
SIMILARITY_THRESHOLD = 0.90


def is_duplicate(article: dict) -> bool:
    """
    Checks if a similar article already exists in the database.
    Uses the article URL as a fast primary check, then pgvector
    cosine similarity as a semantic fallback.

    Args:
        article: Article dict with at least 'url' and 'title' keys

    Returns:
        True if duplicate, False if new
    """
    url = article.get("url", "")

    with psycopg.connect(get_connection_string()) as conn:
        with conn.cursor() as cur:
            # Fast check: exact URL match
            cur.execute(
                "SELECT 1 FROM ai_articles WHERE url = %s LIMIT 1",
                (url,)
            )
            if cur.fetchone():
                return True  # Exact URL duplicate

            # Vector similarity check will be added in Phase 2
            # when we integrate Gemini embeddings
            return False


def save_article_stub(article: dict) -> None:
    """
    Saves an article stub to the database (without embedding for now).
    Embedding will be generated and stored in Phase 2.

    Args:
        article: Normalized article dict
    """
    with psycopg.connect(get_connection_string()) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO ai_articles (title, url, source, content, published_at)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (url) DO NOTHING
            """, (
                article.get("title", ""),
                article.get("url", ""),
                article.get("source", ""),
                article.get("content", "")[:2000],
                article.get("published_at"),
            ))
            conn.commit()


def save_full_article(article: dict) -> None:
    """
    Saves or updates a fully processed article with all fields.

    Args:
        article: Fully processed article dict (with summary, category)
    """
    with psycopg.connect(get_connection_string()) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO ai_articles (title, url, source, content, category, summary, published_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (url) DO UPDATE SET
                    category = EXCLUDED.category,
                    summary  = EXCLUDED.summary
            """, (
                article.get("title", ""),
                article.get("url", ""),
                article.get("source", ""),
                article.get("content", "")[:2000],
                article.get("category", "Other"),
                article.get("summary", ""),
                article.get("published_at"),
            ))
            conn.commit()
