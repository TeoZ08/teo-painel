import { describe, expect, it } from 'vitest'
import { MAX_GEMINI_CALLS, chooseAiProvider, loadAiPolicy, prepareAiInput, shouldRunReview, truncateUtf8 } from './policy.mjs'

const environment = { GEMINI_MODEL: 'gemini-test', GEMINI_MAX_INPUT_BYTES: '12', GEMINI_MAX_OUTPUT_TOKENS: '50', GEMINI_MAX_CALLS: '2', GROQ_MODEL: 'groq-test', GROQ_MAX_INPUT_BYTES: '12', GROQ_MAX_OUTPUT_TOKENS: '50' }

describe('política da Sentinela', () => {
  it('aceita apenas a janela idempotente da mesma execução', () => {
    expect(shouldRunReview({ sha: 'abc', reviewedShas: [], time: '22:30' })).toBe(true)
    expect(shouldRunReview({ sha: 'abc', reviewedShas: ['abc'], time: '22:45' })).toBe(false)
    expect(shouldRunReview({ sha: 'abc', reviewedShas: [], time: '23:45' })).toBe(false)
  })

  it('redige segredos e URLs antes de limitar bytes', () => {
    expect(prepareAiInput('token=abc https://privado.test/a', 200)).toBe('[REDACTED] [REDACTED]')
    expect(Buffer.byteLength(truncateUtf8('ação longa', 5), 'utf8')).toBeLessThanOrEqual(5)
  })

  it('impõe no máximo duas chamadas Gemini', () => {
    expect(() => loadAiPolicy({ ...environment, GEMINI_MAX_CALLS: String(MAX_GEMINI_CALLS + 1) })).toThrow('não pode exceder')
  })

  it('usa Groq apenas como segunda opinião ou fallback', () => {
    const policy = loadAiPolicy(environment)
    expect(chooseAiProvider({ signal: 'ok', geminiCalls: 0, policy })).toMatchObject({ provider: 'gemini', reason: 'primary' })
    expect(chooseAiProvider({ signal: 'attention', geminiCalls: 1, policy, secondOpinion: true })).toMatchObject({ provider: 'groq', reason: 'second_opinion' })
    expect(chooseAiProvider({ signal: 'ok', geminiCalls: 2, policy })).toMatchObject({ provider: 'groq', reason: 'fallback' })
  })
})
