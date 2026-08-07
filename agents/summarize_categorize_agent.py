"""
agents/summarize_categorize_agent.py  (v2 — zero LLM)
------------------------------------------------------
Replaces the Gemini-based summarizer + categorizer with two
fully free, offline algorithms:

  Summarization  → sumy LexRankSummarizer (graph-based extractive NLP)
  Categorization → keyword scoring across 8 predefined categories

Also fetches the full article body from the article URL before
summarizing, so sumy has real content instead of a 150-char RSS stub.

No API keys. No rate limits. No costs. Runs entirely locally.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

from tools.content_fetcher import fetch_article_content
from graph.state import GraphState


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


# ── Core functions ────────────────────────────────────────────────────

def _lexrank_summarize(text: str, sentence_count: int = 3) -> str:
    """
    Runs LexRank extractive summarization on plain text.
    Returns the top `sentence_count` sentences joined as a string.
    Falls back to first 400 chars if text is too short for sumy.
    """
    word_count = len(text.split())
    if word_count < 30:
        # Text too short for graph-based ranking — just return as-is
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
        # 1. Get richest available content
        url          = article.get("url", "")
        rss_content  = article.get("content", "").strip()

        # Fetch full body if RSS only has a stub (< 300 chars)
        full_content = ""
        if url and len(rss_content) < 300:
            full_content = fetch_article_content(url)

        text_to_summarize = full_content or rss_content or article.get("title", "")

        # 2. Summarize
        summary = _lexrank_summarize(text_to_summarize, sentence_count=3)
        if not summary:
            summary = article.get("title", "No summary available.")

        # 3. Categorize using title + fresh summary
        category = _keyword_categorize(
            title   = article.get("title", ""),
            summary = summary,
        )

        article_copy["summary"]  = summary
        article_copy["category"] = category

    except Exception as exc:
        article_copy["summary"]  = article.get("title", "No summary available.")
        article_copy["category"] = "Other"
        error = f"SummarizeCategorize [{article.get('title','?')[:40]}]: {exc}"

    return article_copy, error


# ── LangGraph node ────────────────────────────────────────────────────

def summarize_categorize_node(state: GraphState) -> dict:
    """
    Summarizes and categorizes all articles using:
      - sumy LexRank  (no LLM, fully offline)
      - keyword scoring (no LLM, fully offline)

    Articles are processed in parallel (up to 8 workers) for speed.

    Reads:  filtered_articles
    Writes: summarized_articles, categorized_articles, errors
    """
    articles = state["filtered_articles"]
    errors: list[str] = list(state.get("errors", []))

    print(f"\n⚡ [Summarize+Categorize] Processing {len(articles)} articles "
          f"(LexRank + keyword — zero LLM)...")

    if not articles:
        print("   ⚠️  No articles to process.")
        return {
            "summarized_articles":  [],
            "categorized_articles": [],
            "errors": errors,
        }

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

    # Restore original order
    processed = [results_map[i] for i in sorted(results_map.keys())]
    print(f"\n   ✅ Done — {len(processed)} articles summarized & categorized (0 LLM calls)")

    return {
        "summarized_articles":  processed,
        "categorized_articles": processed,
        "errors": errors,
    }
