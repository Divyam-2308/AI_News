"""
connection.py
-------------
Initialises the shared Firestore client for the entire application.
Uses a Firebase service account for server-side authentication.

The client is created lazily on first use and reused for the process
lifetime.
"""

import logging

from google.cloud import firestore
from google.oauth2 import service_account

logger = logging.getLogger(__name__)

_client: firestore.Client | None = None


def get_firestore() -> firestore.Client:
    """
    Returns a shared Firestore client (creates it on first call).
    Uses lazy initialization to avoid connecting at import time.
    """
    global _client
    if _client is None:
        from server.config import settings

        credentials = service_account.Credentials.from_service_account_info(
            settings.FIREBASE_SERVICE_ACCOUNT
        )
        _client = firestore.Client(
            project=settings.FIREBASE_PROJECT_ID,
            credentials=credentials,
        )
        logger.info("✅ Connected to Firestore (%s)", settings.FIREBASE_PROJECT_ID)

    return _client


def close() -> None:
    """Closes the underlying Firestore transport and drops the client."""
    global _client
    if _client is not None:
        try:
            _client._transport.close()
        except Exception:
            pass
        _client = None