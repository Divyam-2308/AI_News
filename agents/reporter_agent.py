"""
agents/reporter_agent.py
------------------------
Reporter Agent — LangGraph node that formats the processed articles
into delivery-ready formats:
    1. email_html    — Rich HTML digest for Gmail
    2. email_plain   — Plain-text fallback for Gmail
    3. discord_payload — Discord embed JSON for webhook
"""

from datetime import date
from graph.state import GraphState
from tools.email_tool import render_email_html, render_email_plain
from tools.discord_tool import build_discord_payload


def reporter_node(state: GraphState) -> dict:
    """
    Builds the HTML & plain email and Discord embed from processed articles.

    Reads:  categorized_articles, top_stories, insights, research_highlight, run_date
    Writes: email_html, email_plain, discord_payload, errors
    """
    print(f"\n📰 [Reporter] Building digest for {state.get('run_date', str(date.today()))}...")

    errors: list[str] = state.get("errors", [])
    email_html  = ""
    email_plain = ""

    try:
        # Build HTML email
        email_html = render_email_html(
            run_date=state.get("run_date", str(date.today())),
            top_stories=state.get("top_stories", []),
            all_articles=state.get("categorized_articles", []),
            insights=state.get("insights", ""),
            research_highlight=state.get("research_highlight", ""),
            total_new=state.get("total_new", 0),
        )

        # Build Plain Text fallback email
        email_plain = render_email_plain(
            run_date=state.get("run_date", str(date.today())),
            top_stories=state.get("top_stories", []),
            insights=state.get("insights", ""),
            research_highlight=state.get("research_highlight", ""),
            total_new=state.get("total_new", 0),
        )
        print("   ✅ Email versions (HTML + Plain-Text) built")
    except Exception as e:
        errors.append(f"Reporter (email): {str(e)}")
        email_html  = f"<p>Error building email: {e}</p>"
        email_plain = f"Error building email: {e}"
        print(f"   ❌ Email build failed: {e}")

    try:
        # Build Discord embed
        discord_payload = build_discord_payload(
            run_date=state.get("run_date", str(date.today())),
            top_stories=state.get("top_stories", []),
            insights=state.get("insights", ""),
            research_highlight=state.get("research_highlight", ""),
            total_new=state.get("total_new", 0),
        )
        print("   ✅ Discord embed built")
    except Exception as e:
        errors.append(f"Reporter (discord): {str(e)}")
        discord_payload = {"content": f"AI Daily Digest — {state.get('run_date')} (formatting error)"}
        print(f"   ❌ Discord build failed: {e}")

    return {
        "email_html":       email_html,
        "email_plain":      email_plain,
        "discord_payload":  discord_payload,
        "errors":           errors,
    }
