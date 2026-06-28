"""
scheduler.py
------------
Runs the AI News pipeline automatically every day at 8:00 AM IST
using APScheduler.

Usage:
    python scheduler.py

Keep this running in the background (or as a Windows startup task)
for fully automated daily digests.
"""

import logging
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

from config import settings
from main import run_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

IST = pytz.timezone("Asia/Kolkata")


def scheduled_job():
    """Wrapper that runs the pipeline and logs the outcome."""
    logger.info("⏰ Scheduled job triggered — starting AI news pipeline...")
    try:
        result = run_pipeline()
        status = result.get("delivery_status", {})
        logger.info(f"✅ Pipeline done. Delivery: {status}")
    except Exception as e:
        logger.error(f"❌ Pipeline failed: {e}", exc_info=True)


def start_scheduler():
    scheduler = BlockingScheduler(timezone=IST)

    # Schedule at configured time (default: 8:00 AM IST)
    trigger = CronTrigger(
        hour=settings.DIGEST_HOUR_IST,
        minute=settings.DIGEST_MINUTE_IST,
        timezone=IST,
    )

    scheduler.add_job(
        func=scheduled_job,
        trigger=trigger,
        id="ai_news_daily",
        name="AI News Daily Digest",
        replace_existing=True,
    )

    next_run = scheduler.get_jobs()[0].next_run_time
    logger.info("="*55)
    logger.info("  🤖 AI News Scheduler Started")
    logger.info(f"  ⏰ Daily digest at: {settings.DIGEST_HOUR_IST:02d}:{settings.DIGEST_MINUTE_IST:02d} IST")
    logger.info(f"  📅 Next run:        {next_run.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    logger.info("  Press Ctrl+C to stop")
    logger.info("="*55)

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("🛑 Scheduler stopped.")


if __name__ == "__main__":
    start_scheduler()
