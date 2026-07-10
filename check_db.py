import psycopg, os
from dotenv import load_dotenv
load_dotenv()

with psycopg.connect(os.getenv('DATABASE_URL')) as conn:
    with conn.cursor() as cur:
        # Check what tables exist
        cur.execute("""
            SELECT table_name, table_schema 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name;
        """)
        tables = cur.fetchall()
        print("All tables in DB:")
        for t in tables:
            print(f"  {t[1]}.{t[0]}")

        # Check extensions
        cur.execute("SELECT extname FROM pg_extension;")
        exts = cur.fetchall()
        print("Extensions:", [e[0] for e in exts])

        # Try to count rows in ai_articles if it exists
        try:
            cur.execute("SELECT COUNT(*) FROM ai_articles;")
            count = cur.fetchone()[0]
            print(f"ai_articles row count: {count}")
        except Exception as e:
            print(f"ai_articles check failed: {e}")
