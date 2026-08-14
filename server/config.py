"""
config.py
---------
Central configuration loader for the AI News server.
Loads all settings from server/.env and exposes them as a typed object.

The pipeline is fully zero-LLM — no API keys are required beyond
Firebase, email, and Discord credentials.
"""

import base64
import json
import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")


def _parse_service_account(raw: str) -> dict:
    """
    Parses the Firebase service account JSON from an env var.
    Accepts the JSON directly, or a base64-encoded version.
    """
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    try:
        return json.loads(base64.b64decode(raw))
    except Exception:
        raise EnvironmentError(
            "FIREBASE_SERVICE_ACCOUNT must be valid JSON (or base64-encoded JSON) "
            "containing a Firebase service account key. Download it from "
            "Firebase console → Project settings → Service accounts → Generate new private key."
        )


@dataclass
class Settings:
    # Firebase (server auth — service account)
    FIREBASE_PROJECT_ID: str
    FIREBASE_SERVICE_ACCOUNT: dict = field(repr=False)

    # Email
    GMAIL_USER: str
    GMAIL_APP_PASSWORD: str

    # Discord
    DISCORD_WEBHOOK_URL: str

    # Schedule
    DIGEST_HOUR_IST: int
    DIGEST_MINUTE_IST: int

    # SMTP (overrides the default Gmail endpoint; e.g. Brevo)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 465           # 465 = SSL, 587 = STARTTLS
    EMAIL_FROM: str = ""           # "From" address (your official email); falls back to GMAIL_USER

    # Firebase (web SDK config — kept for the future webApp)
    FIREBASE_API_KEY: str | None = None
    FIREBASE_AUTH_DOMAIN: str | None = None
    FIREBASE_STORAGE_BUCKET: str | None = None
    FIREBASE_MESSAGING_SENDER_ID: str | None = None
    FIREBASE_APP_ID: str | None = None
    FIREBASE_MEASUREMENT_ID: str | None = None


def _load_settings() -> Settings:
    """Loads and validates environment variables."""
    missing = [
        key for key in (
            "FIREBASE_PROJECT_ID",
            "FIREBASE_SERVICE_ACCOUNT",
            "GMAIL_USER", "GMAIL_APP_PASSWORD",
            "DISCORD_WEBHOOK_URL",
        )
        if not os.getenv(key)
    ]

    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            "Please check your server/.env file."
        )

    return Settings(
        FIREBASE_PROJECT_ID        = os.getenv("FIREBASE_PROJECT_ID", ""),
        FIREBASE_SERVICE_ACCOUNT   = _parse_service_account(os.getenv("FIREBASE_SERVICE_ACCOUNT", "")),

        FIREBASE_API_KEY           = os.getenv("FIREBASE_API_KEY") or None,
        FIREBASE_AUTH_DOMAIN       = os.getenv("FIREBASE_AUTH_DOMAIN") or None,
        FIREBASE_STORAGE_BUCKET    = os.getenv("FIREBASE_STORAGE_BUCKET") or None,
        FIREBASE_MESSAGING_SENDER_ID = os.getenv("FIREBASE_MESSAGING_SENDER_ID") or None,
        FIREBASE_APP_ID            = os.getenv("FIREBASE_APP_ID") or None,
        FIREBASE_MEASUREMENT_ID    = os.getenv("FIREBASE_MEASUREMENT_ID") or None,

        GMAIL_USER                 = os.getenv("GMAIL_USER", ""),
        GMAIL_APP_PASSWORD         = os.getenv("GMAIL_APP_PASSWORD", ""),
        DISCORD_WEBHOOK_URL        = os.getenv("DISCORD_WEBHOOK_URL", ""),
        DIGEST_HOUR_IST            = int(os.getenv("DIGEST_HOUR_IST",   "8")),
        DIGEST_MINUTE_IST          = int(os.getenv("DIGEST_MINUTE_IST", "0")),

        SMTP_HOST                  = os.getenv("SMTP_HOST", "smtp.gmail.com"),
        SMTP_PORT                  = int(os.getenv("SMTP_PORT", "465")),
        EMAIL_FROM                 = os.getenv("EMAIL_FROM", ""),
    )


# Singleton settings object — import this everywhere
settings = _load_settings()