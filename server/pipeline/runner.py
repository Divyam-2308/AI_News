"""
runner.py
---------
The plain-Python pipeline runner. Replaces the old LangGraph workflow
with a simple sequential execution:

    scrape → process → report → deliver

Each step reads the shared state dict and returns the keys it updates.
"""

from server.pipeline.state import initial_state
from server.scrapers.scraper import scrape
from server.pipeline.engine import process
from server.pipeline.reporter import report
from server.pipeline.delivery import deliver


def run_pipeline() -> dict:
    """
    Runs the complete AI news pipeline from scraping to delivery.

    Returns:
        Final state dict with all results and delivery status
    """
    state = initial_state()
    state.update(scrape(state))
    state.update(process(state))
    state.update(report(state))
    state.update(deliver(state))
    return state