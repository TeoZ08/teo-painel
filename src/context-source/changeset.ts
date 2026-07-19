import type { Workspace } from '../domain/workspace'
import type { TeoContextSnapshot } from './types'

export interface ChangesetItem { projectId: string; projectName: string; entries: string[] }

/** Produces a reviewable operational summary. The static source is never rewritten. */
export const buildChangeset = (workspace: Workspace, snapshot: TeoContextSnapshot | null): ChangesetItem[] => {
  // Keep the parameter explicit: callers pass the current context, but local
  // operational records must be proposed for both local and source projects.
  void snapshot
  return workspace.projects
  .map((project) => {
    const entries = [
      ...workspace.progressUpdates.filter((item) => item.projectId === project.id).map((item) => `Avanço: ${item.description}`),
      ...workspace.nextActions.filter((item) => item.projectId === project.id && !item.completedAt && !item.replacedAt).map((item) => `Próxima ação: ${item.description}`),
      ...workspace.pendingItems.filter((item) => item.projectId === project.id && !item.completedAt).map((item) => `Pendência: ${item.description}`),
      ...workspace.blockers.filter((item) => item.projectId === project.id && !item.resolvedAt).map((item) => `Bloqueio: ${item.description}`),
    ]
    return { projectId: project.id, projectName: project.name, entries }
  })
    .filter((item) => item.entries.length > 0)
}

export const changesetAsMarkdown = (workspace: Workspace, snapshot: TeoContextSnapshot | null): string => {
  const sections = buildChangeset(workspace, snapshot)
  return ['# Atualizações operacionais do teo-painel', '', ...sections.flatMap((item) => [`## ${item.projectName}`, ...item.entries.map((entry) => `- ${entry}`), ''])].join('\n').trimEnd() + '\n'
}
