-- Enable pgvector (run once on your database)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Sources table (documents)
CREATE TABLE IF NOT EXISTS public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  mime_type text,
  bytes integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Chunks table with pgvector embedding
CREATE TABLE IF NOT EXISTS public.chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.sources(id) ON DELETE CASCADE,
  chunk_index integer,
  content text,
  embedding vector(1536),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chunks_source ON public.chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_chunks_ivfflat ON public.chunks USING ivfflat (embedding vector_cosine_ops);

-- RPC for similarity search (optionally filtered by source)
CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding vector,
  match_count int DEFAULT 8,
  in_source uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source_id uuid,
  content text,
  similarity float
) AS $$
  SELECT c.id, c.source_id, c.content,
         1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.chunks c
  WHERE (in_source IS NULL OR c.source_id = in_source)
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql STABLE;

-- Optional app-level tables for decks/cards storage
CREATE TABLE IF NOT EXISTS public.app_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.app_decks(id) ON DELETE CASCADE,
  front text NOT NULL,
  back text NOT NULL,
  hint text,
  difficulty text CHECK (difficulty IN ('again','hard','good','easy')) DEFAULT 'good',
  ease_factor real DEFAULT 2.5,
  interval integer DEFAULT 0,
  repetitions integer DEFAULT 0,
  next_review_at timestamptz DEFAULT now(),
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
