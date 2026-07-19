import type { ContextProject, TeoContextSnapshot } from './types'

export const CONTEXT_API_ORIGIN = 'https://contexto.matteolima.com.br'
export const CONTEXT_CACHE_KEY_V2 = 'teo-painel.context-v2'

export interface ContextSource { repository: 'TeoZ08/teo-contexto'; ref: 'main'; commit: string }
export interface ContextProjectV2 { id: string; recordType: 'project' | 'subproject' | 'artifact' | 'initiative' | 'legacy'; parentId: string | null; name: string; aliases: string[]; status: 'planned' | 'active' | 'paused' | 'blocked' | 'completed' | 'archived'; stage: string; priority: 'low' | 'medium' | 'high' | null; summary: string | null; currentSituation: string | null; nextAction: string | null; blocker: string | null; repositories: Array<{ name: string; role: string | null; trackActivity: boolean | null }>; tags: string[]; reviewedAt: string | null; nextReviewAt: string | null; source: { path: string; commit: string } }
export interface ContextBundleV2 { schemaVersion: 2; generatedAt: string; source: ContextSource; manifest: { datasets: Record<string, { path: string; sha256: string }> }; projects: { projects: ContextProjectV2[] }; daily: { daily: unknown[] }; reviews: { reviews: unknown[] }; pipeline: { pipeline: unknown }; quality: { warnings: unknown[] } }
export interface LoadedContextV2 { bundle: ContextBundleV2; origin: 'vps' | 'cache' | 'fallback' }

export const isContextBundleV2 = (value: unknown): value is ContextBundleV2 => {
  if (!value || typeof value !== 'object') return false
  const bundle = value as Partial<ContextBundleV2>
  const expectedDatasets = ['projects', 'daily', 'reviews', 'pipeline', 'quality']
  return bundle.schemaVersion === 2 && typeof bundle.generatedAt === 'string' && bundle.source?.repository === 'TeoZ08/teo-contexto' && bundle.source.ref === 'main' && typeof bundle.source.commit === 'string' && expectedDatasets.every((name) => bundle.manifest?.datasets?.[name]?.path === `/v1/${name}.json` && typeof bundle.manifest.datasets[name].sha256 === 'string') && Array.isArray(bundle.projects?.projects) && bundle.projects.projects.every((project) => typeof project.id === 'string' && typeof project.name === 'string')
}

const fetchJson = async (url: string, signal: AbortSignal): Promise<unknown> => {
  const response = await fetch(url, { headers: { accept: 'application/json' }, signal })
  if (!response.ok) throw new Error(`Contexto indisponível (${response.status}).`)
  return response.json()
}

export const loadContextV2 = async (storage: Pick<Storage, 'getItem' | 'setItem'>, options: { origin?: string; timeoutMs?: number } = {}): Promise<LoadedContextV2> => {
  const origin = options.origin ?? CONTEXT_API_ORIGIN
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 4_000)
  try {
    const manifest = await fetchJson(`${origin}/v1/manifest.json`, controller.signal) as ContextBundleV2['manifest'] & Pick<ContextBundleV2, 'schemaVersion' | 'generatedAt' | 'source'>
    const entries = await Promise.all(['projects', 'daily', 'reviews', 'pipeline', 'quality'].map(async (name) => [name, await fetchJson(`${origin}${manifest.datasets[name].path}`, controller.signal)] as const))
    const bundle = { schemaVersion: manifest.schemaVersion, generatedAt: manifest.generatedAt, source: manifest.source, manifest, ...Object.fromEntries(entries) } as unknown as ContextBundleV2
    if (!isContextBundleV2(bundle)) throw new Error('Contexto remoto inválido.')
    storage.setItem(CONTEXT_CACHE_KEY_V2, JSON.stringify(bundle))
    return { bundle, origin: 'vps' }
  } catch {
    const cached = storage.getItem(CONTEXT_CACHE_KEY_V2)
    if (cached) { const value: unknown = JSON.parse(cached); if (isContextBundleV2(value)) return { bundle: value, origin: 'cache' } }
    const fallback: unknown = await fetchJson('/teo-painel/fallback.bundle.json', new AbortController().signal)
    if (!isContextBundleV2(fallback)) throw new Error('Não há contexto validado disponível.')
    return { bundle: fallback, origin: 'fallback' }
  } finally { window.clearTimeout(timer) }
}

export const toLegacySnapshot = (bundle: ContextBundleV2): TeoContextSnapshot => ({
  schemaVersion: 1,
  generatedAt: bundle.generatedAt,
  source: bundle.source,
  projects: bundle.projects.projects.map((project): ContextProject => ({
    id: project.id,
    name: project.name,
    aliases: project.aliases,
    summary: project.summary ?? 'Sem resumo registrado.',
    currentSituation: project.currentSituation ?? 'Sem situação atual registrada.',
    officialStatus: project.status === 'planned' ? 'unclassified' : project.status,
    stage: project.stage === 'not_applicable' ? null : project.stage,
    priority: project.priority,
    canonicalNextAction: project.nextAction,
    canonicalBlocker: project.blocker,
    tags: project.tags,
    repositories: project.repositories,
    reviewedAt: project.reviewedAt,
    nextReviewAt: project.nextReviewAt,
    recentActivity: [],
    decisions: [],
    source: { path: project.source.path, url: null, updatedAt: null },
  })),
  unmappedMentions: [],
  warnings: bundle.quality.warnings.filter((warning): warning is { path: string; message: string } => Boolean(warning && typeof warning === 'object' && typeof (warning as { path?: unknown }).path === 'string' && typeof (warning as { message?: unknown }).message === 'string')),
})
