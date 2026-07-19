export const CURRENT_SCHEMA_VERSION = 1 as const

export type ISODate = string
export type ProjectStatus = 'active' | 'archived'
export type HistoryEventType =
  | 'project-created'
  | 'project-updated'
  | 'project-archived'
  | 'project-reactivated'
  | 'project-deleted'
  | 'progress-recorded'
  | 'next-action-set'
  | 'next-action-completed'
  | 'pending-created'
  | 'pending-completed'
  | 'decision-recorded'
  | 'blocker-created'
  | 'blocker-resolved'
  | 'milestone-created'
  | 'milestone-completed'

export interface EntityBase {
  id: string
  projectId: string
  createdAt: ISODate
  updatedAt: ISODate
}

export interface Project {
  id: string
  name: string
  currentSituation: string
  status: ProjectStatus
  createdAt: ISODate
  updatedAt: ISODate
}

export interface ProgressUpdate extends EntityBase { description: string; occurredOn: ISODate }
export interface NextAction extends EntityBase { description: string; completedAt: ISODate | null; replacedAt: ISODate | null }
export interface PendingItem extends EntityBase { description: string; completedAt: ISODate | null }
export interface Decision extends EntityBase { description: string; rationale: string | null; decidedOn: ISODate }
export interface Blocker extends EntityBase { description: string; resolvedAt: ISODate | null }
export interface Milestone extends EntityBase { description: string; dueOn: ISODate | null; completedAt: ISODate | null }
export interface HistoryEvent extends EntityBase { type: HistoryEventType; description: string; occurredOn: ISODate; itemId: string | null }
export interface WorkspaceSettings { lastExportedAt: ISODate | null }

export interface Workspace {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION
  settings: WorkspaceSettings
  projects: Project[]
  progressUpdates: ProgressUpdate[]
  nextActions: NextAction[]
  pendingItems: PendingItem[]
  decisions: Decision[]
  blockers: Blocker[]
  milestones: Milestone[]
  history: HistoryEvent[]
}

export interface CreateProjectInput { name: string; currentSituation: string }

export const now = (): ISODate => new Date().toISOString()

export const createId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const createEmptyWorkspace = (): Workspace => ({
  schemaVersion: CURRENT_SCHEMA_VERSION,
  settings: { lastExportedAt: null },
  projects: [],
  progressUpdates: [],
  nextActions: [],
  pendingItems: [],
  decisions: [],
  blockers: [],
  milestones: [],
  history: [],
})

const cleanRequiredText = (value: string, label: string): string => {
  const result = value.trim()
  if (!result) throw new Error(`${label} é obrigatório.`)
  return result
}

export const createProject = (workspace: Workspace, input: CreateProjectInput, at = now()): Workspace => {
  const project: Project = {
    id: createId(),
    name: cleanRequiredText(input.name, 'Nome do projeto'),
    currentSituation: cleanRequiredText(input.currentSituation, 'Situação atual'),
    status: 'active',
    createdAt: at,
    updatedAt: at,
  }
  const event = createHistoryEvent(project.id, 'project-created', `Projeto criado: ${project.name}`, null, at)
  return { ...workspace, projects: [...workspace.projects, project], history: [...workspace.history, event] }
}

export const updateProject = (workspace: Workspace, projectId: string, input: CreateProjectInput, at = now()): Workspace => {
  const current = findProject(workspace, projectId)
  const project: Project = { ...current, name: cleanRequiredText(input.name, 'Nome do projeto'), currentSituation: cleanRequiredText(input.currentSituation, 'Situação atual'), updatedAt: at }
  return replaceProject(workspace, project, createHistoryEvent(projectId, 'project-updated', `Projeto atualizado: ${project.name}`, null, at))
}

export const setProjectStatus = (workspace: Workspace, projectId: string, status: ProjectStatus, at = now()): Workspace => {
  const current = findProject(workspace, projectId)
  if (current.status === status) return workspace
  const project = { ...current, status, updatedAt: at }
  const type = status === 'archived' ? 'project-archived' : 'project-reactivated'
  const text = status === 'archived' ? `Projeto arquivado: ${project.name}` : `Projeto reativado: ${project.name}`
  return replaceProject(workspace, project, createHistoryEvent(projectId, type, text, null, at))
}

export const deleteProject = (workspace: Workspace, projectId: string, at = now()): Workspace => {
  const project = findProject(workspace, projectId)
  const withoutRelation = <T extends { projectId: string }>(items: T[]) => items.filter((item) => item.projectId !== projectId)
  const deletion = createHistoryEvent(projectId, 'project-deleted', `Projeto excluído: ${project.name}`, null, at)
  return {
    ...workspace,
    projects: workspace.projects.filter((item) => item.id !== projectId),
    progressUpdates: withoutRelation(workspace.progressUpdates),
    nextActions: withoutRelation(workspace.nextActions),
    pendingItems: withoutRelation(workspace.pendingItems),
    decisions: withoutRelation(workspace.decisions),
    blockers: withoutRelation(workspace.blockers),
    milestones: withoutRelation(workspace.milestones),
    history: [...withoutRelation(workspace.history), deletion],
  }
}

export const assertWorkspaceIntegrity = (workspace: Workspace): Workspace => {
  const projectIds = new Set(workspace.projects.map((project) => project.id))
  const ids = new Set<string>()
  const everyEntity = [
    ...workspace.projects,
    ...workspace.progressUpdates,
    ...workspace.nextActions,
    ...workspace.pendingItems,
    ...workspace.decisions,
    ...workspace.blockers,
    ...workspace.milestones,
    ...workspace.history,
  ]
  for (const entity of everyEntity) {
    if (!entity.id || ids.has(entity.id)) throw new Error('Há IDs ausentes ou duplicados no workspace.')
    ids.add(entity.id)
  }
  const projectBound = [
    ...workspace.progressUpdates,
    ...workspace.nextActions,
    ...workspace.pendingItems,
    ...workspace.decisions,
    ...workspace.blockers,
    ...workspace.milestones,
  ]
  if (projectBound.some((item) => !projectIds.has(item.projectId))) throw new Error('Há registros ligados a um projeto inexistente.')
  return workspace
}

const findProject = (workspace: Workspace, projectId: string): Project => {
  const project = workspace.projects.find((item) => item.id === projectId)
  if (!project) throw new Error('Projeto não encontrado.')
  return project
}

const createHistoryEvent = (projectId: string, type: HistoryEventType, description: string, itemId: string | null, at: ISODate): HistoryEvent => ({
  id: createId(), projectId, type, description, itemId, occurredOn: at, createdAt: at, updatedAt: at,
})

const replaceProject = (workspace: Workspace, project: Project, event: HistoryEvent): Workspace => ({
  ...workspace,
  projects: workspace.projects.map((item) => item.id === project.id ? project : item),
  history: [...workspace.history, event],
})
