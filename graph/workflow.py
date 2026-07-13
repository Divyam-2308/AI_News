"""
graph/workflow.py
-----------------
Assembles the LangGraph StateGraph by connecting all agent nodes
with edges to define the execution order of the pipeline.
Uses a persistent connection pool for PostgreSQL checkpointing.

Optimized pipeline (v2):
    START → scraper → dedup → summarize_categorize → analyst → reporter → delivery → END

The combined summarize_categorize node runs ONE Gemini call per article
(vs. 2 before) and processes up to 5 articles in parallel via ThreadPoolExecutor.
"""

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import ConnectionPool

from graph.state import GraphState
from agents.scraper_agent import scraper_node
from agents.dedup_agent import dedup_node
from agents.summarize_categorize_agent import summarize_categorize_node
from agents.analyst_agent import analyst_node
from agents.reporter_agent import reporter_node
from agents.delivery_agent import delivery_node
from db.connection import get_connection_string

# Module-level pool — stays open for the lifetime of the process
_pool: ConnectionPool | None = None


def _get_pool() -> ConnectionPool:
    """Returns a lazily-initialized persistent connection pool."""
    global _pool
    if _pool is None:
        _pool = ConnectionPool(
            conninfo=get_connection_string(),
            min_size=2,
            max_size=10,
            open=True,
        )
    return _pool


def build_graph():
    """
    Builds and compiles the optimized LangGraph pipeline with PostgreSQL checkpointing.

    Flow:
        START → scraper → dedup → summarize_categorize → analyst → reporter → delivery → END

    Returns:
        A compiled LangGraph CompiledGraph ready for .invoke()
    """
    builder = StateGraph(GraphState)

    # ── Register nodes ────────────────────────────────────────────────
    builder.add_node("scraper",              scraper_node)
    builder.add_node("dedup",                dedup_node)
    builder.add_node("summarize_categorize", summarize_categorize_node)
    builder.add_node("analyst",              analyst_node)
    builder.add_node("reporter",             reporter_node)
    builder.add_node("delivery",             delivery_node)

    # ── Define edges (execution order) ───────────────────────────────
    builder.add_edge(START,                   "scraper")
    builder.add_edge("scraper",               "dedup")
    builder.add_edge("dedup",                 "summarize_categorize")
    builder.add_edge("summarize_categorize",  "analyst")
    builder.add_edge("analyst",               "reporter")
    builder.add_edge("reporter",              "delivery")
    builder.add_edge("delivery",              END)

    # ── Attach PostgreSQL checkpointer (pool stays alive) ────────────
    pool = _get_pool()
    checkpointer = PostgresSaver(pool)
    checkpointer.setup()   # Creates checkpoint tables if not exists

    return builder.compile(checkpointer=checkpointer)
