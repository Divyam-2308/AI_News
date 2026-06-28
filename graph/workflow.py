"""
graph/workflow.py
-----------------
Assembles the LangGraph StateGraph by connecting all agent nodes
with edges to define the execution order of the pipeline.
"""

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver

from graph.state import GraphState
from agents.scraper_agent import scraper_node
from agents.dedup_agent import dedup_node
from agents.summarizer_agent import summarizer_node
from agents.categorizer_agent import categorizer_node
from agents.analyst_agent import analyst_node
from agents.reporter_agent import reporter_node
from agents.delivery_agent import delivery_node
from db.connection import get_connection_string


def build_graph() -> StateGraph:
    """
    Builds and compiles the LangGraph pipeline.

    Flow:
        START → scraper → dedup → summarizer → categorizer
              → analyst → reporter → delivery → END

    Returns:
        A compiled LangGraph graph with PostgreSQL checkpointing.
    """
    builder = StateGraph(GraphState)

    # ── Register nodes ────────────────────────────────────────────────
    builder.add_node("scraper",     scraper_node)
    builder.add_node("dedup",       dedup_node)
    builder.add_node("summarizer",  summarizer_node)
    builder.add_node("categorizer", categorizer_node)
    builder.add_node("analyst",     analyst_node)
    builder.add_node("reporter",    reporter_node)
    builder.add_node("delivery",    delivery_node)

    # ── Define edges (execution order) ───────────────────────────────
    builder.add_edge(START,        "scraper")
    builder.add_edge("scraper",    "dedup")
    builder.add_edge("dedup",      "summarizer")
    builder.add_edge("summarizer", "categorizer")
    builder.add_edge("categorizer","analyst")
    builder.add_edge("analyst",    "reporter")
    builder.add_edge("reporter",   "delivery")
    builder.add_edge("delivery",   END)

    # ── Attach PostgreSQL checkpointer ───────────────────────────────
    with PostgresSaver.from_conn_string(get_connection_string()) as checkpointer:
        checkpointer.setup()  # Creates checkpoint tables if not exists
        graph = builder.compile(checkpointer=checkpointer)

    return graph
