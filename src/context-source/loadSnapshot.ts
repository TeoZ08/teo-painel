import type { TeoContextSnapshot } from './types'

export const CONTEXT_CACHE_KEY = 'teo-painel.context-snapshot'

export const isSnapshot = (value: unknown): value is TeoContextSnapshot => {
  if (!value || typeof value !== 'object') return false
  const snapshot = value as Partial<TeoContextSnapshot>
  return snapshot.schemaVersion === 1 && typeof snapshot.generatedAt === 'string' && !!snapshot.source && Array.isArray(snapshot.projects) && snapshot.projects.every((project) => typeof project.id === 'string' && typeof project.name === 'string')
}

export const loadContextSnapshot = async (): Promise<{ snapshot: TeoContextSnapshot; cached: boolean }> => {
  const url = '/teo-painel/data/teo-contexto.snapshot.json'
  try {
    const response = await fetch(url, { cache: 'no-cache' })
    if (!response.ok) throw new Error('Snapshot indisponível.')
    const data: unknown = await response.json()
    if (!isSnapshot(data)) throw new Error('Snapshot inválido.')
    window.localStorage.setItem(CONTEXT_CACHE_KEY, JSON.stringify(data))
    return { snapshot: data, cached: false }
  } catch {
    const raw = window.localStorage.getItem(CONTEXT_CACHE_KEY)
    if (!raw) throw new Error('Não há cópia local do contexto.')
    const data: unknown = JSON.parse(raw)
    if (!isSnapshot(data)) throw new Error('A cópia local do contexto é inválida.')
    return { snapshot: data, cached: true }
  }
}
