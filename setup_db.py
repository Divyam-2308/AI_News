"""
setup_db.py
-----------
One-time database setup script.
Run this ONCE before using the application to create all required tables.

Usage:
    python setup_db.py
"""

import os
import psycopg
from dotenv import load_dotenv

load_dotenv()


def setup_database() -> None:
    """Creates all required tables and indexes in PostgreSQL."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL is not set in .env")

    print("Connecting to PostgreSQL...")

    with psycopg.connect(db_url) as conn:
        print("Connected!")
        conn.autocommit = True

        with conn.cursor() as cur:

            # 1. Create ai_articles table (embedding added in Phase 2)
            print("Creating ai_articles table...")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS ai_articles (
                    id           SERIAL PRIMARY KEY,
                    title        TEXT NOT NULL,
                    url          TEXT UNIQUE NOT NULL,
                    source       TEXT,
                    category     TEXT,
                    summary      TEXT,
                    content      TEXT,
                    published_at TIMESTAMP,
                    fetched_at   TIMESTAMP DEFAULT NOW()
                );
            """)
            print("  ai_articles table ready")

            # 3. Create indexes
            print("Creating indexes...")
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_ai_articles_url
                ON ai_articles (url);
            """)
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_ai_articles_fetched_at
                ON ai_articles (fetched_at DESC);
            """)
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_ai_articles_category
                ON ai_articles (category);
            """)
            print("  Indexes ready")

            # 4. Verify
            cur.execute("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'ai_articles'
                ORDER BY ordinal_position;
            """)
            columns = cur.fetchall()

    print("\nDatabase setup complete!")
    print("Table: ai_articles")
    print("Columns:")
    for col in columns:
        print(f"  - {col[0]:15s} {col[1]}")
    print("\nYou can now run: python main.py")


if __name__ == "__main__":
    setup_database()

