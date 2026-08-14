"""
discord.py
----------
Discord webhook sender.
Builds a rich embed payload and posts it via the Discord webhook URL.
No library needed — just a simple POST request.
"""

import requests

from server.config import settings

# Category → color mapping (Discord uses decimal color codes)
CATEGORY_COLORS = {
    "LLMs":     0x7289DA,   # Discord Blurple
    "Robotics": 0x43B581,   # Green
    "Tools":    0xFAA61A,   # Yellow
    "Research": 0x9B59B6,   # Purple
    "Funding":  0x2ECC71,   # Emerald
    "Policy":   0xE74C3C,   # Red
    "Hardware": 0x95A5A6,   # Gray
    "Other":    0x607D8B,   # Blue Gray
}


def build_discord_payload(
    run_date: str,
    top_stories: list[dict],
    insights: str,
    research_highlight: str,
    total_new: int,
) -> dict:
    """
    Builds a Discord webhook payload with a rich embed.

    Returns:
        Discord webhook JSON payload dict
    """
    stories_text = ""
    for i, story in enumerate(top_stories[:5], 1):
        category = story.get("category", "Other")
        title    = str(story.get("title", ""))[:80]
        url      = story.get("url", "")
        stories_text += f"**{i}.** [{title}]({url}) `{category}`\n"

    if not stories_text:
        stories_text = "No top stories today."

    embed = {
        "title":       f"🤖 AI Daily Digest — {run_date}",
        "description": f"📊 **{total_new} new AI stories** found today",
        "color":       0x5865F2,  # Discord Blurple
        "fields": [
            {
                "name":   "🔥 Today's Top Trend",
                "value":  insights[:1024] if insights else "No trend identified.",
                "inline": False,
            },
            {
                "name":   "📰 Top Stories",
                "value":  stories_text[:1024],
                "inline": False,
            },
            {
                "name":   "🔬 Research Spotlight",
                "value":  research_highlight[:1024] if research_highlight else "No research papers today.",
                "inline": False,
            },
        ],
        "footer": {
            "text": "AI News Multi-Agent | Zero-LLM pipeline",
        },
        "timestamp": f"{run_date}T08:00:00.000Z",
    }

    return {"embeds": [embed]}


def send_discord_message(payload: dict) -> None:
    """
    Posts the embed payload to the Discord webhook URL.

    Args:
        payload: Discord webhook JSON payload

    Raises:
        Exception: If the HTTP request fails
    """
    response = requests.post(
        settings.DISCORD_WEBHOOK_URL,
        json=payload,
        timeout=10,
    )

    if response.status_code not in (200, 204):
        raise Exception(f"Discord webhook failed: {response.status_code} — {response.text}")