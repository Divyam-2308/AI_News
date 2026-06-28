"""
agents/summarizer_agent.py
--------------------------
Summarizer Agent — LangGraph node that uses Gemini 1.5 Flash
to summarize each article into 3-4 clear, simple English sentences.
"""

import time
from graph.state import GraphState
from config import get_llm


# Prompt template for summarization
SUMMARIZE_PROMPT = """You are an AI news summarizer. 
Summarize the following article in exactly 3-4 simple, clear sentences.
Write for a general audience — avoid jargon. Be direct and informative.

Title: {title}
Content: {content}

Summary:"""


def summarizer_node(state: GraphState) -> dict:
    """
    Summarizes each filtered article using Gemini Flash.

    Reads:  filtered_articles
    Writes: summarized_articles, errors
    """
    articles = state["filtered_articles"]
    print(f"\n📝 [Summarizer] Summarizing {len(articles)} articles with Gemini...")

    llm = get_llm()
    summarized: list[dict] = []
    errors: list[str] = state.get("errors", [])

    for i, article in enumerate(articles):
        try:
            prompt = SUMMARIZE_PROMPT.format(
                title=article.get("title", ""),
                content=article.get("content", article.get("title", ""))[:2000],
            )
            response = llm.invoke(prompt)
            summary = response.content.strip()

            article_copy = dict(article)
            article_copy["summary"] = summary
            summarized.append(article_copy)

            print(f"   ✅ [{i+1}/{len(articles)}] {article.get('title', '')[:60]}...")

            # Respect Gemini free tier rate limit (15 RPM)
            time.sleep(1)

        except Exception as e:
            error_msg = f"Summarizer [{article.get('title', 'unknown')[:40]}]: {str(e)}"
            errors.append(error_msg)
            # Keep article without summary rather than dropping it
            article_copy = dict(article)
            article_copy["summary"] = article.get("title", "No summary available.")
            summarized.append(article_copy)

    print(f"\n   ✅ Summarized {len(summarized)} articles")

    return {
        "summarized_articles": summarized,
        "errors": errors,
    }
