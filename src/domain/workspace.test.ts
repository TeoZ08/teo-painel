import { describe, expect, it } from 'vitest'
import {
  addBlocker, addDecision, addMilestone, addPendingItem, addProgressUpdate, assertWorkspaceIntegrity, completeMilestone, completeNextAction, completePendingItem, createEmptyWorkspace, createProject, deleteProject, resolveBlocker, setNextAction, setProjectStatus, updateBlocker, updateNextAction, updatePendingItem, updateProgressUpdate, updateProject,
} from './workspace'

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

  it('handles project archive and all work-item flows with history', () => {
    const created = createProject(createEmptyWorkspace(), { name: 'Fluxos', currentSituation: 'Em preparação' }, '2026-07-18T12:00:00.000Z')
    const projectId = created.projects[0].id
    const archived = setProjectStatus(created, projectId, 'archived', '2026-07-18T12:01:00.000Z')
    expect(archived.projects[0].status).toBe('archived')
    let workspace = setProjectStatus(archived, projectId, 'active', '2026-07-18T12:02:00.000Z')
    workspace = addProgressUpdate(workspace, projectId, { description: 'Catálogo pronto', occurredOn: '2026-07-18' })
    workspace = updateProgressUpdate(workspace, workspace.progressUpdates[0].id, { description: 'Catálogo revisado' })
    workspace = setNextAction(workspace, projectId, { description: 'Revisar conteúdo' })
    workspace = updateNextAction(workspace, workspace.nextActions[0].id, { description: 'Revisar conteúdo final' })
    workspace = completeNextAction(workspace, workspace.nextActions[0].id)
    workspace = addPendingItem(workspace, projectId, { description: 'Validar imagens' })
    workspace = updatePendingItem(workspace, workspace.pendingItems[0].id, { description: 'Validar imagens finais' })
    workspace = completePendingItem(workspace, workspace.pendingItems[0].id)
    workspace = addDecision(workspace, projectId, { description: 'Manter o layout', rationale: 'Menor risco' })
    workspace = addBlocker(workspace, projectId, { description: 'Aguardando acesso' })
    workspace = updateBlocker(workspace, workspace.blockers[0].id, { description: 'Aguardando acesso final' })
    workspace = resolveBlocker(workspace, workspace.blockers[0].id)
    workspace = addMilestone(workspace, projectId, { description: 'Publicar', dueOn: '2026-07-22' })
    workspace = completeMilestone(workspace, workspace.milestones[0].id)
    expect(workspace.progressUpdates[0].description).toBe('Catálogo revisado')
    expect(workspace.nextActions[0].completedAt).not.toBeNull()
    expect(workspace.pendingItems[0].completedAt).not.toBeNull()
    expect(workspace.decisions[0].rationale).toBe('Menor risco')
    expect(workspace.blockers[0].resolvedAt).not.toBeNull()
    expect(workspace.milestones[0].completedAt).not.toBeNull()
    expect(workspace.history.map((event) => event.type)).toEqual(expect.arrayContaining(['progress-recorded', 'next-action-completed', 'pending-completed', 'decision-recorded', 'blocker-resolved', 'milestone-completed']))
  })
})
