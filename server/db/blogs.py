"""
blogs.py
--------
Stores every article sent in the daily digest to the Firestore `blogs`
collection so the webApp can show them as blog posts (schema.json).

Each article maps to a document keyed by a stable SHA-256 hash of its URL,
so re-runs never create duplicates.

Fail-soft: if Firestore is unavailable, articles are simply not blogged
and the pipeline still completes.
"""

import hashlib
import logging

from google.cloud import firestore

from server.db.connection import get_firestore

logger = logging.getLogger(__name__)

BLOGS_COLLECTION = "blogs"


def _doc_id(url: str) -> str:
    """Returns a stable, Firestore-valid document ID for a URL."""
    return hashlib.sha256(url.encode("utf-8")).hexdigest()


def save_article(article: dict) -> None:
    """
    Writes a processed article to the `blogs` collection.

    Args:
        article: Enriched article dict (title, url, source, content,
                 summary, category)
    """
    url = article.get("url", "")
    if not url:
        return

    try:
        db      = get_firestore()
        doc_ref = db.collection(BLOGS_COLLECTION).document(_doc_id(url))

        if doc_ref.get().exists:
            return  # already blogged

        content = (
            article.get("full_content")
            or article.get("content")
            or article.get("summary")
            or article.get("title", "")
        )

        doc_ref.set({
            "title":      article.get("title", ""),
            "content":    content,
            "summary":    article.get("summary", ""),
            "image":      article.get("image", ""),
            "sources":    [{article.get("source", ""): url}],
            "category":   article.get("category", "Other"),
            "created_at": firestore.SERVER_TIMESTAMP,
        })
    except Exception as e:
        logger.warning("Blog save failed (ignoring): %s", e)