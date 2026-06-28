"""
db/connection.py
----------------
Manages the PostgreSQL connection pool for the entire application.
Uses psycopg3 with a connection pool for efficient reuse.
"""

import os
from dotenv import load_dotenv
from psycopg_pool import ConnectionPool

load_dotenv()

_pool: ConnectionPool | None = None


def get_connection_string() -> str:
    """Returns the DATABASE_URL from environment variables."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL is not set in the .env file")
    return db_url


def get_pool() -> ConnectionPool:
    """
    Returns a shared connection pool (creates it on first call).
    Uses lazy initialization to avoid connecting at import time.
    """
    global _pool
    if _pool is None:
        _pool = ConnectionPool(
            conninfo=get_connection_string(),
            min_size=1,
            max_size=5,
            open=True,
        )
    return _pool


def close_pool() -> None:
    """Closes the connection pool (call during app shutdown)."""
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None
