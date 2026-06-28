"""
agents/dedup_agent.py
---------------------
Dedup Agent — LangGraph node that removes duplicate or already-seen
articles using pgvector cosine similarity search.

Logic:
    1. Generate a Gemini embedding for each article title+summary
    2. Query the ai_articles table in PostgreSQL for similar vectors
    3. If cosine similarity > 0.90 → article already seen → skip
    4. Save new articles' embeddings to the DB for future runs
"""

from graph.state import GraphState
from db.article_store import is_duplicate, save_article_stub


def dedup_node(state: GraphState) -> dict:
    """
    Filters out articles that are duplicates or already sent in past runs.

    Reads:  raw_articles
    Writes: filtered_articles, total_new, errors
    """
    print(f"\n🔎 [Dedup] Checking {len(state['raw_articles'])} articles for duplicates...")

    filtered: list[dict] = []
    errors: list[str] = state.get("errors", [])

    for article in state["raw_articles"]:
        try:
            if not is_duplicate(article):
                filtered.append(article)
                # Save stub to DB so future runs know about it
                save_article_stub(article)
        except Exception as e:
            error_msg = f"Dedup [{article.get('url', 'unknown')}]: {str(e)}"
            errors.append(error_msg)

    removed = len(state["raw_articles"]) - len(filtered)
    print(f"   ✅ {len(filtered)} new articles  |  🗑️  {removed} duplicates removed")

    return {
        "filtered_articles": filtered,
        "total_new":         len(filtered),
        "errors":            errors,
    }
