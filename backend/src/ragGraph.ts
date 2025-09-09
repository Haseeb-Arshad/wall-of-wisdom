import { z } from 'zod'
import OpenAI from 'openai'
import { ENV } from './env'
import { matchChunks } from './supabase'
import { StateGraph, START, END } from '@langchain/langgraph'

const MCQ = z.object({
  front: z.string(),
  back: z.string(),
  hint: z.string().optional(),
  difficulty: z.enum(['again', 'hard', 'good', 'easy']).default('good'),
})
export type MCQ = z.infer<typeof MCQ>

export const MCQList = z.object({
  cards: z.array(MCQ).min(1),
})

type Ctx = {
  n: number
  sourceId?: string
  query?: string
  context?: string
  result?: MCQ[]
}

const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY })

async function retrieveNode(state: Ctx): Promise<Ctx> {
  const q = state.query || 'Generate high-quality MCQs from the document.'
  const embed = await openai.embeddings.create({
    model: ENV.OPENAI_EMBED_MODEL,
    input: q,
  })
  const vec = embed.data[0].embedding
  const matches = await matchChunks(vec, { sourceId: state.sourceId, limit: 12 })
  const context = matches.map(m => m.content).join('\n\n')
  return { ...state, context }
}

async function generateNode(state: Ctx): Promise<Ctx> {
  const sys = `You create multiple-choice flashcards (MCQs). Given context, return JSON with key "cards": array of {front, back, hint, difficulty(one of again|hard|good|easy)}. Keep answers concise; ensure back is the correct answer.`
  const usr = `Context:\n\n${(state.context||'').slice(0, 12000)}\n\nMake ${state.n} MCQs.`
  const chat = await openai.chat.completions.create({
    model: ENV.OPENAI_MODEL,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: usr },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 900,
  } as any)
  const txt = chat.choices?.[0]?.message?.content || '{}'
  let parsed: any
  try { parsed = JSON.parse(txt) } catch { parsed = { cards: [] } }
  const result = MCQList.safeParse(parsed)
  if (!result.success) {
    return { ...state, result: [] }
  }
  return { ...state, result: result.data.cards.slice(0, state.n) }
}

export function buildMCQGraph() {
  const graph = new StateGraph<Ctx>({ channels: {} })
  graph.addNode('retrieve', retrieveNode)
  graph.addNode('generate', generateNode)
  graph.addEdge(START, 'retrieve')
  graph.addEdge('retrieve', 'generate')
  graph.addEdge('generate', END)
  return graph.compile()
}

