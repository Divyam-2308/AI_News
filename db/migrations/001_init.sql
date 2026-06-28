-- db/migrations/001_init.sql
-- Run this ONCE via setup_db.py to initialize the database schema.

-- Enable the pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Main articles table
CREATE TABLE IF NOT EXISTS ai_articles (
    id           SERIAL PRIMARY KEY,
    title        TEXT NOT NULL,
    url          TEXT UNIQUE NOT NULL,
    source       TEXT,
    category     TEXT,
    summary      TEXT,
    content      TEXT,
    published_at TIMESTAMP,
    fetched_at   TIMESTAMP DEFAULT NOW(),
    embedding    vector(768)   -- Gemini text-embedding-004 dimensions
);

-- Index for fast URL lookups (dedup)
CREATE INDEX IF NOT EXISTS idx_ai_articles_url
    ON ai_articles (url);

-- Index for fast date-based queries
CREATE INDEX IF NOT EXISTS idx_ai_articles_fetched_at
    ON ai_articles (fetched_at DESC);

-- Index for pgvector cosine similarity search (used in Phase 2)
CREATE INDEX IF NOT EXISTS idx_ai_articles_embedding
    ON ai_articles USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Index for category-based filtering
CREATE INDEX IF NOT EXISTS idx_ai_articles_category
    ON ai_articles (category);
