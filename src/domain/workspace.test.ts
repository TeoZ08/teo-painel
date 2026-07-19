import { describe, expect, it } from 'vitest'
import { assertWorkspaceIntegrity, createEmptyWorkspace, createProject, deleteProject, updateProject } from './workspace'

describe('workspace domain', () => {
  it('creates a project and records the creation', () => {
    const workspace = createProject(createEmptyWorkspace(), { name: 'teo-painel', currentSituation: 'Base técnica' }, '2026-07-18T12:00:00.000Z')
    expect(workspace.projects).toHaveLength(1)
    expect(workspace.projects[0]).toMatchObject({ name: 'teo-painel', status: 'active' })
    expect(workspace.history[0].type).toBe('project-created')
  })

  it('edits a project and keeps its ID', () => {
    const created = createProject(createEmptyWorkspace(), { name: 'Antes', currentSituation: 'Primeira versão' })
    const edited = updateProject(created, created.projects[0].id, { name: 'Depois', currentSituation: 'Atualizado' })
    expect(edited.projects[0]).toMatchObject({ id: created.projects[0].id, name: 'Depois', currentSituation: 'Atualizado' })
    expect(edited.history.at(-1)?.type).toBe('project-updated')
  })

  it('removes project records together and retains a deletion event', () => {
    const created = createProject(createEmptyWorkspace(), { name: 'Projeto', currentSituation: 'Em curso' })
    const projectId = created.projects[0].id
    const withRelated = { ...created, progressUpdates: [{ id: 'progress-1', projectId, description: 'Feito', occurredOn: '2026-07-18', createdAt: '2026-07-18', updatedAt: '2026-07-18' }] }
    const result = deleteProject(withRelated, projectId)
    expect(result.projects).toHaveLength(0)
    expect(result.progressUpdates).toHaveLength(0)
    expect(result.history.at(-1)?.type).toBe('project-deleted')
  })

  it('rejects relationships to nonexistent projects', () => {
    const workspace = { ...createEmptyWorkspace(), pendingItems: [{ id: 'pending-1', projectId: 'missing', description: 'Ação', completedAt: null, createdAt: '2026-07-18', updatedAt: '2026-07-18' }] }
    expect(() => assertWorkspaceIntegrity(workspace)).toThrow('projeto inexistente')
  })
})
