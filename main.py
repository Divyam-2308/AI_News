"""
main.py
-------
Entry point for the AI News Multi-Agent system.
Runs the full pipeline once manually (for testing and Phase 1).

Usage:
    python main.py

For automated daily runs at 8:00 AM IST, use:
    python scheduler.py
"""

import sys
import io
import logging

# Fix Windows console Unicode encoding (emojis in logs)
# Not needed on Linux / GitHub Actions
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
import atexit
from datetime import datetime
from graph.workflow import build_graph, _get_pool

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def _cleanup():
    """Close the DB connection pool gracefully on exit."""
    try:
        pool = _get_pool()
        if pool:
            pool.close()
    except Exception:
        pass

atexit.register(_cleanup)


def run_pipeline() -> dict:
    """
    Runs the complete AI news pipeline from scraping to delivery.

    Returns:
        Final GraphState dict with all results and delivery status
    """
    print("\n" + "="*60)
    print("  🤖 AI NEWS MULTI-AGENT — Daily Pipeline Starting")
    print(f"  🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")

    # Build and compile the LangGraph pipeline
    graph = build_graph()

    # Initial state — scraper agent takes it from here
    initial_state = {
        "raw_articles":          [],
        "filtered_articles":     [],
        "summarized_articles":   [],
        "categorized_articles":  [],
        "top_stories":           [],
        "insights":              "",
        "research_highlight":    "",
        "email_html":            "",
        "discord_payload":       {},
        "run_date":              "",
        "total_fetched":         0,
        "total_new":             0,
        "delivery_status":       {},
        "errors":                [],
    }

    # Run the graph with a unique thread_id per day
    thread_id = f"ai-news-{datetime.now().strftime('%Y-%m-%d')}"
    config    = {"configurable": {"thread_id": thread_id}}

    result = graph.invoke(initial_state, config=config)

    # ── Summary ──────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("  ✅ PIPELINE COMPLETE")
    print("="*60)
    print(f"  📅 Date:           {result.get('run_date')}")
    print(f"  📦 Fetched:        {result.get('total_fetched')} articles")
    print(f"  🆕 New:            {result.get('total_new')} articles")
    print(f"  📬 Delivery:       {result.get('delivery_status')}")

    errors = result.get("errors", [])
    if errors:
        print(f"  ⚠️  Errors ({len(errors)}):")
        for err in errors:
            print(f"      - {err}")
    else:
        print("  ✅ No errors!")

    print("="*60 + "\n")

    return result


if __name__ == "__main__":
    run_pipeline()
