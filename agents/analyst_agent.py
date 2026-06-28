"""
agents/analyst_agent.py
------------------------
Analyst Agent — LangGraph node that uses Gemini 1.5 Flash to:
    1. Pick the top 5 must-read stories of the day
    2. Write a 2-3 sentence overall trend summary
    3. Highlight the most important research paper (if any)
"""

from graph.state import GraphState
from config import get_llm

ANALYST_PROMPT = """You are an expert AI industry analyst. 
You have read today's AI news articles. Here is a list of article titles and summaries:

{articles_text}

Based on these articles, provide your analysis in this EXACT format:

TOP_STORIES:
[List the 5 most important article numbers, comma-separated, e.g.: 1,3,5,7,12]

TREND:
[Write 2-3 sentences describing the biggest trend or theme in today's AI news. Keep it simple and clear.]

RESEARCH_HIGHLIGHT:
[Write 1-2 sentences about the most interesting research paper today. If none, write "No major research papers today."]

KEY_INSIGHT:
[Write 1 sentence: the single most important thing happening in AI right now.]
"""


def analyst_node(state: GraphState) -> dict:
    """
    Analyzes all categorized articles and extracts key insights.

    Reads:  categorized_articles
    Writes: top_stories, insights, research_highlight, errors
    """
    articles = state["categorized_articles"]
    print(f"\n🧠 [Analyst] Analyzing {len(articles)} articles for trends...")

    if not articles:
        return {
            "top_stories": [],
            "insights": "No new AI news found today.",
            "research_highlight": "No research papers today.",
            "errors": state.get("errors", []),
        }

    llm = get_llm()
    errors: list[str] = state.get("errors", [])

    # Format articles for the prompt
    articles_text = "\n".join([
        f"{i+1}. [{a.get('category','Other')}] {a.get('title','')} — {a.get('summary','')[:150]}"
        for i, a in enumerate(articles)
    ])

    try:
        prompt = ANALYST_PROMPT.format(articles_text=articles_text)
        response = llm.invoke(prompt)
        raw_output = response.content.strip()

        # Parse the structured response
        top_story_indices = []
        insights = ""
        research_highlight = ""

        for line in raw_output.split("\n"):
            line = line.strip()
            if line.startswith("TOP_STORIES:"):
                pass  # next line has the data
            elif line.startswith("TREND:"):
                pass
            elif line.startswith("RESEARCH_HIGHLIGHT:"):
                pass
            elif line.startswith("KEY_INSIGHT:"):
                pass

        # Simpler parse: split by known sections
        sections = {}
        current_key = None
        for line in raw_output.split("\n"):
            stripped = line.strip()
            if stripped.endswith(":") and stripped[:-1] in ["TOP_STORIES", "TREND", "RESEARCH_HIGHLIGHT", "KEY_INSIGHT"]:
                current_key = stripped[:-1]
                sections[current_key] = ""
            elif current_key and stripped:
                sections[current_key] = (sections.get(current_key, "") + " " + stripped).strip()

        # Extract top story indices
        top_indices_raw = sections.get("TOP_STORIES", "1,2,3,4,5")
        try:
            top_indices = [int(x.strip()) - 1 for x in top_indices_raw.split(",") if x.strip().isdigit()]
            top_stories = [articles[i] for i in top_indices if 0 <= i < len(articles)]
        except Exception:
            top_stories = articles[:5]

        insights           = sections.get("TREND", "AI continues to evolve rapidly.")
        research_highlight = sections.get("RESEARCH_HIGHLIGHT", "No major research papers today.")

        print(f"   ✅ Top trend identified: {insights[:80]}...")
        print(f"   ✅ {len(top_stories)} top stories selected")

    except Exception as e:
        error_msg = f"Analyst: {str(e)}"
        errors.append(error_msg)
        top_stories = articles[:5]
        insights = "AI continues to advance rapidly across multiple domains."
        research_highlight = "No research highlight available today."

    return {
        "top_stories":         top_stories,
        "insights":            insights,
        "research_highlight":  research_highlight,
        "errors":              errors,
    }
