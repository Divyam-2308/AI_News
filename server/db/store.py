"""
store.py
--------
Deduplication store backed by Firestore.
Tracks every article URL already sent so future daily runs skip them.

Each URL maps to a document in the `seen` collection (keyed by a stable
hash so URLs with slashes / query strings are valid document IDs).

All operations fail-soft: if Firestore is unavailable or misconfigured,
articles are treated as new and the pipeline still delivers everything.
"""

import hashlib
import logging

from google.cloud import firestore

from server.db.connection import get_firestore

logger = logging.getLogger(__name__)

SEEN_COLLECTION = "seen"
USERS_COLLECTION = "users"


def _doc_id(url: str) -> str:
    """Returns a stable, Firestore-valid document ID for a URL."""
    return hashlib.sha256(url.encode("utf-8")).hexdigest()


def get_recipients() -> list[str]:
    """
    Returns the subscriber email addresses from the Firestore `users`
    collection (schema.json: users/<user> -> { name, email, timestamp }).

    Fail-soft: returns an empty list if Firestore is unavailable, so the
    pipeline still completes without crashing.

    Returns:
        List of non-empty, trimmed email addresses.
    """
    emails: list[str] = []
    try:
        docs = get_firestore().collection(USERS_COLLECTION).stream()
        for doc in docs:
            email = ((doc.to_dict() or {}).get("email") or "").strip()
            if email:
                emails.append(email)
    except Exception as e:
        logger.warning("Firestore users fetch failed: %s", e)
    return emails


def is_duplicate(article: dict) -> bool:
    """
    Checks if a similar article has already been seen.

    Args:
        article: Article dict with at least a 'url' key

    Returns:
        True if duplicate, False if new (or if the store is unavailable)
    """
    url = article.get("url", "")
    if not url:
        return False

    try:
        doc_ref = get_firestore().collection(SEEN_COLLECTION).document(_doc_id(url))
        return doc_ref.get().exists
    except Exception as e:
        logger.warning("Firestore dedup check failed (treating as new): %s", e)
        return False


def save_article_stub(article: dict) -> None:
    """
    Records a new article URL in Firestore so future runs skip it.

    Args:
        article: Normalized article dict
    """
    url = article.get("url", "")
    if not url:
        return

    try:
        doc_ref = get_firestore().collection(SEEN_COLLECTION).document(_doc_id(url))
        doc_ref.set({
            "url":            url,
            "title":          article.get("title", ""),
            "source":         article.get("source", ""),
            "first_seen_at":  firestore.SERVER_TIMESTAMP,
        })
    except Exception as e:
        logger.warning("Firestore dedup save failed (ignoring): %s", e)