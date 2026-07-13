"""
agents/summarize_categorize_agent.py
--------------------------------------
Combined Summarize + Categorize Agent — processes each article with a SINGLE
Gemini LLM call instead of two separate calls, then runs all articles in
parallel via ThreadPoolExecutor for maximum throughput.

Optimization over old approach:
  - Old: 2 sequential LLM calls per article × N articles  =  2N calls total
  - New: 1 parallel LLM call per article, 5 at a time     =  N calls, ~5x faster

Output format per article:
    SUMMARY: <3 clear sentences>
    CATEGORY: <one of the valid categories>
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from graph.state import GraphState
from config import get_llm

VALID_CATEGORIES = [
    "LLMs", "Robotics", "Tools", "Research",
    "Funding", "Policy", "Hardware", "Other",
]

COMBINED_PROMPT = """\
You are an expert AI news analyst. Read the article below and provide TWO things.

Title: {title}
Content: {content}

Respond in this EXACT format — no extra text, no markdown:

SUMMARY: <Write exactly 3 clear, simple sentences summarizing the article for a general audience. Avoid jargon. Be direct.>
CATEGORY: <Pick EXACTLY ONE from this list: LLMs, Robotics, Tools, Research, Funding, Policy, Hardware, Other>\
"""


def _parse_response(raw: str, article: dict) -> tuple[str, str]:
    """
    Parses the LLM response into (summary, category).
    Handles both single-line and multi-line output.
    """
    summary = ""
    category = "Other"
    lines = raw.strip().split("\n")

    current_key = None
    summary_lines: list[str] = []
    category_line = ""

    for line in lines:
        stripped = line.strip()
        if stripped.upper().startswith("SUMMARY:"):
            current_key = "SUMMARY"
            rest = stripped[len("SUMMARY:"):].strip()
            if rest:
                summary_lines.append(rest)
        elif stripped.upper().startswith("CATEGORY:"):
            current_key = "CATEGORY"
            category_line = stripped[len("CATEGORY:"):].strip()
        elif current_key == "SUMMARY" and stripped:
            summary_lines.append(stripped)
        elif current_key == "CATEGORY" and stripped:
            category_line += " " + stripped

    summary = " ".join(summary_lines).strip()
    if not summary:
        summary = article.get("title", "No summary available.")

    for valid in VALID_CATEGORIES:
        if valid.lower() in category_line.lower():
            category = valid
            break

    return summary, category


def _process_article(llm, article: dict) -> tuple[dict, str | None]:
    """
    Summarizes AND categorizes a single article with one LLM call.

    Returns:
        (enriched_article_dict, error_string_or_None)
    """
    article_copy = dict(article)
    try:
        prompt = COMBINED_PROMPT.format(
            title=article.get("title", ""),
            content=article.get("content", article.get("title", ""))[:2000],
        )
        response = llm.invoke(prompt)
        summary, category = _parse_response(response.content, article)

        article_copy["summary"]  = summary
        article_copy["category"] = category
        return article_copy, None

    except Exception as e:
        article_copy["summary"]  = article.get("title", "No summary available.")
        article_copy["category"] = "Other"
        return article_copy, f"SummarizeCategorize [{article.get('title','?')[:40]}]: {e}"


def summarize_categorize_node(state: GraphState) -> dict:
    """
    Summarizes AND categorizes each article in a single LLM call per article,
    running up to 5 articles in parallel via ThreadPoolExecutor.

    Reads:  filtered_articles
    Writes: summarized_articles, categorized_articles, errors
    """
    articles = state["filtered_articles"]
    errors: list[str] = list(state.get("errors", []))

    print(f"\n⚡ [Summarize+Categorize] Processing {len(articles)} articles in parallel...")

    if not articles:
        print("   ⚠️  No articles to process.")
        return {
            "summarized_articles":  [],
            "categorized_articles": [],
            "errors": errors,
        }

    # Create the LLM client ONCE — shared across all threads
    llm = get_llm()

    results_map: dict[int, dict] = {}

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(_process_article, llm, article): idx
            for idx, article in enumerate(articles)
        }

        for future in as_completed(futures):
            idx = futures[future]
            enriched, error = future.result()

            if error:
                errors.append(error)
                print(f"   ⚠️  [{idx+1}/{len(articles)}] Error — kept with fallback values")
            else:
                cat   = enriched.get("category", "?")
                title = enriched.get("title", "")[:55]
                print(f"   ✅ [{idx+1}/{len(articles)}] {cat:10s} | {title}...")

            results_map[idx] = enriched

    # Restore original insertion order
    processed = [results_map[i] for i in sorted(results_map.keys())]

    print(f"\n   ✅ Done — {len(processed)} articles summarized & categorized")

    return {
        "summarized_articles":  processed,
        "categorized_articles": processed,
        "errors": errors,
    }
