"""
agents/categorizer_agent.py
----------------------------
Categorizer Agent — LangGraph node that uses Gemini 1.5 Flash
to assign a category tag to each article.

Categories:
    LLMs | Robotics | Tools | Research | Funding | Policy | Hardware | Other
"""

import time
from graph.state import GraphState
from config import get_llm

VALID_CATEGORIES = ["LLMs", "Robotics", "Tools", "Research", "Funding", "Policy", "Hardware", "Other"]

CATEGORIZE_PROMPT = """You are an AI news categorizer.
Given the article title and summary below, respond with ONLY one category from this list:
LLMs, Robotics, Tools, Research, Funding, Policy, Hardware, Other

Title: {title}
Summary: {summary}

Category:"""


def categorizer_node(state: GraphState) -> dict:
    """
    Tags each summarized article with a category label.

    Reads:  summarized_articles
    Writes: categorized_articles, errors
    """
    articles = state["summarized_articles"]
    print(f"\n🏷️  [Categorizer] Categorizing {len(articles)} articles...")

    llm = get_llm()
    categorized: list[dict] = []
    errors: list[str] = state.get("errors", [])

    for i, article in enumerate(articles):
        try:
            prompt = CATEGORIZE_PROMPT.format(
                title=article.get("title", ""),
                summary=article.get("summary", ""),
            )
            response = llm.invoke(prompt)
            raw_category = response.content.strip()

            # Validate the category returned by the LLM
            category = "Other"
            for valid in VALID_CATEGORIES:
                if valid.lower() in raw_category.lower():
                    category = valid
                    break

            article_copy = dict(article)
            article_copy["category"] = category
            categorized.append(article_copy)

            print(f"   [{i+1}/{len(articles)}] {category:10s} | {article.get('title', '')[:55]}...")
            time.sleep(0.5)  # Rate limit

        except Exception as e:
            error_msg = f"Categorizer [{article.get('title', 'unknown')[:40]}]: {str(e)}"
            errors.append(error_msg)
            article_copy = dict(article)
            article_copy["category"] = "Other"
            categorized.append(article_copy)

    return {
        "categorized_articles": categorized,
        "errors": errors,
    }
