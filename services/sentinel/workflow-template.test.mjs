import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const template = JSON.parse(readFileSync(resolve(process.cwd(), 'services/sentinel/workflow-template.json'), 'utf8'))
const node = (name) => template.nodes.find((item) => item.name === name)

describe('template sanitizado do workflow da Sentinela', () => {
  it('fica desativado até a revisão humana e abre somente a janela aprovada', () => {
    expect(template.active).toBe(false)
    expect(template.settings.timezone).toBe('America/Campo_Grande')
    expect(node('Iniciar às 22:30').parameters.rule.interval[0].expression).toBe('30 22 * * *')
    expect(node('Abrir janela idempotente').parameters.jsCode).toContain("['22:30', '22:45', '23:00', '23:15', '23:30']")
    expect(node('Aguardar 15 minutos').parameters).toMatchObject({ amount: 15, unit: 'minutes' })
  })

  it('usa a marca de SHA no comentário e não contém ação de merge ou escrita de shell', () => {
    const source = JSON.stringify(template)
    expect(source).toContain('<!-- sentinela-noturna:v1:head=${$json.candidate.head} -->')
    expect(source).toContain('Checar SHA revisado')
    expect(source).not.toMatch(/executeCommand|ssh|dockerSocket|merge pull request/i)
    expect(template.nodes.map((item) => item.type)).not.toContain('n8n-nodes-base.executeCommand')
  })

  it('mantém refresh interno e credenciais separadas por referência', () => {
    const refresh = node('Atualizar contexto interno')
    expect(refresh.parameters.url).toBe('http://context-materializer:8080/internal/refresh')
    expect(refresh.credentials.httpHeaderAuth.name).toBe('Sentinela refresh interno')
    expect(node('Buscar PR diário').credentials.httpHeaderAuth.name).toBe('Sentinela GitHub')
    expect(node('Gemini — revisão principal').credentials.httpQueryAuth.name).toBe('Sentinela Gemini')
    expect(node('Groq — segunda opinião').credentials.httpHeaderAuth.name).toBe('Sentinela Groq')
  })

  it('limita Gemini a uma rota principal e usa Groq apenas após atenção ou bloqueio', () => {
    const source = JSON.stringify(template)
    expect(template.nodes.filter((item) => item.name.includes('Gemini')).length).toBe(2)
    expect(template.nodes.filter((item) => item.name === 'Gemini — revisão principal')).toHaveLength(1)
    expect(node('Groq é necessário?').parameters.conditions.conditions[0].leftValue).toContain("['attention', 'blocked']")
    expect(source).toContain('maxOutputTokens')
    expect(source).toContain('SENTINEL_GROQ_MAX_INPUT_BYTES')
  })
})
