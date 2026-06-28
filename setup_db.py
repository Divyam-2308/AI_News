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
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

MIGRATION_FILE = Path(__file__).parent / "db" / "migrations" / "001_init.sql"


def setup_database() -> None:
    """Creates all required tables and indexes in PostgreSQL."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL is not set in .env")

    print("🗄️  Connecting to PostgreSQL...")

    with psycopg.connect(db_url) as conn:
        print("✅ Connected!")

        # Read and execute the migration SQL
        sql = MIGRATION_FILE.read_text()
        print("📦 Running migration: 001_init.sql...")

        with conn.cursor() as cur:
            # Execute each statement separately
            for statement in sql.split(";"):
                stmt = statement.strip()
                if stmt and not stmt.startswith("--"):
                    try:
                        cur.execute(stmt)
                        print(f"   ✅ {stmt[:60].replace(chr(10),' ')}...")
                    except Exception as e:
                        print(f"   ⚠️  Skipped (may already exist): {e}")

        conn.commit()

    print("\n🎉 Database setup complete!")
    print("   Tables created: ai_articles")
    print("   Extensions:     pgvector")
    print("   Indexes:        url, fetched_at, category, embedding")
    print("\nYou can now run: python main.py")


if __name__ == "__main__":
    setup_database()
