export const SENTINEL_TIME_ZONE = 'America/Campo_Grande'
export const SENTINEL_SLOTS = ['22:30', '22:45', '23:00', '23:15', '23:30']
export const MAX_GEMINI_CALLS = 2

const secretPatterns = [
  /-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g,
  /\b(?:gh[pousr]_[A-Za-z0-9_]+|AIza[\w-]+|sk-[A-Za-z0-9_-]+)\b/g,
  /\b(?:Bearer|token|password|secret|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,
  /https?:\/\/[^\s)\]]+/gi,
]

const parsePositiveInteger = (value, name, fallback) => {
  const parsed = Number(value ?? fallback)
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error(`${name} deve ser um inteiro positivo.`)
  return parsed
}

export const loadAiPolicy = (environment = process.env) => {
  const geminiMaxCalls = parsePositiveInteger(environment.GEMINI_MAX_CALLS, 'GEMINI_MAX_CALLS', MAX_GEMINI_CALLS)
  if (geminiMaxCalls > MAX_GEMINI_CALLS) throw new Error(`GEMINI_MAX_CALLS não pode exceder ${MAX_GEMINI_CALLS}.`)
  return {
    gemini: {
      model: String(environment.GEMINI_MODEL ?? '').trim(),
      maxInputBytes: parsePositiveInteger(environment.GEMINI_MAX_INPUT_BYTES, 'GEMINI_MAX_INPUT_BYTES', 24_000),
      maxOutputTokens: parsePositiveInteger(environment.GEMINI_MAX_OUTPUT_TOKENS, 'GEMINI_MAX_OUTPUT_TOKENS', 1_000),
      maxCalls: geminiMaxCalls,
    },
    groq: {
      model: String(environment.GROQ_MODEL ?? '').trim(),
      maxInputBytes: parsePositiveInteger(environment.GROQ_MAX_INPUT_BYTES, 'GROQ_MAX_INPUT_BYTES', 16_000),
      maxOutputTokens: parsePositiveInteger(environment.GROQ_MAX_OUTPUT_TOKENS, 'GROQ_MAX_OUTPUT_TOKENS', 800),
    },
  }
}

export const redactForAi = (value) => secretPatterns.reduce((result, pattern) => result.replace(pattern, '[REDACTED]'), String(value ?? ''))

export const truncateUtf8 = (value, maximumBytes) => {
  const text = String(value ?? '')
  if (Buffer.byteLength(text, 'utf8') <= maximumBytes) return text
  let result = ''
  for (const character of text) {
    if (Buffer.byteLength(result + character, 'utf8') > maximumBytes) break
    result += character
  }
  return result
}

export const prepareAiInput = (value, maximumBytes) => truncateUtf8(redactForAi(value), maximumBytes)

export const hasReviewedSha = (sha, reviewedShas) => reviewedShas.includes(sha)
export const shouldRunReview = ({ sha, reviewedShas, time }) => Boolean(sha) && !hasReviewedSha(sha, reviewedShas) && SENTINEL_SLOTS.includes(time)

export const chooseAiProvider = ({ signal, geminiCalls, policy, geminiAvailable = true, groqAvailable = true, secondOpinion = false }) => {
  const escalation = signal === 'attention' || signal === 'blocked'
  if (secondOpinion && escalation && groqAvailable && policy.groq.model) return { provider: 'groq', reason: 'second_opinion' }
  if (geminiAvailable && policy.gemini.model && geminiCalls < policy.gemini.maxCalls) return { provider: 'gemini', reason: 'primary' }
  if (groqAvailable && policy.groq.model) return { provider: 'groq', reason: 'fallback' }
  return null
}
