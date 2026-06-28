"""
agents/delivery_agent.py
------------------------
Delivery Agent — LangGraph node that sends the daily digest via:
    1. Gmail (HTML email via SMTP)
    2. Discord (rich embed via webhook)

This is the final node in the pipeline before END.
"""

from graph.state import GraphState
from tools.email_tool import send_email
from tools.discord_tool import send_discord_message
from config import settings


def delivery_node(state: GraphState) -> dict:
    """
    Delivers the daily digest to Gmail and Discord.

    Reads:  email_html, discord_payload, run_date
    Writes: delivery_status, errors
    """
    run_date = state.get("run_date", "Today")
    print(f"\n📬 [Delivery] Sending digest for {run_date}...")

    delivery_status = {}
    errors: list[str] = state.get("errors", [])

    # ── 1. Send Gmail ─────────────────────────────────────────────────
    try:
        send_email(
            to=settings.GMAIL_USER,
            subject=f"🤖 AI Daily Digest — {run_date}",
            html_body=state.get("email_html", ""),
        )
        delivery_status["email"] = "sent"
        print(f"   ✅ Email sent to {settings.GMAIL_USER}")
    except Exception as e:
        delivery_status["email"] = "failed"
        errors.append(f"Delivery (email): {str(e)}")
        print(f"   ❌ Email failed: {e}")

    # ── 2. Send Discord ───────────────────────────────────────────────
    try:
        send_discord_message(state.get("discord_payload", {}))
        delivery_status["discord"] = "sent"
        print("   ✅ Discord message sent")
    except Exception as e:
        delivery_status["discord"] = "failed"
        errors.append(f"Delivery (discord): {str(e)}")
        print(f"   ❌ Discord failed: {e}")

    print(f"\n🎉 [Delivery] Done! Status: {delivery_status}")

    return {
        "delivery_status": delivery_status,
        "errors":          errors,
    }
