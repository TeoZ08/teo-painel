import { describe, expect, it } from 'vitest'
import { changesetAsMarkdown } from './changeset'
import { createEmptyWorkspace } from '../domain/workspace'
import type { TeoContextSnapshot } from './types'

describe('changesetAsMarkdown', () => {
  it('exports only local operational records for review', () => {
    const workspace = createEmptyWorkspace()
    workspace.projects.push({ id: 'local', name: 'Local', currentSituation: 'Em curso', status: 'active', createdAt: '2026-01-01', updatedAt: '2026-01-01' })
    workspace.nextActions.push({ id: 'action', projectId: 'local', description: 'Validar entrega', completedAt: null, replacedAt: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' })
    expect(changesetAsMarkdown(workspace, null)).toContain('Próxima ação: Validar entrega')
  })

  it('includes local updates made to a project that originated in the snapshot', () => {
    const workspace = createEmptyWorkspace()
    workspace.projects.push({ id: 'context:TeoZ08/teo-contexto:useart', name: 'useART', currentSituation: 'Em curso', status: 'active', createdAt: '2026-01-01', updatedAt: '2026-01-01' })
    workspace.progressUpdates.push({ id: 'update', projectId: 'context:TeoZ08/teo-contexto:useart', description: 'Checkout validado', occurredOn: '2026-01-01', createdAt: '2026-01-01', updatedAt: '2026-01-01' })
    const snapshot = { schemaVersion: 1, generatedAt: '2026-01-01', source: { repository: 'TeoZ08/teo-contexto', ref: 'main', commit: 'abc' }, projects: [{ id: 'useart' }] } as TeoContextSnapshot
    expect(changesetAsMarkdown(workspace, snapshot)).toContain('Avanço: Checkout validado')
  })
})
