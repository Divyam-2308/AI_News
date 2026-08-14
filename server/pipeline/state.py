"""
state.py
--------
Defines the shared GraphState TypedDict that flows through
every step of the AI news pipeline, plus the initial state factory.
"""

from typing import TypedDict


class GraphState(TypedDict):
    # ── Raw data from scraper ─────────────────────────────────────────
    raw_articles: list[dict]
    # Each dict: { title, url, source, content, published_at }

    # ── After deduplication ───────────────────────────────────────────
    filtered_articles: list[dict]

    # ── After LLM summarization ───────────────────────────────────────
    summarized_articles: list[dict]
    # Adds 'summary' key to each article dict

    # ── After LLM categorization ──────────────────────────────────────
    categorized_articles: list[dict]
    # Adds 'category' key: LLMs | Robotics | Tools | Research | Funding | Policy | Hardware

    # ── Intelligence layer ────────────────────────────────────────────
    top_stories: list[dict]        # Top 5 must-read articles picked by analyst
    insights: str                  # Today's overall trend summary
    research_highlight: str        # Top ArXiv paper summary

    # ── Delivery output ───────────────────────────────────────────────
    email_html: str                # Full HTML string for Gmail
    email_plain: str               # Plain-text fallback string for Gmail
    discord_payload: dict          # Discord embed JSON payload

    # ── Run metadata ─────────────────────────────────────────────────
    run_date: str                  # "2026-08-13"
    total_fetched: int             # How many raw articles were found
    total_new: int                 # How many passed deduplication
    delivery_status: dict          # {"email": "sent"/"failed", "discord": "sent"/"failed"}
    errors: list[str]              # Any errors encountered during the run


def initial_state() -> dict:
    """Returns a fresh, empty pipeline state."""
    return {
        "raw_articles":          [],
        "filtered_articles":     [],
        "summarized_articles":   [],
        "categorized_articles":  [],
        "top_stories":           [],
        "insights":              "",
        "research_highlight":    "",
        "email_html":            "",
        "email_plain":           "",
        "discord_payload":       {},
        "run_date":              "",
        "total_fetched":         0,
        "total_new":             0,
        "delivery_status":       {},
        "errors":                [],
    }