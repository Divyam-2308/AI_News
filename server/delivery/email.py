"""
email.py
--------
Gmail SMTP email sender using Jinja2 HTML templates.
Includes:
  - Clean article filtering (caps total email articles to ~15 to prevent email clipping & spam score)
  - Dual multipart alternative (plain text + HTML) for high deliverability
  - Proper email headers (Message-ID, Date, Reply-To) to avoid spam filters
"""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from server.config import settings

# Jinja2 template environment
TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))


def render_email_html(
    run_date: str,
    top_stories: list[dict],
    all_articles: list[dict],
    insights: str,
    research_highlight: str,
    total_new: int,
) -> str:
    """
    Renders the HTML email body using the Jinja2 template.
    Caps total category articles to max 2 per category and max 12 total,
    excluding articles that already appear in top_stories.
    """
    template = jinja_env.get_template("email_digest.html")

    # Exclude top story URLs from category section to avoid duplication
    top_urls = {a.get("url") for a in top_stories if a.get("url")}
    remaining_articles = [a for a in all_articles if a.get("url") not in top_urls]

    # Group by category with strict limits (max 2 per category, max 12 total)
    categories: dict[str, list] = {}
    total_cat_count = 0

    for article in remaining_articles:
        if total_cat_count >= 12:
            break
        cat = article.get("category", "Other")
        cat_list = categories.setdefault(cat, [])
        if len(cat_list) < 2:
            cat_list.append(article)
            total_cat_count += 1

    return template.render(
        run_date=run_date,
        top_stories=top_stories[:5],
        categories=categories,
        insights=insights,
        research_highlight=research_highlight,
        total_new=total_new,
    )


def render_email_plain(
    run_date: str,
    top_stories: list[dict],
    insights: str,
    research_highlight: str,
    total_new: int,
) -> str:
    """Generates a plain-text fallback version of the email digest."""
    lines = [
        f"🤖 AI Daily Digest — {run_date}",
        f"New Articles Discovered Today: {total_new}",
        "=" * 50,
        "",
        "🗞️ TODAY'S TOP 5 HEADLINES",
        "-" * 30,
    ]

    for idx, story in enumerate(top_stories[:5], 1):
        lines.append(f"{idx}. {story.get('title', '')}")
        lines.append(f"   Category: {story.get('category', 'Other')} | Source: {story.get('source', '')}")
        lines.append(f"   Link: {story.get('url', '')}")
        summary = story.get("summary")
        if summary:
            lines.append(f"   Summary: {str(summary)[:160]}...")
        lines.append("")

    if insights:
        lines.extend([
            "🔥 TODAY'S TOP TREND",
            "-" * 30,
            insights,
            "",
        ])

    if research_highlight and research_highlight != "No major research papers today.":
        lines.extend([
            "🔬 RESEARCH SPOTLIGHT",
            "-" * 30,
            research_highlight,
            "",
        ])

    lines.extend([
        "=" * 50,
        "AI News Multi-Agent Digest",
        "Reply to this email if you have feedback!",
    ])

    return "\n".join(lines)


def send_email(to: str, subject: str, html_body: str, plain_body: str | None = None) -> None:
    """
    Sends a multipart (plain + HTML) email via SMTP.

    The endpoint is configurable via SMTP_HOST / SMTP_PORT so it works
    with Gmail (smtp.gmail.com:465 SSL) or Brevo (smtp-relay.brevo.com:587
    STARTTLS). The "From" address uses EMAIL_FROM (your official email).

    Args:
        to:         Recipient email address
        subject:    Email subject line
        html_body:  HTML content string
        plain_body: Optional plain text fallback
    """
    from_addr = settings.EMAIL_FROM or settings.GMAIL_USER
    domain = from_addr.split("@")[-1] if "@" in from_addr else "gmail.com"

    msg = MIMEMultipart("alternative")
    msg["Subject"]           = subject
    msg["From"]              = from_addr
    msg["To"]                = to
    msg["Reply-To"]          = from_addr
    msg["Date"]              = formatdate(localtime=True)
    msg["Message-ID"]        = make_msgid(domain=domain)
    msg["X-Mailer"]          = "AI News Multi-Agent 2.0"
    msg["List-Unsubscribe"]  = f"<mailto:{from_addr}?subject=unsubscribe>"

    # 1. Plain text fallback (MUST come before HTML in multipart/alternative)
    if not plain_body:
        plain_body = f"AI Daily Digest — {subject}\n\nPlease view this email in an HTML-compatible client."

    text_part = MIMEText(plain_body, "plain", "utf-8")
    msg.attach(text_part)

    # 2. HTML body
    html_part = MIMEText(html_body, "html", "utf-8")
    msg.attach(html_part)

    # 3. Send via SMTP (SSL on 465, STARTTLS otherwise)
    if settings.SMTP_PORT == 465:
        server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
    else:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()

    try:
        server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
        server.sendmail(from_addr, to, msg.as_string())
    finally:
        server.quit()