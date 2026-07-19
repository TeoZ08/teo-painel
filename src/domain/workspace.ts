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
export interface TextEntryInput { description: string }
export interface DatedTextEntryInput extends TextEntryInput { occurredOn?: ISODate }
export interface DecisionInput extends TextEntryInput { rationale?: string; decidedOn?: ISODate }
export interface MilestoneInput extends TextEntryInput { dueOn?: ISODate | null }

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

export const addProgressUpdate = (workspace: Workspace, projectId: string, input: DatedTextEntryInput, at = now()): Workspace => {
  requireProject(workspace, projectId)
  const description = cleanRequiredText(input.description, 'Descrição do avanço')
  const item: ProgressUpdate = { id: createId(), projectId, description, occurredOn: input.occurredOn ?? at, createdAt: at, updatedAt: at }
  return addItem(workspace, 'progressUpdates', item, createHistoryEvent(projectId, 'progress-recorded', `Avanço registrado: ${description}`, item.id, at))
}

export const updateProgressUpdate = (workspace: Workspace, itemId: string, input: DatedTextEntryInput, at = now()): Workspace => {
  const item = findItem(workspace.progressUpdates, itemId, 'Avanço')
  return { ...workspace, progressUpdates: replaceById(workspace.progressUpdates, { ...item, description: cleanRequiredText(input.description, 'Descrição do avanço'), occurredOn: input.occurredOn ?? item.occurredOn, updatedAt: at }) }
}

export const setNextAction = (workspace: Workspace, projectId: string, input: TextEntryInput, at = now()): Workspace => {
  requireProject(workspace, projectId)
  const description = cleanRequiredText(input.description, 'Próxima ação')
  const item: NextAction = { id: createId(), projectId, description, completedAt: null, replacedAt: null, createdAt: at, updatedAt: at }
  const nextActions = workspace.nextActions.map((action) => action.projectId === projectId && !action.completedAt && !action.replacedAt ? { ...action, replacedAt: at, updatedAt: at } : action)
  return { ...workspace, nextActions: [...nextActions, item], history: [...workspace.history, createHistoryEvent(projectId, 'next-action-set', `Próxima ação definida: ${description}`, item.id, at)] }
}

export const updateNextAction = (workspace: Workspace, itemId: string, input: TextEntryInput, at = now()): Workspace => {
  const item = findItem(workspace.nextActions, itemId, 'Próxima ação')
  if (item.completedAt || item.replacedAt) throw new Error('Só é possível editar a próxima ação atual.')
  return { ...workspace, nextActions: replaceById(workspace.nextActions, { ...item, description: cleanRequiredText(input.description, 'Próxima ação'), updatedAt: at }) }
}

export const completeNextAction = (workspace: Workspace, itemId: string, at = now()): Workspace => {
  const item = findItem(workspace.nextActions, itemId, 'Próxima ação')
  if (item.completedAt) return workspace
  const completed = { ...item, completedAt: at, updatedAt: at }
  return { ...workspace, nextActions: replaceById(workspace.nextActions, completed), history: [...workspace.history, createHistoryEvent(item.projectId, 'next-action-completed', `Próxima ação concluída: ${item.description}`, item.id, at)] }
}

export const addPendingItem = (workspace: Workspace, projectId: string, input: TextEntryInput, at = now()): Workspace => {
  requireProject(workspace, projectId)
  const description = cleanRequiredText(input.description, 'Pendência')
  const item: PendingItem = { id: createId(), projectId, description, completedAt: null, createdAt: at, updatedAt: at }
  return addItem(workspace, 'pendingItems', item, createHistoryEvent(projectId, 'pending-created', `Pendência registrada: ${description}`, item.id, at))
}

export const updatePendingItem = (workspace: Workspace, itemId: string, input: TextEntryInput, at = now()): Workspace => {
  const item = findItem(workspace.pendingItems, itemId, 'Pendência')
  return { ...workspace, pendingItems: replaceById(workspace.pendingItems, { ...item, description: cleanRequiredText(input.description, 'Pendência'), updatedAt: at }) }
}

export const completePendingItem = (workspace: Workspace, itemId: string, at = now()): Workspace => {
  const item = findItem(workspace.pendingItems, itemId, 'Pendência')
  if (item.completedAt) return workspace
  const completed = { ...item, completedAt: at, updatedAt: at }
  return { ...workspace, pendingItems: replaceById(workspace.pendingItems, completed), history: [...workspace.history, createHistoryEvent(item.projectId, 'pending-completed', `Pendência concluída: ${item.description}`, item.id, at)] }
}

export const removePendingItem = (workspace: Workspace, itemId: string): Workspace => ({ ...workspace, pendingItems: workspace.pendingItems.filter((item) => item.id !== itemId) })

export const addDecision = (workspace: Workspace, projectId: string, input: DecisionInput, at = now()): Workspace => {
  requireProject(workspace, projectId)
  const description = cleanRequiredText(input.description, 'Decisão')
  const rationale = input.rationale?.trim() || null
  const item: Decision = { id: createId(), projectId, description, rationale, decidedOn: input.decidedOn ?? at, createdAt: at, updatedAt: at }
  return addItem(workspace, 'decisions', item, createHistoryEvent(projectId, 'decision-recorded', `Decisão registrada: ${description}`, item.id, at))
}

export const addBlocker = (workspace: Workspace, projectId: string, input: TextEntryInput, at = now()): Workspace => {
  requireProject(workspace, projectId)
  const description = cleanRequiredText(input.description, 'Bloqueio')
  const item: Blocker = { id: createId(), projectId, description, resolvedAt: null, createdAt: at, updatedAt: at }
  return addItem(workspace, 'blockers', item, createHistoryEvent(projectId, 'blocker-created', `Bloqueio registrado: ${description}`, item.id, at))
}

export const updateBlocker = (workspace: Workspace, itemId: string, input: TextEntryInput, at = now()): Workspace => {
  const item = findItem(workspace.blockers, itemId, 'Bloqueio')
  return { ...workspace, blockers: replaceById(workspace.blockers, { ...item, description: cleanRequiredText(input.description, 'Bloqueio'), updatedAt: at }) }
}

export const resolveBlocker = (workspace: Workspace, itemId: string, at = now()): Workspace => {
  const item = findItem(workspace.blockers, itemId, 'Bloqueio')
  if (item.resolvedAt) return workspace
  const resolved = { ...item, resolvedAt: at, updatedAt: at }
  return { ...workspace, blockers: replaceById(workspace.blockers, resolved), history: [...workspace.history, createHistoryEvent(item.projectId, 'blocker-resolved', `Bloqueio resolvido: ${item.description}`, item.id, at)] }
}

export const addMilestone = (workspace: Workspace, projectId: string, input: MilestoneInput, at = now()): Workspace => {
  requireProject(workspace, projectId)
  const description = cleanRequiredText(input.description, 'Marco')
  const item: Milestone = { id: createId(), projectId, description, dueOn: input.dueOn || null, completedAt: null, createdAt: at, updatedAt: at }
  return addItem(workspace, 'milestones', item, createHistoryEvent(projectId, 'milestone-created', `Marco registrado: ${description}`, item.id, at))
}

export const completeMilestone = (workspace: Workspace, itemId: string, at = now()): Workspace => {
  const item = findItem(workspace.milestones, itemId, 'Marco')
  if (item.completedAt) return workspace
  const completed = { ...item, completedAt: at, updatedAt: at }
  return { ...workspace, milestones: replaceById(workspace.milestones, completed), history: [...workspace.history, createHistoryEvent(item.projectId, 'milestone-completed', `Marco concluído: ${item.description}`, item.id, at)] }
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

const requireProject = (workspace: Workspace, projectId: string): void => { findProject(workspace, projectId) }

const findItem = <T extends { id: string }>(items: T[], itemId: string, label: string): T => {
  const item = items.find((candidate) => candidate.id === itemId)
  if (!item) throw new Error(`${label} não encontrado.`)
  return item
}

const replaceById = <T extends { id: string }>(items: T[], item: T): T[] => items.map((candidate) => candidate.id === item.id ? item : candidate)

const addItem = <K extends 'progressUpdates' | 'pendingItems' | 'decisions' | 'blockers' | 'milestones'>(workspace: Workspace, key: K, item: Workspace[K][number], event: HistoryEvent): Workspace => ({ ...workspace, [key]: [...workspace[key], item], history: [...workspace.history, event] } as Workspace)

const createHistoryEvent = (projectId: string, type: HistoryEventType, description: string, itemId: string | null, at: ISODate): HistoryEvent => ({
  id: createId(), projectId, type, description, itemId, occurredOn: at, createdAt: at, updatedAt: at,
})

const replaceProject = (workspace: Workspace, project: Project, event: HistoryEvent): Workspace => ({
  ...workspace,
  projects: workspace.projects.map((item) => item.id === project.id ? project : item),
  history: [...workspace.history, event],
})
