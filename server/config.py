"""
config.py
---------
Central configuration loader for the AI News server.

Every setting and secret is read from environment variables (a `.env`
file next to this module) — nothing is stored online. Secrets live only
in your local `server/.env` (gitignored) or as GitHub Actions secrets.

The datastore (Firestore dedup / blogs / subscribers) needs one credential,
also passed via env:

    FIREBASE_PROJECT_ID       — GCP project id
    FIREBASE_SERVICE_ACCOUNT  — service-account JSON (or base64 of it),
                                used to connect to Firestore

All other settings are plain env vars, e.g.:
    RESEND_API_KEY, RESEND_FROM, RESEND_TEMPLATE_ID, DISCORD_WEBHOOK_URL,
    DIGEST_HOUR_IST, DIGEST_MINUTE_IST, ...
"""

import base64
import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")


# ── Env helpers ─────────────────────────────────────────────────────────

def _env(key: str, default: str = "") -> str:
    """Reads a string env var (empty string when unset)."""
    return os.getenv(key, default)


def _env_int(key: str, default: int) -> int:
    """Reads an integer env var, falling back to `default` on garbage."""
    try:
        return int(os.getenv(key, default) or default)
    except (TypeError, ValueError):
        return default


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


# ── Settings ────────────────────────────────────────────────────────────

@dataclass
class Settings:
    # Firebase datastore (bootstrap credentials)
    FIREBASE_PROJECT_ID: str
    FIREBASE_SERVICE_ACCOUNT: dict = field(repr=False)

    # Email (Resend)
    RESEND_API_KEY: str = ""
    RESEND_FROM: str = "ByteDaily <onboarding@resend.dev>"
    RESEND_TEMPLATE_ID: str = ""

    # Email (legacy SMTP — kept for reference, not used for sending)
    GMAIL_USER: str = ""
    GMAIL_APP_PASSWORD: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 465
    EMAIL_FROM: str = ""

    # Discord
    DISCORD_WEBHOOK_URL: str = ""

    # Schedule (web server APScheduler)
    DIGEST_HOUR_IST: int = 8
    DIGEST_MINUTE_IST: int = 0

    # Firebase web-app config (frontend, public — not secrets)
    FIREBASE_API_KEY: str | None = None
    FIREBASE_AUTH_DOMAIN: str | None = None
    FIREBASE_STORAGE_BUCKET: str | None = None
    FIREBASE_MESSAGING_SENDER_ID: str | None = None
    FIREBASE_APP_ID: str | None = None
    FIREBASE_MEASUREMENT_ID: str | None = None


settings = Settings(
    FIREBASE_PROJECT_ID           = _env("FIREBASE_PROJECT_ID"),
    FIREBASE_SERVICE_ACCOUNT      = _parse_service_account(_env("FIREBASE_SERVICE_ACCOUNT")),
    RESEND_API_KEY                = _env("RESEND_API_KEY"),
    RESEND_FROM                   = _env("RESEND_FROM", "ByteDaily <onboarding@resend.dev>"),
    RESEND_TEMPLATE_ID            = _env("RESEND_TEMPLATE_ID"),
    GMAIL_USER                    = _env("GMAIL_USER"),
    GMAIL_APP_PASSWORD            = _env("GMAIL_APP_PASSWORD"),
    SMTP_HOST                     = _env("SMTP_HOST", "smtp.gmail.com"),
    SMTP_PORT                     = _env_int("SMTP_PORT", 465),
    EMAIL_FROM                    = _env("EMAIL_FROM"),
    DISCORD_WEBHOOK_URL           = _env("DISCORD_WEBHOOK_URL"),
    DIGEST_HOUR_IST               = _env_int("DIGEST_HOUR_IST", 8),
    DIGEST_MINUTE_IST             = _env_int("DIGEST_MINUTE_IST", 0),
    FIREBASE_API_KEY              = _env("FIREBASE_API_KEY") or None,
    FIREBASE_AUTH_DOMAIN          = _env("FIREBASE_AUTH_DOMAIN") or None,
    FIREBASE_STORAGE_BUCKET       = _env("FIREBASE_STORAGE_BUCKET") or None,
    FIREBASE_MESSAGING_SENDER_ID  = _env("FIREBASE_MESSAGING_SENDER_ID") or None,
    FIREBASE_APP_ID               = _env("FIREBASE_APP_ID") or None,
    FIREBASE_MEASUREMENT_ID       = _env("FIREBASE_MEASUREMENT_ID") or None,
)