"""
email.py
--------
Resend email sender for the AI News digest (replaces Gmail SMTP).

Two modes:

1. Template mode (recommended)
   When RESEND_TEMPLATE_ID is configured, emails are sent through a
   published Resend template. Resend templates only support plain variable
   substitution (no loops / conditionals), so all dynamic lists are
   pre-rendered to compact HTML strings server-side via build_email_template_data().
   Each variable stays well under Resend's 2,000-character string limit.

2. Direct mode (fallback)
   If no template ID is set, the fully-rendered Jinja2 digest
   (email_digest.html) is sent as the HTML body directly.
"""

from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from server.config import settings
from server.delivery.images import email_image_url

# Jinja2 template environment (used only for the direct-HTML fallback)
TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))

# Resend caps each template variable string at 2,000 chars — stay below it.
_MAX_VAR_LEN = 1900

# ── Small helpers ──────────────────────────────────────────────────────

def _clean(text: object, limit: int) -> str:
    """Normalizes whitespace and truncates a string to fit Resend limits."""
    text = " ".join(str(text or "").split())
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def _group_categories(top_stories: list[dict], all_articles: list[dict]) -> dict[str, list]:
    """
    Groups remaining articles by category, excluding stories that already
    appear in the top-stories list. Max 2 articles per category, 12 total.
    """
    top_urls = {a.get("url") for a in top_stories if a.get("url")}
    remaining_articles = [a for a in all_articles if a.get("url") not in top_urls]

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

    return categories


# ── Pre-rendered HTML sections (for Resend template variables) ─────────

def _render_hero(story: dict) -> str:
    """Renders the #1 story as a large image card (hero)."""
    title   = _clean(story.get("title", "Untitled"), 100)
    url     = story.get("url", "#")
    cat     = story.get("category", "Other")
    source  = _clean(story.get("source", ""), 30)
    summary = _clean(story.get("summary", ""), 170)

    img = email_image_url(story.get("image"), width=560)
    img_html = ""
    if img and len(img) <= 400:
        img_html = (
            f'<a href="{url}" target="_blank" style="text-decoration:none;display:block;">'
            f'<img src="{img}" width="560" alt="" style="display:block;width:100%;max-width:560px;'
            f'height:auto;border:0;border-radius:14px 14px 0 0;" /></a>'
        )

    return (
        '<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" '
        'style="background-color:#ffffff;border-radius:14px;border:1px solid #e4e4e7;margin-bottom:10px;">'
        f'<tr><td style="padding:0;">{img_html}'
        '<div style="padding:16px 18px 18px;">'
        f'<a href="{url}" target="_blank" style="text-decoration:none;display:block;">'
        f'<div style="font-size:15px;font-weight:800;color:#0a0a0a;line-height:1.4;margin-bottom:6px;">{title}</div></a>'
        f'<div style="font-size:11px;color:#71717a;font-weight:500;margin-bottom:6px;">{cat} &middot; {source}</div>'
        f'<div style="font-size:13px;color:#52525b;line-height:1.6;margin:0;">{summary}</div>'
        '</div></td></tr></table>'
    )


def _render_compact_row(story: dict, rank: int) -> str:
    """Renders a compact top-story row with a small thumbnail + summary."""
    title   = _clean(story.get("title", "Untitled"), 100)
    url     = story.get("url", "#")
    cat     = story.get("category", "Other")
    source  = _clean(story.get("source", ""), 30)
    summary = _clean(story.get("summary", ""), 110)

    img = email_image_url(story.get("image"), width=96, height=96)
    thumb = ""
    if img and len(img) <= 400:
        thumb = (
            f'<td width="56" valign="top" style="padding-top:12px;">'
            f'<img src="{img}" width="56" alt="" style="width:56px;height:56px;object-fit:cover;'
            f'border-radius:8px;border:1px solid #e4e4e7;display:block;" /></td>'
        )

    return (
        '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
        '<tr>'
        f'{thumb}'
        '<td valign="top" style="padding:12px 2px;border-bottom:1px solid #e4e4e7;">'
        f'<a href="{url}" style="text-decoration:none;color:#0a0a0a;">'
        f'<span style="font-size:13px;font-weight:800;color:#a1a1aa;">{rank}.</span> '
        f'<span style="font-size:14px;font-weight:700;line-height:1.4;">{title}</span></a>'
        f'<div style="font-size:11px;color:#71717a;font-weight:500;margin-top:2px;">{cat} &middot; {source}</div>'
        f'<div style="font-size:12px;color:#52525b;line-height:1.55;margin-top:4px;">{summary}</div>'
        '</td></tr></table>'
    )


def _render_top_stories(stories: list[dict]) -> list[str]:
    """
    Renders 'Today's Top 5' as: hero image card (#1) + compact rows (#2-5).
    Chunked into exactly 3 HTML strings (TOP_STORIES_1..3) so every Resend
    variable stays well under the 2,000-char limit — even with images.
    """
    header = (
        '<div style="font-size:12px;font-weight:800;color:#0a0a0a;text-transform:uppercase;'
        'letter-spacing:1.2px;padding-bottom:10px;">Today\'s Top 5 Headlines</div>'
    )

    if not stories:
        return [
            header + (
                '<div style="padding:20px 2px;color:#71717a;font-size:13px;">'
                'No top stories available today.</div>'
            ),
            "",
            "",
        ]

    hero = _render_hero(stories[0])
    rows = [_render_compact_row(s, i) for i, s in enumerate(stories[1:5], 2)]

    chunks: list[str] = [header + hero]
    for i in range(0, len(rows), 2):
        chunks.append("".join(rows[i : i + 2]))
    while len(chunks) < 3:
        chunks.append("")
    return chunks[:3]


def _render_trend(insights: str) -> str:
    """Renders the 'Today's trend' section (label + card) or empty string."""
    if not insights:
        return ""
    text = _clean(insights, 1500)
    return (
        '<div style="font-size:12px;font-weight:800;color:#0a0a0a;text-transform:uppercase;'
        'letter-spacing:1.2px;padding-bottom:10px;">Today\'s Top Trend</div>'
        '<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" '
        'style="background-color:#ffffff;border-left:4px solid #0a0a0a;border-radius:0 14px 14px 0;'
        'border-top:1px solid #e4e4e7;border-right:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;'
        'margin-bottom:28px;"><tr><td style="padding:18px 22px;">'
        f'<div style="font-size:14px;line-height:1.7;color:#27272a;font-weight:400;margin:0;">{text}</div>'
        '</td></tr></table>'
    )


def _render_research(research_highlight: str) -> str:
    """Renders the 'Research spotlight' section (label + card) or empty string."""
    if not research_highlight or research_highlight == "No major research papers today.":
        return ""
    text = _clean(research_highlight, 1400)
    return (
        '<div style="font-size:12px;font-weight:800;color:#0a0a0a;text-transform:uppercase;'
        'letter-spacing:1.2px;padding-bottom:10px;">Research Spotlight</div>'
        '<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" '
        'style="background-color:#ffffff;border-radius:14px;border:1px solid #e4e4e7;'
        'margin-bottom:28px;"><tr><td style="padding:18px 22px;">'
        '<div style="font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;'
        'color:#71717a;margin-bottom:6px;">ArXiv &middot; Latest AI Paper</div>'
        f'<div style="font-size:14px;color:#18181b;line-height:1.65;margin:0;">{text}</div>'
        '</td></tr></table>'
    )


def _render_essential_card(article: dict) -> str:
    """Renders a single essential-story card (image header + text)."""
    title   = _clean(article.get("title", "Untitled"), 120)
    url     = article.get("url", "#")
    source  = _clean(article.get("source", ""), 40)
    summary = _clean(article.get("summary", ""), 140)

    img = email_image_url(article.get("image"), width=560)
    img_html = ""
    if img and len(img) <= 400:
        img_html = (
            f'<a href="{url}" target="_blank" style="text-decoration:none;display:block;">'
            f'<img src="{img}" width="560" alt="" style="display:block;width:100%;max-width:560px;'
            f'border-radius:12px 12px 0 0;" /></a>'
        )

    return (
        '<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" '
        'style="background-color:#ffffff;border-radius:12px;border:1px solid #e4e4e7;'
        'margin-bottom:10px;"><tr><td style="padding:0;">'
        f'{img_html}'
        '<div style="padding:14px 18px;">'
        f'<a href="{url}" target="_blank" style="text-decoration:none;">'
        f'<div style="font-size:14px;font-weight:700;color:#0a0a0a;line-height:1.4;margin-bottom:4px;">{title}</div></a>'
        f'<div style="font-size:11px;color:#71717a;margin-bottom:6px;font-weight:500;">Source: {source}</div>'
        f'<div style="font-size:12px;color:#52525b;line-height:1.55;margin:0;">{summary}</div>'
        '</div></td></tr></table>'
    )


def _render_essential_stories(categories: dict[str, list]) -> list[str]:
    """
    Renders the 'Essential stories by category' sections as up to two HTML
    chunks (ESSENTIAL_STORIES_1/2) so images + longer summaries stay under
    Resend's 2,000-char per-variable limit. The first chunk includes the
    section header.
    """
    if not categories:
        return ["", ""]

    cards: list[str] = []
    total = 0
    max_articles = 5  # 2-3 cards per chunk keeps each variable under the limit

    for category, articles in categories.items():
        if not articles or total >= max_articles:
            continue
        blocks: list[str] = []
        for article in articles:
            if total >= max_articles:
                break
            blocks.append(_render_essential_card(article))
            total += 1
        if blocks:
            cards.append(
                '<div style="font-size:12px;font-weight:800;color:#0a0a0a;text-transform:uppercase;'
                'letter-spacing:1px;padding-bottom:6px;margin:0 0 10px;border-bottom:1px solid #e4e4e7;">'
                f'{category}</div>' + "".join(blocks)
            )

    if not cards:
        return ["", ""]

    header = (
        '<div style="font-size:12px;font-weight:800;color:#0a0a0a;text-transform:uppercase;'
        'letter-spacing:1.2px;padding-bottom:14px;">Essential Stories by Category</div>'
    )

    # Split into two chunks: first includes the header, keep ~2 cards each.
    chunks: list[str] = [header + "".join(cards[:2])]
    chunks.append("".join(cards[2:]))
    return chunks[:2]


# ── Public API ─────────────────────────────────────────────────────────

def build_email_template_data(
    run_date: str,
    top_stories: list[dict],
    all_articles: list[dict],
    insights: str,
    research_highlight: str,
    total_new: int,
) -> dict:
    """
    Builds the `variables` object for a Resend template send.

    All dynamic lists are pre-rendered to compact HTML strings so the
    static shell lives in the Resend template and each variable stays
    under Resend's 2,000-char limit.
    """
    categories = _group_categories(top_stories, all_articles)
    top_stories_chunks = _render_top_stories(top_stories)
    essential_chunks = _render_essential_stories(categories)

    variables = {
        "RUN_DATE":             _clean(run_date, 40),
        "TOTAL_NEW":            int(total_new or 0),
        "TOP_HEADLINES":        len(top_stories[:5]),
        "CATEGORIES_COUNT":     len(categories),
        "INSIGHTS":             _render_trend(insights),
        "RESEARCH_HIGHLIGHT":   _render_research(research_highlight),
        "ESSENTIAL_STORIES_1":  essential_chunks[0],
        "ESSENTIAL_STORIES_2":  essential_chunks[1] if len(essential_chunks) > 1 else "",
    }

    # Split the top-5 list across TOP_STORIES_1..3. Resend requires every
    # variable referenced by the template to be present at send time, so all
    # three keys are always emitted (missing ones are empty strings).
    for idx in range(1, 4):
        variables[f"TOP_STORIES_{idx}"] = (
            top_stories_chunks[idx - 1] if idx <= len(top_stories_chunks) else ""
        )

    return variables


def render_email_html(
    run_date: str,
    top_stories: list[dict],
    all_articles: list[dict],
    insights: str,
    research_highlight: str,
    total_new: int,
) -> str:
    """
    Renders the full HTML digest via Jinja2 (used for the direct-HTML
    fallback and for local previews).
    """
    template = jinja_env.get_template("email_digest.html")
    categories = _group_categories(top_stories, all_articles)

    # Attach proxied image URLs so the Jinja template can render <img> tags.
    def _with_image(story: dict) -> dict:
        return {**story, "image": email_image_url(story.get("image"), width=560)}

    return template.render(
        run_date=run_date,
        top_stories=[_with_image(s) for s in top_stories[:5]],
        categories={
            cat: [_with_image(a) for a in arts]
            for cat, arts in categories.items()
        },
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
        f"ByteDaily — AI Daily Digest — {run_date}",
        f"New Articles Discovered Today: {total_new}",
        "=" * 50,
        "",
        "TODAY'S TOP 5 HEADLINES",
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
            "TODAY'S TOP TREND",
            "-" * 30,
            insights,
            "",
        ])

    if research_highlight and research_highlight != "No major research papers today.":
        lines.extend([
            "RESEARCH SPOTLIGHT",
            "-" * 30,
            research_highlight,
            "",
        ])

    lines.extend([
        "=" * 50,
        "ByteDaily — Curated by AI, refined daily",
        "Reply to this email if you have feedback!",
    ])

    return "\n".join(lines)


def send_email(
    to: str,
    subject: str,
    *,
    template_data: dict | None = None,
    html_body: str | None = None,
    plain_body: str | None = None,
) -> None:
    """
    Sends an email through the Resend API.

    Template mode is used when RESEND_TEMPLATE_ID is set and template_data
    is provided. Otherwise the rendered HTML body is sent directly.

    Args:
        to:            Recipient email address
        subject:       Email subject line
        template_data: Resend template variables (template mode)
        html_body:     Rendered HTML digest (direct fallback mode)
        plain_body:    Optional plain-text fallback (direct mode only)
    """
    import resend

    if not settings.RESEND_API_KEY:
        raise RuntimeError("RESEND_API_KEY is not configured in server/.env")

    resend.api_key = settings.RESEND_API_KEY

    if settings.RESEND_TEMPLATE_ID and template_data:
        params: dict = {
            "from":    settings.RESEND_FROM,
            "to":      [to],
            "subject": subject,
            "reply_to": settings.RESEND_FROM,
            "template": {
                "id":        settings.RESEND_TEMPLATE_ID,
                "variables": template_data,
            },
        }
    elif html_body:
        params = {
            "from":    settings.RESEND_FROM,
            "to":      [to],
            "subject": subject,
            "html":    html_body,
            "reply_to": settings.RESEND_FROM,
        }
        if plain_body:
            params["text"] = plain_body
    else:
        raise ValueError("No email content provided — set RESEND_TEMPLATE_ID or an HTML body.")

    try:
        sent = resend.Emails.send(params)
    except Exception as exc:
        raise RuntimeError(f"Resend send failed: {exc}") from exc

    email_id = getattr(sent, "id", None)
    if email_id:
        print(f"   [Resend] accepted -> id={email_id}")