"""
server.py
---------
FastAPI server that:
  1. Runs the AI News pipeline on a daily schedule (APScheduler)
  2. Exposes REST endpoints to trigger and monitor runs
  3. Serves a live dashboard at /dashboard

Run locally:
    uvicorn server:app --reload --port 8000

Deploy to Railway/Render:
    The Procfile handles this automatically.
"""

import sys
import threading
import logging
from datetime import datetime
from contextlib import asynccontextmanager
from pathlib import Path

import pytz
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from config import settings
from main import run_pipeline
from graph.workflow import _get_pool

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

IST = pytz.timezone("Asia/Kolkata")

# ── Template directory ────────────────────────────────────────────────
TEMPLATE_DIR = Path(__file__).parent / "templates"


# ── Shared in-process state ───────────────────────────────────────────
_lock       = threading.Lock()
_is_running = False
_run_history: list[dict] = []      # Last 10 pipeline runs
_scheduler: BackgroundScheduler | None = None


# ── Helpers ───────────────────────────────────────────────────────────

def _record_run(result: dict | None, error: str | None = None) -> None:
    """Appends a run entry to the in-memory history (capped at 10)."""
    global _run_history
    entry = {
        "timestamp":       datetime.now(IST).isoformat(),
        "status":          "error" if error else "success",
        "error":           error,
        "run_date":        result.get("run_date")        if result else None,
        "total_fetched":   result.get("total_fetched", 0) if result else 0,
        "total_new":       result.get("total_new", 0)    if result else 0,
        "delivery_status": result.get("delivery_status", {}) if result else {},
        "errors":          result.get("errors", [])      if result else [],
    }
    _run_history.insert(0, entry)
    _run_history = _run_history[:10]


def _run_pipeline_job() -> None:
    """
    Thread-safe wrapper around run_pipeline().
    Sets the running flag, records results, and always clears the flag.
    """
    global _is_running

    with _lock:
        if _is_running:
            logger.warning("Pipeline already running — skipping duplicate trigger.")
            return
        _is_running = True

    try:
        logger.info("🚀 AI News pipeline starting…")
        result = run_pipeline()
        _record_run(result)
        status = result.get("delivery_status", {})
        logger.info(f"✅ Pipeline complete. Delivery: {status}")
    except Exception as exc:
        logger.error(f"❌ Pipeline failed: {exc}", exc_info=True)
        _record_run(None, error=str(exc))
    finally:
        _is_running = False


# ── Lifespan (startup / shutdown) ─────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start APScheduler on startup; shut it down cleanly on exit."""
    global _scheduler

    _scheduler = BackgroundScheduler(timezone=IST)
    trigger = CronTrigger(
        hour=settings.DIGEST_HOUR_IST,
        minute=settings.DIGEST_MINUTE_IST,
        timezone=IST,
    )
    _scheduler.add_job(
        func=_run_pipeline_job,
        trigger=trigger,
        id="ai_news_daily",
        name="AI News Daily Digest",
        replace_existing=True,
    )
    _scheduler.start()

    jobs = _scheduler.get_jobs()
    if jobs and jobs[0].next_run_time:
        next_str = jobs[0].next_run_time.strftime("%Y-%m-%d %H:%M:%S %Z")
    else:
        next_str = "N/A"

    logger.info("=" * 55)
    logger.info("  🤖 AI News Agent Server started")
    logger.info(f"  ⏰ Daily digest at: {settings.DIGEST_HOUR_IST:02d}:{settings.DIGEST_MINUTE_IST:02d} IST")
    logger.info(f"  📅 Next run:        {next_str}")
    logger.info("  📊 Dashboard:       /dashboard")
    logger.info("=" * 55)

    yield  # Server is running

    # ── Shutdown ──────────────────────────────────────────────────────
    _scheduler.shutdown(wait=False)
    try:
        pool = _get_pool()
        if pool:
            pool.close()
    except Exception:
        pass
    logger.info("🛑 Server shut down cleanly.")


# ── FastAPI app ───────────────────────────────────────────────────────

app = FastAPI(
    title="AI News Multi-Agent",
    description="Automated AI news scraping, summarization, and delivery pipeline.",
    version="2.0.0",
    lifespan=lifespan,
)


# ── Endpoints ─────────────────────────────────────────────────────────

@app.get("/", tags=["health"], summary="Health check")
def health() -> dict:
    """Returns server health, running status, and next scheduled run time."""
    next_run = None
    if _scheduler:
        jobs = _scheduler.get_jobs()
        if jobs and jobs[0].next_run_time:
            next_run = jobs[0].next_run_time.isoformat()

    return {
        "status":              "ok",
        "is_running":          _is_running,
        "next_scheduled_run":  next_run,
        "total_runs":          len(_run_history),
    }


@app.post("/run", tags=["pipeline"], summary="Trigger pipeline manually")
def trigger_run() -> dict:
    """
    Starts the pipeline immediately in a background thread.
    Returns 'already_running' if a run is currently in progress.
    """
    if _is_running:
        return {
            "status":  "already_running",
            "message": "A pipeline run is already in progress. Please wait.",
        }

    thread = threading.Thread(target=_run_pipeline_job, daemon=True)
    thread.start()

    return {
        "status":  "triggered",
        "message": "Pipeline started in the background. Check /status for updates.",
    }


@app.get("/status", tags=["pipeline"], summary="Get pipeline status")
def get_status() -> dict:
    """Returns the current running state and full run history (last 10 runs)."""
    return {
        "is_running": _is_running,
        "last_run":   _run_history[0] if _run_history else None,
        "history":    _run_history,
    }


@app.get("/dashboard", response_class=HTMLResponse, tags=["ui"], summary="Live dashboard")
def dashboard() -> HTMLResponse:
    """Serves the interactive dashboard HTML page."""
    html_path = TEMPLATE_DIR / "dashboard.html"
    return HTMLResponse(content=html_path.read_text(encoding="utf-8"))
