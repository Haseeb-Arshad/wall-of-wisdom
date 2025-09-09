Backend (Bun + Supabase + OpenAI + LangGraph)

Overview
- Bun-based HTTP server exposing endpoints to upload and ingest documents, store chunk embeddings in Supabase (pgvector), and generate MCQs via an agentic RAG pipeline built with LangGraph and OpenAI.
- Designed to align with the app’s Deck/Card model, so generated MCQs can be consumed by the frontend.

Endpoints
- POST /api/upload
  - Multipart upload: accepts PDF/DOCX/TXT. Extracts text and returns a sourceId and byte length.
- POST /api/ingest
  - Body: { sourceId, title, text }
  - Chunks text, creates embeddings, upserts chunks into Supabase.
- POST /api/mcqs
  - Body: { sourceId, n = 10 }
  - Runs agentic RAG with LangGraph to retrieve context and generate n MCQs. Returns cards: [{ front, back, hint, difficulty }].
- POST /api/decks
  - Body: { title, sourceId?, n? }
  - Creates a deck in Supabase and, if sourceId provided, generates and stores MCQs into that deck.
- POST /api/decks/:id/mcqs
  - Body: { sourceId, n? }
  - Generates and stores MCQs into an existing deck.

Quick Start
1) Install Bun:
   - https://bun.sh

2) Configure env vars (copy .env.example → .env and fill values):
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE (Service role key; required for writes & RPC)
   - OPENAI_API_KEY
   - OPENAI_MODEL (default: gpt-5-nano; set to a valid model in your account)
   - OPENAI_EMBED_MODEL (default: text-embedding-3-small)

3) Create Supabase tables/functions:
   - psql your DB and run sql/schema.sql

4) Install deps and run:
   - bun install
   - bun run dev

Schema (Supabase)
- tables: sources, chunks
- function: match_chunks(query_embedding vector, match_count int, source_id uuid?) → returns nearest chunks

Notes
- The default OPENAI_MODEL is set to "gpt-5-nano" per request, but you should change it to a model that exists in your OpenAI account.
- PDF/DOCX extraction uses pdf-parse and mammoth. If a file cannot be parsed, the server falls back to octet-to-text best-effort.
- LangGraph pipeline is small and focused: retrieve → compose → generate → validate.
- CORS is enabled for GET/POST/OPTIONS with wildcard origin for local development.
