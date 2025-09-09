import 'dotenv/config'

export const ENV = {
  PORT: Number(process.env.PORT || 8787),
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-5-nano',
  OPENAI_EMBED_MODEL: process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small',
}

export function assertEnv() {
  const missing: string[] = []
  if (!ENV.SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!ENV.SUPABASE_SERVICE_ROLE) missing.push('SUPABASE_SERVICE_ROLE')
  if (!ENV.OPENAI_API_KEY) missing.push('OPENAI_API_KEY')
  if (missing.length) {
    throw new Error(`Missing env: ${missing.join(', ')}`)
  }
}

