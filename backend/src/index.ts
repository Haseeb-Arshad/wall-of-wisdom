import { ENV, assertEnv } from './env'
import { extractTextFromUpload, chunkText } from './ingest'
import { upsertSource, insertChunks, createDeckRow, insertDeckCards } from './supabase'
import { buildMCQGraph } from './ragGraph'
import OpenAI from 'openai'

assertEnv()

const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY })
function withCors(res: Response) {
  const headers = new Headers(res.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  return new Response(res.body, { status: res.status, headers })
}

async function extractFromUrl(url: string): Promise<string> {
  const r = await fetch(url)
  const html = await r.text()
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
  return text
}

const app = {
  async handler(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const { pathname } = url

    if (req.method === 'OPTIONS') {
      return withCors(new Response('', { status: 204 }))
    }

    // Health
    if (pathname === '/health') return withCors(new Response('ok'))

    // Upload file (PDF/DOCX/TXT)
    if (req.method === 'POST' && pathname === '/api/upload') {
      const form = await req.formData()
      const file = form.get('file')
      const title = String(form.get('title') || 'Untitled Source')
      if (!(file instanceof File)) return json({ error: 'file required' }, 400)
      const extracted = await extractTextFromUpload(file)
      const source = await upsertSource({ title, mime: extracted.mime, bytes: extracted.bytes })
      // Ingest immediately
      const chunks = chunkText(extracted.text)
      if (chunks.length) {
        const embeddings = await openai.embeddings.create({
          model: ENV.OPENAI_EMBED_MODEL,
          input: chunks.map(c => c.content),
        })
        await insertChunks(chunks.map((c, i) => ({
          source_id: source.id,
          chunk_index: c.index,
          content: c.content,
          embedding: embeddings.data[i].embedding as unknown as number[],
        })))
      }
      return json({ sourceId: source.id, bytes: extracted.bytes, mime: extracted.mime, textBytes: extracted.text.length, chunks: chunks.length })
    }

    // Ingest raw text into chunks with embeddings
    if (req.method === 'POST' && pathname === '/api/ingest') {
      const body = await req.json().catch(() => ({})) as any
      const urlParam = typeof body.url === 'string' ? body.url : ''
      const title = String(body.title || 'Untitled')
      let sourceId = String(body.sourceId || '')
      let text = String(body.text || '')
      if (!text && urlParam) {
        try { text = await extractFromUrl(urlParam) } catch { return json({ error: 'Failed to fetch URL' }, 400) }
      }
      if (!text || text.trim().length < 20) return json({ error: 'text required' }, 400)
      if (!sourceId) {
        const src = await upsertSource({ title, mime: 'text/plain', bytes: text.length })
        sourceId = src.id
      }

      const chunks = chunkText(text)
      // Embed and insert
      const embeddings = await openai.embeddings.create({
        model: ENV.OPENAI_EMBED_MODEL,
        input: chunks.map(c => c.content),
      })
      const rows = chunks.map((c, i) => ({
        source_id: sourceId,
        chunk_index: c.index,
        content: c.content,
        embedding: embeddings.data[i].embedding as unknown as number[],
      }))
      await insertChunks(rows)
      return json({ sourceId, chunks: rows.length, title })
    }

    // Generate MCQs from a source (agentic RAG)
    if (req.method === 'POST' && pathname === '/api/mcqs') {
      const body = await req.json().catch(() => ({})) as any
      const sourceId = String(body.sourceId || '')
      const n = Number(body.n || 10)
      if (!sourceId) return json({ error: 'sourceId required' }, 400)
      const graph = buildMCQGraph()
      const res = await graph.invoke({ n, sourceId })
      return json({ cards: res.result || [] })
    }

    // Create deck and/or attach MCQs directly in Supabase
    if (req.method === 'POST' && pathname === '/api/decks') {
      const body = await req.json().catch(() => ({})) as any
      const title = String(body.title || 'Imported Deck')
      const sourceId = typeof body.sourceId === 'string' ? body.sourceId : ''
      const n = Number(body.n || 10)
      const deck = await createDeckRow(title)
      let cards: any[] = []
      if (sourceId) {
        const graph = buildMCQGraph()
        const res = await graph.invoke({ n, sourceId })
        cards = res.result || []
        if (cards.length) await insertDeckCards(deck.id, cards)
      }
      return json({ deckId: deck.id, title: deck.title, cardsAdded: cards.length })
    }

    if (req.method === 'POST' && pathname.startsWith('/api/decks/') && pathname.endsWith('/mcqs')) {
      const parts = pathname.split('/')
      const deckId = parts[3]
      const body = await req.json().catch(() => ({})) as any
      const sourceId = String(body.sourceId || '')
      const n = Number(body.n || 10)
      if (!deckId || !sourceId) return json({ error: 'deckId and sourceId required' }, 400)
      const graph = buildMCQGraph()
      const res = await graph.invoke({ n, sourceId })
      const cards = res.result || []
      if (cards.length) await insertDeckCards(deckId, cards)
      return json({ deckId, cardsAdded: cards.length })
    }

    return json({ error: 'Not found' }, 404)
  }
}

function json(data: any, status = 200) {
  return withCors(new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } }))
}

export default app

// Start server with Bun.serve when executed directly
if (import.meta.main) {
  Bun.serve({
    port: ENV.PORT,
    fetch: (req) => app.handler(req),
  })
  console.log(`Backend listening on http://localhost:${ENV.PORT}`)
}
