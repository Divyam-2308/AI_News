"""
engine.py
---------
The intelligence layer of the pipeline. Replaces the old
dedup_agent, summarize_categorize_agent, and analyst_agent
with a single, sequential processing step:

    1. deduplicate     — filter out already-seen articles via the DB
    2. summarize+cat   — LexRank extractive summary + keyword category
    3. analyze         — pick top 5 stories, build a trend sentence,
                         and highlight the best ArXiv paper

All three run fully offline with zero LLM calls (sumy + keyword scoring).
"""

from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

from server.db.store import is_duplicate, save_article_stub
from server.db.blogs import save_article as save_blog_post
from server.scrapers.content import fetch_article_content


# ── Summarizer setup (built once, reused) ────────────────────────────
_STEMMER    = Stemmer("english")
_SUMMARIZER = LexRankSummarizer(_STEMMER)
_SUMMARIZER.stop_words = get_stop_words("english")


# ── Category keyword map ──────────────────────────────────────────────
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "LLMs": [
        "llm", "large language model", "language model", "gpt", "chatgpt",
        "gemini", "claude", "mistral", "llama", "openai", "anthropic",
        "transformer", "token", "prompt", "fine-tun", "inference",
        "text generation", "conversational", "chatbot", "instruction",
    ],
    "Robotics": [
        "robot", "robotics", "autonomous", "drone", "humanoid",
        "actuator", "boston dynamics", "spot", "self-driving",
        "mechanical arm", "locomotion",
    ],
    "Tools": [
        "tool", "plugin", "extension", "sdk", "api", "framework",
        "library", "platform", "launch", "product", "software",
        "integration", "workflow", "copilot", "assistant",
    ],
    "Research": [
        "paper", "research", "study", "arxiv", "dataset", "benchmark",
        "model architecture", "training", "algorithm", "neural network",
        "experiment", "evaluation", "preprint", "published",
    ],
    "Funding": [
        "funding", "investment", "raise", "raised", "million", "billion",
        "venture", "series a", "series b", "series c", "seed", "startup",
        "valuation", "acquisition", "acqui", "ipo",
    ],
    "Policy": [
        "policy", "regulation", "law", "government", "eu", "congress",
        "ban", "ethics", "safety", "risk", "copyright", "legislation",
        "compliance", "gdpr", "act", "senate", "white house",
    ],
    "Hardware": [
        "gpu", "chip", "hardware", "nvidia", "amd", "intel", "tpu",
        "compute", "semiconductor", "processor", "accelerator",
        "data center", "h100", "h200",
    ],
}

VALID_CATEGORIES = list(CATEGORY_KEYWORDS.keys()) + ["Other"]

# ── Source quality weights (analyst scoring) ──────────────────────────
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


# ════════════════════════════════════════════════════════════════════
#  Step 1 — Deduplication
# ════════════════════════════════════════════════════════════════════

def _deduplicate(articles: list[dict], errors: list[str]) -> tuple[list[dict], list[str]]:
    """
    Filters out articles that are duplicates or already sent in past runs.
    New articles are saved to the DB so future runs remember them.
    """
    print(f"\n🔎 [Engine] Checking {len(articles)} articles for duplicates...")

    filtered: list[dict] = []
    for article in articles:
        try:
            if not is_duplicate(article):
                filtered.append(article)
                save_article_stub(article)
        except Exception as e:
            errors.append(f"Dedup [{article.get('url', 'unknown')}]: {str(e)}")

    removed = len(articles) - len(filtered)
    print(f"   ✅ {len(filtered)} new articles  |  🗑️  {removed} duplicates removed")
    return filtered, errors


# ════════════════════════════════════════════════════════════════════
#  Step 2 — Summarize + Categorize
# ════════════════════════════════════════════════════════════════════

def _lexrank_summarize(text: str, sentence_count: int = 3) -> str:
    """
    Runs LexRank extractive summarization on plain text.
    Returns the top `sentence_count` sentences joined as a string.
    Falls back to first 400 chars if text is too short for sumy.
    """
    word_count = len(text.split())
    if word_count < 30:
        return text[:400].strip()

    try:
        parser    = PlaintextParser.from_string(text, Tokenizer("english"))
        sentences = _SUMMARIZER(parser.document, sentence_count)
        result    = " ".join(str(s) for s in sentences).strip()
        return result if result else text[:400].strip()
    except Exception:
        return text[:400].strip()


def _keyword_categorize(title: str, summary: str) -> str:
    """
    Scores each category by counting keyword hits in title + summary.
    Title keywords are worth 2× because titles are more signal-dense.
    Returns the highest-scoring category, defaulting to 'Other'.
    """
    combined_lower = (title.lower() + " " + summary.lower())
    title_lower    = title.lower()

    best_cat   = "Other"
    best_score = 0

    for category, keywords in CATEGORY_KEYWORDS.items():
        score = 0
        for kw in keywords:
            # Title hit = 2 pts, body hit = 1 pt
            if kw in title_lower:
                score += 2
            elif kw in combined_lower:
                score += 1
        if score > best_score:
            best_score = score
            best_cat   = category

    return best_cat


def _process_article(article: dict) -> tuple[dict, str | None]:
    """
    Enriches a single article with a summary and category.

    Steps:
        1. Fetch full article body from URL (falls back to RSS content)
        2. Run LexRank summarization
        3. Run keyword categorization
    """
    article_copy = dict(article)
    error = None

    try:
        url          = article.get("url", "")
        rss_content  = article.get("content", "").strip()

        # Fetch full body if RSS only has a stub (< 300 chars)
        full_content = ""
        if url and len(rss_content) < 300:
            full_content = fetch_article_content(url)

        text_to_summarize = full_content or rss_content or article.get("title", "")

        summary = _lexrank_summarize(text_to_summarize, sentence_count=3)
        if not summary:
            summary = article.get("title", "No summary available.")

        category = _keyword_categorize(
            title   = article.get("title", ""),
            summary = summary,
        )

        article_copy["full_content"] = full_content
        article_copy["summary"]      = summary
        article_copy["category"]     = category

    except Exception as exc:
        article_copy["summary"]  = article.get("title", "No summary available.")
        article_copy["category"] = "Other"
        error = f"SummarizeCategorize [{article.get('title','?')[:40]}]: {exc}"

    return article_copy, error


def _summarize_categorize(articles: list[dict], errors: list[str]) -> tuple[list[dict], list[str]]:
    """
    Summarizes (LexRank) and categorizes (keywords) all articles.
    Articles are processed in parallel (up to 8 workers) for speed.
    """
    print(f"\n⚡ [Engine] Summarizing + categorizing {len(articles)} articles "
          f"(LexRank + keyword — zero LLM)...")

    if not articles:
        print("   ⚠️  No articles to process.")
        return [], errors

    results_map: dict[int, dict] = {}

    # IO-bound (HTTP fetches dominate) → threads work well here
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {
            pool.submit(_process_article, article): idx
            for idx, article in enumerate(articles)
        }

        for future in as_completed(futures):
            idx              = futures[future]
            enriched, error  = future.result()

            if error:
                errors.append(error)
                print(f"   ⚠️  [{idx+1}/{len(articles)}] Error — fallback applied")
            else:
                cat   = enriched.get("category", "?")
                title = enriched.get("title", "")[:55]
                print(f"   ✅ [{idx+1}/{len(articles)}] {cat:10s} | {title}...")

            results_map[idx] = enriched

    processed = [results_map[i] for i in sorted(results_map.keys())]
    print(f"   ✅ Done — {len(processed)} articles summarized & categorized (0 LLM calls)")
    return processed, errors


# ════════════════════════════════════════════════════════════════════
#  Step 3 — Analyst (top stories, trend, research highlight)
# ════════════════════════════════════════════════════════════════════

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


def _analyze(articles: list[dict]) -> dict:
    """
    Analyses all categorized articles and extracts key intelligence —
    entirely through keyword scoring, no LLM required.
    """
    print(f"\n🧠 [Engine] Analysing {len(articles)} articles for trends (zero LLM)...")

    if not articles:
        return {
            "top_stories":        [],
            "insights":           "No new AI news found today.",
            "research_highlight": "No research papers today.",
        }

    # 1. Score + pick top 5
    scored = sorted(articles, key=_score_article, reverse=True)
    top_stories = scored[:5]
    print(f"   ✅ Top 5 stories selected (scores: "
          f"{[round(_score_article(a), 1) for a in top_stories]})")

    # 2. Detect dominant themes for the trend sentence
    top_themes = _detect_themes(articles)
    insights   = _build_trend_sentence(top_themes, len(articles))
    print(f"   ✅ Top themes: {top_themes[:3]}")

    # 3. Research highlight — best ArXiv paper
    arxiv_articles = [
        a for a in articles
        if "arxiv" in a.get("source", "").lower()
        or a.get("category") == "Research"
    ]

    if arxiv_articles:
        best_paper         = max(arxiv_articles, key=_score_article)
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
    }


# ════════════════════════════════════════════════════════════════════
#  Orchestrator
# ════════════════════════════════════════════════════════════════════

def process(state: dict) -> dict:
    """
    Runs the full intelligence step: dedup → summarize+categorize → analyze.

    Reads:  raw_articles
    Writes: filtered_articles, total_new, summarized_articles,
            categorized_articles, top_stories, insights,
            research_highlight, errors
    """
    errors    = list(state.get("errors", []))
    filtered, errors    = _deduplicate(state["raw_articles"], errors)
    enriched, errors    = _summarize_categorize(filtered, errors)
    analysis            = _analyze(enriched)

    # Store every new article in Firestore so the webApp can show them as blogs
    for article in enriched:
        save_blog_post(article)

    return {
        "filtered_articles":     filtered,
        "total_new":             len(filtered),
        "summarized_articles":   enriched,
        "categorized_articles":  enriched,
        "top_stories":           analysis["top_stories"],
        "insights":              analysis["insights"],
        "research_highlight":    analysis["research_highlight"],
        "errors":                errors,
    }