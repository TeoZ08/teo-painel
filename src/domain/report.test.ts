import { describe, expect, it } from 'vitest'
import { addBlocker, addDecision, addMilestone, addPendingItem, addProgressUpdate, completeMilestone, createEmptyWorkspace, createProject, setNextAction } from './workspace'
import { buildProjectReport, projectReportToMarkdown } from './report'

describe('project reports', () => {
  it('uses only project records in chronological report sections', () => {
    let workspace = createProject(createEmptyWorkspace(), { name: 'Relatório', currentSituation: 'Preparação' }, '2026-07-01T08:00:00.000Z')
    const id = workspace.projects[0].id
    workspace = addProgressUpdate(workspace, id, { description: 'Primeiro avanço', occurredOn: '2026-07-02T08:00:00.000Z' })
    workspace = addProgressUpdate(workspace, id, { description: 'Último avanço', occurredOn: '2026-07-03T08:00:00.000Z' })
    workspace = addDecision(workspace, id, { description: 'Manter escopo', rationale: 'Tempo disponível', decidedOn: '2026-07-03T08:00:00.000Z' })
    workspace = addBlocker(workspace, id, { description: 'Aguardando retorno' })
    workspace = addPendingItem(workspace, id, { description: 'Revisar conteúdo' })
    workspace = setNextAction(workspace, id, { description: 'Enviar resumo' })
    workspace = addMilestone(workspace, id, { description: 'Publicação' })
    workspace = completeMilestone(workspace, workspace.milestones[0].id, '2026-07-03T10:00:00.000Z')
    const report = buildProjectReport(workspace, id, { from: '2026-07-02', to: '2026-07-03' }, '2026-07-04T09:00:00.000Z')
    expect(report.progressUpdates.map((item) => item.description)).toEqual(['Último avanço', 'Primeiro avanço'])
    expect(projectReportToMarkdown(report)).toContain('Manter escopo — Tempo disponível')
    expect(projectReportToMarkdown(report)).toContain('1. Enviar resumo')
    expect(projectReportToMarkdown(report)).not.toContain(workspace.projects[0].id)
  })

  it('returns explicit empty sections when there are no records', () => {
    const workspace = createProject(createEmptyWorkspace(), { name: 'Vazio', currentSituation: 'Aguardando' })
    const markdown = projectReportToMarkdown(buildProjectReport(workspace, workspace.projects[0].id))
    expect(markdown.match(/Nenhum registro no período/g)).toHaveLength(6)
  })
})
