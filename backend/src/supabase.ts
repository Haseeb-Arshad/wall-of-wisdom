import { createClient } from '@supabase/supabase-js'
import { ENV } from './env'

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
})

export type SourceRow = {
  id: string
  title?: string | null
  mime_type?: string | null
  bytes?: number | null
}

export async function upsertSource(input: { title?: string; mime?: string; bytes?: number }): Promise<SourceRow> {
  // Try with all fields first; if columns are missing (older schema), fallback progressively.
  let payload: any = { title: input.title, mime_type: input.mime, bytes: input.bytes }
  let lastError: any = null
  for (const variant of [payload, { title: input.title, mime_type: input.mime }, { title: input.title }]) {
    const { data, error } = await supabase
      .from('sources')
      .insert(variant)
      .select('*')
      .single()
    if (!error) return data as any
    lastError = error
    // Only retry on missing column errors (PGRST204 from PostgREST schema cache)
    if (String(error.code) !== 'PGRST204') break
  }
  throw lastError
}

export async function insertChunks(rows: { source_id: string; chunk_index: number; content: string; embedding: number[] }[]) {
  if (rows.length === 0) return
  const { error } = await supabase.from('chunks').insert(rows)
  if (error) throw error
}

export async function matchChunks(queryEmbedding: number[], opts: { sourceId?: string; limit?: number } = {}) {
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_count: opts.limit ?? 8,
    in_source: opts.sourceId ?? null,
  })
  if (error) throw error
  return (data || []) as { id: string; source_id: string; content: string; similarity: number }[]
}

// App-level storage (optional)
export async function createDeckRow(title: string) {
  const { data, error } = await supabase
    .from('app_decks')
    .insert({ title })
    .select('*')
    .single()
  if (error) throw error
  return data as { id: string; title: string }
}

export async function insertDeckCards(deckId: string, cards: { front: string; back: string; hint?: string; difficulty?: 'again'|'hard'|'good'|'easy' }[]) {
  if (!cards.length) return { count: 0 }
  const payload = cards.map(c => ({
    deck_id: deckId,
    front: c.front,
    back: c.back,
    hint: c.hint ?? null,
    difficulty: c.difficulty ?? 'good',
  }))
  const { error, count } = await supabase
    .from('app_cards')
    .insert(payload, { count: 'exact' })
  if (error) throw error
  return { count: count ?? payload.length }
}
