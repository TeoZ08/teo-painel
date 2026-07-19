import { describe, expect, it } from 'vitest'
import { createEmptyWorkspace, createProject } from '../domain/workspace'
import { mergeSnapshotIntoWorkspace } from './mergeWorkspace'
import type { TeoContextSnapshot } from './types'

const snapshot: TeoContextSnapshot = { schemaVersion: 1, generatedAt: '2026-07-19T10:00:00.000Z', source: { repository: 'TeoZ08/teo-contexto', ref: 'main', commit: 'abc' }, projects: [{ id: 'useart', name: 'useART', aliases: [], summary: 'Loja', currentSituation: 'Ativo', officialStatus: 'active', stage: null, priority: null, canonicalNextAction: 'Revisar', canonicalBlocker: null, tags: [], repositories: [], reviewedAt: null, nextReviewAt: null, recentActivity: [], decisions: [], source: { path: 'projetos/useart.md', url: null, updatedAt: null } }], unmappedMentions: [], warnings: [] }

describe('context workspace merge', () => {
  it('adds source projects only once and keeps local records', () => {
    const local = createProject(createEmptyWorkspace(), { name: 'Local', currentSituation: 'Em andamento' })
    const first = mergeSnapshotIntoWorkspace(local, snapshot)
    const second = mergeSnapshotIntoWorkspace(first, snapshot)
    expect(first.projects).toHaveLength(2)
    expect(second.projects).toHaveLength(2)
    expect(second.projects.find((project) => project.name === 'Local')).toBeTruthy()
  })
})
