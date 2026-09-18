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
    Returns subscriber email addresses from Firestore `users` collection,
    falling back or appending DEFAULT_RECIPIENTS from environment config.

    Fail-soft: if Firestore is unavailable, falls back to DEFAULT_RECIPIENTS so
    the email digest can still be delivered.

    Returns:
        List of non-empty, trimmed, unique email addresses.
    """
    from server.config import settings

    emails: list[str] = []
    try:
        docs = get_firestore().collection(USERS_COLLECTION).stream()
        for doc in docs:
            email = ((doc.to_dict() or {}).get("email") or "").strip()
            if email and email not in emails:
                emails.append(email)
    except Exception as e:
        logger.warning("Firestore users fetch failed: %s", e)

    # Fallback / explicit recipients from environment configuration
    fallback_raw = getattr(settings, "DEFAULT_RECIPIENTS", "")
    if fallback_raw:
        for addr in fallback_raw.split(","):
            cleaned = addr.strip()
            if cleaned and cleaned not in emails:
                emails.append(cleaned)

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