import type { BunFile } from 'bun'
// Import the internal lib to avoid the debug harness in pdf-parse/index.js on Bun
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'

export async function extractTextFromUpload(file: File): Promise<{ text: string; mime: string; bytes: number }>
{
  const mime = file.type || 'application/octet-stream'
  const bytes = file.size
  const ab = await file.arrayBuffer()
  const buf = Buffer.from(ab)

  if (mime === 'application/pdf') {
    const out = await pdfParse(buf)
    return { text: out.text || '', mime, bytes }
  }
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const out = await mammoth.extractRawText({ buffer: buf })
    return { text: out.value || '', mime, bytes }
  }
  if (mime.startsWith('text/')) {
    return { text: buf.toString('utf8'), mime, bytes }
  }
  // Fallback best effort
  return { text: buf.toString('utf8'), mime, bytes }
}

export function chunkText(text: string, maxChars = 1200, overlap = 100): { index: number; content: string }[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  const chunks: { index: number; content: string }[] = []
  let start = 0
  let i = 0
  while (start < clean.length && i < 2000) {
    const end = Math.min(clean.length, start + maxChars)
    const part = clean.slice(start, end)
    chunks.push({ index: chunks.length, content: part })
    if (end === clean.length) break
    start = end - overlap
    i++
  }
  return chunks
}
