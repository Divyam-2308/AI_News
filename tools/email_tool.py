"""
tools/email_tool.py
--------------------
Gmail SMTP email sender using Jinja2 HTML templates.
Loads credentials from environment variables.
"""

import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from config import settings

# Jinja2 template environment
TEMPLATE_DIR = Path(__file__).parent.parent / "templates"
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

    Returns:
        Rendered HTML string
    """
    template = jinja_env.get_template("email_digest.html")

    # Group articles by category
    categories: dict[str, list] = {}
    for article in all_articles:
        cat = article.get("category", "Other")
        categories.setdefault(cat, []).append(article)

    return template.render(
        run_date=run_date,
        top_stories=top_stories,
        categories=categories,
        insights=insights,
        research_highlight=research_highlight,
        total_new=total_new,
    )


def send_email(to: str, subject: str, html_body: str) -> None:
    """
    Sends an HTML email via Gmail SMTP (SSL on port 465).

    Args:
        to:        Recipient email address
        subject:   Email subject line
        html_body: Full HTML content string

    Raises:
        Exception: If login or send fails
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = settings.GMAIL_USER
    msg["To"]      = to

    html_part = MIMEText(html_body, "html")
    msg.attach(html_part)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(settings.GMAIL_USER, settings.GMAIL_APP_PASSWORD)
        server.sendmail(settings.GMAIL_USER, to, msg.as_string())
