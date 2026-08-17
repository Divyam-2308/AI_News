"""
reporter.py
-----------
Formats the processed articles into delivery-ready formats:
    1. email_template_data — variables for the Resend template send
    2. email_html          — fully-rendered HTML digest (fallback / preview)
    3. email_plain         — plain-text fallback for the direct-HTML mode
    4. discord_payload     — Discord embed JSON for webhook
"""

from datetime import date

from server.delivery.email import build_email_template_data, render_email_html, render_email_plain
from server.delivery.discord import build_discord_payload


def report(state: dict) -> dict:
    """
    Builds the Resend template data, HTML & plain email and Discord embed.

    Reads:  categorized_articles, top_stories, insights, research_highlight, run_date
    Writes: email_template_data, email_html, email_plain, discord_payload, errors
    """
    print(f"\n📰 [Reporter] Building digest for {state.get('run_date', str(date.today()))}...")

    errors          = state.get("errors", [])
    email_html      = ""
    email_plain     = ""
    email_template_data: dict = {}

    try:
        email_template_data = build_email_template_data(
            run_date=state.get("run_date", str(date.today())),
            top_stories=state.get("top_stories", []),
            all_articles=state.get("categorized_articles", []),
            insights=state.get("insights", ""),
            research_highlight=state.get("research_highlight", ""),
            total_new=state.get("total_new", 0),
        )
        email_html = render_email_html(
            run_date=state.get("run_date", str(date.today())),
            top_stories=state.get("top_stories", []),
            all_articles=state.get("categorized_articles", []),
            insights=state.get("insights", ""),
            research_highlight=state.get("research_highlight", ""),
            total_new=state.get("total_new", 0),
        )
        email_plain = render_email_plain(
            run_date=state.get("run_date", str(date.today())),
            top_stories=state.get("top_stories", []),
            insights=state.get("insights", ""),
            research_highlight=state.get("research_highlight", ""),
            total_new=state.get("total_new", 0),
        )
        print("   ✅ Resend template data + email versions built")
    except Exception as e:
        errors.append(f"Reporter (email): {str(e)}")
        email_template_data = {}
        email_html  = f"<p>Error building email: {e}</p>"
        email_plain = f"Error building email: {e}"
        print(f"   ❌ Email build failed: {e}")

    try:
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
        "email_template_data":  email_template_data,
        "email_html":           email_html,
        "email_plain":          email_plain,
        "discord_payload":      discord_payload,
        "errors":               errors,
    }