"""
delivery.py
-----------
Sends the daily digest via the Resend API and a Discord webhook.
This is the final step of the pipeline.
"""

from server.delivery.email import send_email
from server.delivery.discord import send_discord_message
from server.db.store import get_recipients


def deliver(state: dict) -> dict:
    """
    Delivers the daily digest to all configured recipients and Discord.

    Reads:  email_template_data, email_html, email_plain, discord_payload, run_date
    Writes: delivery_status, errors
    """
    run_date   = state.get("run_date", "Today")
    recipients = get_recipients()  # subscriber emails from Firestore `users` collection
    subject    = f"🤖 AI Daily Digest — {run_date}"

    print(f"\n📬 [Delivery] Sending digest for {run_date} via Resend...")
    print(f"   📧 Recipients (from Firestore users): {recipients}")

    delivery_status: dict = {}
    errors: list[str]     = list(state.get("errors", []))

    # ── 1. Send via Resend to each recipient ──────────────────────────
    sent_count   = 0
    failed_count = 0

    for email_address in recipients:
        try:
            send_email(
                to            = email_address,
                subject       = subject,
                template_data = state.get("email_template_data") or None,
                html_body     = state.get("email_html", ""),
                plain_body    = state.get("email_plain", ""),
            )
            sent_count += 1
            print(f"   ✅ Email → {email_address}")
        except Exception as e:
            failed_count += 1
            errors.append(f"Delivery (email → {email_address}): {str(e)}")
            print(f"   ❌ Email failed → {email_address}: {e}")

    if not recipients:
        delivery_status["email"] = "no recipients (Firestore users collection is empty)"
    elif failed_count == 0:
        delivery_status["email"] = f"sent ({sent_count}/{len(recipients)})"
    elif sent_count == 0:
        delivery_status["email"] = "failed (all)"
    else:
        delivery_status["email"] = f"partial ({sent_count}/{len(recipients)} sent)"

    # ── 2. Send Discord ───────────────────────────────────────────────
    # DISABLED: Discord delivery is currently commented out.
    # To re-enable, uncomment the block below and set DISCORD_WEBHOOK_URL in .env
    # try:
    #     send_discord_message(state.get("discord_payload", {}))
    #     delivery_status["discord"] = "sent"
    #     print("   ✅ Discord message sent")
    # except Exception as e:
    #     delivery_status["discord"] = "failed"
    #     errors.append(f"Delivery (discord): {str(e)}")
    #     print(f"   ❌ Discord failed: {e}")
    delivery_status["discord"] = "disabled"

    print(f"\n🎉 [Delivery] Done! Status: {delivery_status}")

    return {
        "delivery_status": delivery_status,
        "errors":          errors,
    }