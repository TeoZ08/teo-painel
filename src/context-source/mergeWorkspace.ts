import type { Workspace } from '../domain/workspace'
import type { ContextProject, TeoContextSnapshot } from './types'

export const contextProjectKey = (project: ContextProject): string => `context:TeoZ08/teo-contexto:${project.id}`

export const mergeSnapshotIntoWorkspace = (workspace: Workspace, snapshot: TeoContextSnapshot): Workspace => {
  const projects = [...workspace.projects]
  for (const contextProject of snapshot.projects) {
    const id = contextProjectKey(contextProject)
    if (projects.some((project) => project.id === id)) continue
    projects.push({ id, name: contextProject.name, currentSituation: contextProject.currentSituation, status: contextProject.officialStatus === 'archived' ? 'archived' : 'active', createdAt: snapshot.generatedAt, updatedAt: snapshot.generatedAt })
  }
  return { ...workspace, projects }
}

export const contextForLocalProject = (snapshot: TeoContextSnapshot | null, projectId: string): ContextProject | null => snapshot?.projects.find((project) => contextProjectKey(project) === projectId) ?? null
