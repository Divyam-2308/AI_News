"""
agents/analyst_agent.py  (v2 — zero LLM)
-----------------------------------------
Analyst Agent — picks top 5 stories and generates a trend summary
using pure keyword scoring and frequency analysis. No LLM needed.

Algorithm:
    Top Stories  → score each article by source quality + keyword value
    Trend        → count high-signal theme terms across all titles;
                   build a readable template sentence from the top themes
    Research     → pick the highest-scoring ArXiv paper by keyword density
"""

from collections import Counter
from graph.state import GraphState


# ── Source quality weights ────────────────────────────────────────────
SOURCE_QUALITY: dict[str, int] = {
    "TechCrunch AI":          10,
    "VentureBeat AI":         10,
    "MIT Technology Review":  10,
    "The Verge":               9,
    "The Batch":              10,
    "TLDR AI":                 9,
    "Wired":                   9,
    "IEEE Spectrum":           8,
    "Towards Data Science":    7,
    "ArXiv (cs.AI)":           8,
    "ArXiv (cs.LG)":           8,
    "HackerNews":              6,
    "Google News AI":          5,
}

# Keywords that signal a high-value, newsworthy story
_HIGH_VALUE_KEYWORDS = [
    "breakthrough", "launch", "release", "announce", "open source",
    "raises", "billion", "million", "beats", "surpasses", "outperforms",
    "first", "new model", "regulation", "ban", "acqui", "partner",
    "state of the art", "sota", "open-source", "benchmark",
]

# Theme groups used for trend detection
_THEMES: dict[str, list[str]] = {
    "Large Language Models":      ["llm", "gpt", "chatgpt", "claude", "gemini", "mistral", "llama", "language model"],
    "AI Regulation & Policy":     ["regulation", "policy", "law", "congress", "eu", "ban", "safety", "ethics"],
    "AI Funding & Startups":      ["funding", "investment", "raise", "raised", "million", "billion", "startup", "series"],
    "Computer Vision & Imaging":  ["image", "video", "vision", "stable diffusion", "midjourney", "dall-e", "sora"],
    "AI in Healthcare":           ["health", "medical", "drug", "clinical", "diagnosis", "bio"],
    "Robotics & Embodied AI":     ["robot", "autonomous", "humanoid", "drone", "self-driving"],
    "AI Hardware & Compute":      ["gpu", "chip", "nvidia", "tpu", "compute", "semiconductor", "h100"],
    "Open-Source AI":             ["open source", "open-source", "hugging face", "weights", "permissive"],
}


# ── Scoring helpers ───────────────────────────────────────────────────

def _score_article(article: dict) -> float:
    """Scores an article for newsworthiness."""
    score = float(SOURCE_QUALITY.get(article.get("source", ""), 4))
    haystack = (article.get("title", "") + " " + article.get("summary", "")).lower()

    for kw in _HIGH_VALUE_KEYWORDS:
        if kw in haystack:
            score += 2.5

    return score


def _detect_themes(articles: list[dict]) -> list[str]:
    """
    Counts theme keyword hits across all article titles.
    Returns theme names sorted by frequency (highest first).
    """
    all_titles = " ".join(a.get("title", "") for a in articles).lower()
    theme_counts: Counter = Counter()

    for theme, keywords in _THEMES.items():
        hits = sum(all_titles.count(kw) for kw in keywords)
        if hits > 0:
            theme_counts[theme] = hits

    return [t for t, _ in theme_counts.most_common()]


def _build_trend_sentence(top_themes: list[str], article_count: int) -> str:
    """Assembles a readable trend sentence from the detected themes."""
    if not top_themes:
        return (
            f"Today's AI digest covers {article_count} stories spanning a wide range "
            "of topics — from model releases and research papers to industry news and policy."
        )

    if len(top_themes) == 1:
        return (
            f"Today's AI news is dominated by {top_themes[0]}, with {article_count} stories "
            "highlighting the latest developments, announcements, and breakthroughs in this area."
        )

    t1, t2 = top_themes[0], top_themes[1]
    extras = f" alongside activity in {top_themes[2]}" if len(top_themes) > 2 else ""
    return (
        f"Today's AI landscape sees strong activity around {t1} and {t2}{extras}. "
        f"Across {article_count} stories, the recurring themes reflect the rapid pace "
        "of development and growing industry interest in these areas."
    )


# ── LangGraph node ────────────────────────────────────────────────────

def analyst_node(state: GraphState) -> dict:
    """
    Analyses all categorized articles and extracts key intelligence —
    entirely through keyword scoring, no LLM required.

    Reads:  categorized_articles
    Writes: top_stories, insights, research_highlight, errors
    """
    articles = state["categorized_articles"]
    errors: list[str] = list(state.get("errors", []))

    print(f"\n🧠 [Analyst] Analysing {len(articles)} articles for trends (zero LLM)...")

    if not articles:
        return {
            "top_stories":        [],
            "insights":           "No new AI news found today.",
            "research_highlight": "No research papers today.",
            "errors":             errors,
        }

    # ── 1. Score + pick top 5 ─────────────────────────────────────────
    scored = sorted(articles, key=_score_article, reverse=True)
    top_stories = scored[:5]

    print(f"   ✅ Top 5 stories selected (scores: "
          f"{[round(_score_article(a),1) for a in top_stories]})")

    # ── 2. Detect dominant themes for the trend sentence ─────────────
    top_themes     = _detect_themes(articles)
    insights       = _build_trend_sentence(top_themes, len(articles))

    print(f"   ✅ Top themes: {top_themes[:3]}")

    # ── 3. Research highlight — best ArXiv paper ──────────────────────
    arxiv_articles = [
        a for a in articles
        if "arxiv" in a.get("source", "").lower()
        or a.get("category") == "Research"
    ]

    if arxiv_articles:
        best_paper        = max(arxiv_articles, key=_score_article)
        research_highlight = (
            f"{best_paper.get('title', 'Untitled paper')} — "
            f"{best_paper.get('summary', '')[:300].strip()}"
        )
        print(f"   ✅ Research highlight: {best_paper.get('title','')[:60]}...")
    else:
        research_highlight = "No major research papers today."
        print("   ℹ️  No ArXiv papers in this run.")

    return {
        "top_stories":        top_stories,
        "insights":           insights,
        "research_highlight": research_highlight,
        "errors":             errors,
    }
