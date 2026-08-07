"""
agents/delivery_agent.py
------------------------
Delivery Agent — LangGraph node that sends the daily digest via:
    1. Gmail (HTML email via SMTP) → all addresses in RECIPIENT_EMAILS
    2. Discord (rich embed via webhook)

This is the final node in the pipeline before END.
"""

from graph.state import GraphState
from tools.email_tool import send_email
from tools.discord_tool import send_discord_message
from config import settings


def delivery_node(state: GraphState) -> dict:
    """
    Delivers the daily digest to all configured recipients and Discord.

    Reads:  email_html, discord_payload, run_date
    Writes: delivery_status, errors
    """
    run_date   = state.get("run_date", "Today")
    recipients = settings.RECIPIENT_EMAILS
    subject    = f"🤖 AI Daily Digest — {run_date}"

    print(f"\n📬 [Delivery] Sending digest for {run_date}...")
    print(f"   📧 Recipients: {recipients}")

    delivery_status: dict = {}
    errors: list[str]     = list(state.get("errors", []))

    # ── 1. Send Gmail to each recipient ───────────────────────────────
    sent_count   = 0
    failed_count = 0

    for email_address in recipients:
        try:
            send_email(
                to         = email_address,
                subject    = subject,
                html_body  = state.get("email_html", ""),
                plain_body = state.get("email_plain", ""),
            )
            sent_count += 1
            print(f"   ✅ Email → {email_address}")
        except Exception as e:
            failed_count += 1
            errors.append(f"Delivery (email → {email_address}): {str(e)}")
            print(f"   ❌ Email failed → {email_address}: {e}")

    if failed_count == 0:
        delivery_status["email"] = f"sent ({sent_count}/{len(recipients)})"
    elif sent_count == 0:
        delivery_status["email"] = "failed (all)"
    else:
        delivery_status["email"] = f"partial ({sent_count}/{len(recipients)} sent)"

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
