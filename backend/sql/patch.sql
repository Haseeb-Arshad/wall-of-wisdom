-- Patch for existing deployments that created older sources table version
ALTER TABLE IF EXISTS public.sources
  ADD COLUMN IF NOT EXISTS bytes integer,
  ADD COLUMN IF NOT EXISTS mime_type text;

