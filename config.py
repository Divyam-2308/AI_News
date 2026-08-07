"""
config.py
---------
Central configuration loader for the AI News Multi-Agent system.
Loads all settings from the .env file and exposes them as a typed object.

GEMINI_API_KEY is now OPTIONAL — the pipeline can run fully without it
using the zero-LLM mode (sumy + keyword scoring).
"""

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    # LLM (optional — not required in zero-LLM mode)
    GEMINI_API_KEY:       str | None

    # Database
    DATABASE_URL:         str

    # Email
    GMAIL_USER:           str
    GMAIL_APP_PASSWORD:   str
    RECIPIENT_EMAILS:     list[str]   # comma-separated list of digest recipients

    # Discord
    DISCORD_WEBHOOK_URL:  str

    # Schedule
    DIGEST_HOUR_IST:      int
    DIGEST_MINUTE_IST:    int


def _load_settings() -> Settings:
    """Loads and validates environment variables. GEMINI_API_KEY is optional."""
    missing = []

    required = [
        "DATABASE_URL",
        "GMAIL_USER", "GMAIL_APP_PASSWORD",
        "DISCORD_WEBHOOK_URL",
    ]
    for key in required:
        if not os.getenv(key):
            missing.append(key)

    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            "Please check your .env file."
        )

    return Settings(
        GEMINI_API_KEY      = os.getenv("GEMINI_API_KEY"),   # None if not set — that's OK
        DATABASE_URL        = os.getenv("DATABASE_URL"),
        GMAIL_USER          = os.getenv("GMAIL_USER"),
        GMAIL_APP_PASSWORD  = os.getenv("GMAIL_APP_PASSWORD"),
        RECIPIENT_EMAILS    = [
            e.strip()
            for e in os.getenv("RECIPIENT_EMAILS", "").split(",")
            if e.strip()
        ] or [os.getenv("GMAIL_USER", "")],  # fallback: send only to yourself
        DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL"),
        DIGEST_HOUR_IST     = int(os.getenv("DIGEST_HOUR_IST",   "8")),
        DIGEST_MINUTE_IST   = int(os.getenv("DIGEST_MINUTE_IST", "0")),
    )


# Singleton settings object — import this everywhere
settings = _load_settings()


def get_llm():
    """
    Returns a configured Gemini 2.5 Flash LLM client, or None if
    GEMINI_API_KEY is not set (zero-LLM mode).
    """
    if not settings.GEMINI_API_KEY:
        return None

    from langchain_google_genai import ChatGoogleGenerativeAI
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.3,
        max_retries=3,
    )
