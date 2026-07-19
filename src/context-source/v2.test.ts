import { describe, expect, it, vi } from 'vitest'
import { CONTEXT_CACHE_KEY_V2, loadContextV2, toLegacySnapshot } from './v2'

const bundle = { schemaVersion: 2, generatedAt: '2026-07-19T00:00:00.000Z', source: { repository: 'TeoZ08/teo-contexto', ref: 'main', commit: 'abc' }, manifest: { datasets: { projects: { path: '/v1/projects.json', sha256: 'a' }, daily: { path: '/v1/daily.json', sha256: 'a' }, reviews: { path: '/v1/reviews.json', sha256: 'a' }, pipeline: { path: '/v1/pipeline.json', sha256: 'a' }, quality: { path: '/v1/quality.json', sha256: 'a' } } }, projects: { projects: [{ id: 'useart', recordType: 'project', parentId: null, name: 'useART', aliases: [], status: 'planned', stage: 'mvp', priority: 'high', summary: null, currentSituation: null, nextAction: null, blocker: null, repositories: [], tags: [], reviewedAt: null, nextReviewAt: null, source: { path: 'projetos/useart.md', commit: 'abc' } }] }, daily: { daily: [] }, reviews: { reviews: [] }, pipeline: { pipeline: {} }, quality: { warnings: [] } }

describe('loadContextV2', () => {
  it('uses the cache when the VPS is unavailable', async () => {
    const storage = new Map<string, string>([[CONTEXT_CACHE_KEY_V2, JSON.stringify(bundle)]])
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await expect(loadContextV2({ getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }, { timeoutMs: 1 })).resolves.toMatchObject({ origin: 'cache' })
  })

  it('adapts the public v2 contract without exposing raw source markdown', () => {
    const snapshot = toLegacySnapshot(bundle as never)
    expect(snapshot.projects[0]).toMatchObject({ id: 'useart', name: 'useART', officialStatus: 'unclassified' })
    expect(snapshot.projects[0].source.url).toBeNull()
  })
})
