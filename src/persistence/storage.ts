import { CURRENT_SCHEMA_VERSION, assertWorkspaceIntegrity, createEmptyWorkspace, type HistoryEventType, type Workspace } from '../domain/workspace'

export const WORKSPACE_KEY = 'teo-painel.workspace'
export const BACKUP_KEY = 'teo-painel.workspace.backup.v1'

export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }

export interface ExportFile { format: 'teo-painel-export'; exportedAt: string; workspace: Workspace }

export const loadWorkspace = (storage: StorageLike): Workspace => {
  const raw = storage.getItem(WORKSPACE_KEY)
  if (!raw) return createEmptyWorkspace()
  try {
    return parseWorkspace(JSON.parse(raw))
  } catch (error) {
    throw new Error(`Não foi possível ler os dados locais: ${messageOf(error)}. Os dados originais foram preservados.`, { cause: error })
  }
}

export const saveWorkspace = (storage: StorageLike, workspace: Workspace): Workspace => {
  const checked = assertWorkspaceIntegrity(workspace)
  storage.setItem(WORKSPACE_KEY, JSON.stringify(checked))
  return checked
}

export const exportWorkspace = (workspace: Workspace, exportedAt = new Date().toISOString()): string => {
  const file: ExportFile = { format: 'teo-painel-export', exportedAt, workspace: assertWorkspaceIntegrity(workspace) }
  return JSON.stringify(file, null, 2)
}

export const importWorkspace = (storage: StorageLike, raw: string): Workspace => {
  let candidate: unknown
  try { candidate = JSON.parse(raw) } catch { throw new Error('O arquivo não contém JSON válido.') }
  const object = objectOf(candidate, 'O arquivo de importação é inválido.')
  if (object.format !== 'teo-painel-export') throw new Error('Este arquivo não é uma exportação do teo-painel.')
  const imported = parseWorkspace(object.workspace)
  const previous = storage.getItem(WORKSPACE_KEY)
  if (previous !== null) storage.setItem(BACKUP_KEY, previous)
  saveWorkspace(storage, imported)
  return imported
}

export const parseWorkspace = (candidate: unknown): Workspace => {
  const migrated = migrate(candidate)
  const object = objectOf(migrated, 'O workspace é inválido.')
  if (object.schemaVersion !== CURRENT_SCHEMA_VERSION) throw new Error('A versão dos dados não é compatível.')
  const workspace: Workspace = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    settings: parseSettings(object.settings),
    projects: parseArray(object.projects, 'projects', parseProject),
    progressUpdates: parseArray(object.progressUpdates, 'progressUpdates', (value) => ({ ...parseBase(value, 'Avanço'), description: requiredText(value, 'description', 'Avanço'), occurredOn: dateString(value, 'occurredOn', 'Avanço') })),
    nextActions: parseArray(object.nextActions, 'nextActions', (value) => ({ ...parseBase(value, 'Próxima ação'), description: requiredText(value, 'description', 'Próxima ação'), completedAt: nullableDateString(value, 'completedAt', 'Próxima ação'), replacedAt: nullableDateString(value, 'replacedAt', 'Próxima ação') })),
    pendingItems: parseArray(object.pendingItems, 'pendingItems', (value) => ({ ...parseBase(value, 'Pendência'), description: requiredText(value, 'description', 'Pendência'), completedAt: nullableDateString(value, 'completedAt', 'Pendência') })),
    decisions: parseArray(object.decisions, 'decisions', (value) => ({ ...parseBase(value, 'Decisão'), description: requiredText(value, 'description', 'Decisão'), rationale: nullableText(value, 'rationale', 'Decisão'), decidedOn: dateString(value, 'decidedOn', 'Decisão') })),
    blockers: parseArray(object.blockers, 'blockers', (value) => ({ ...parseBase(value, 'Bloqueio'), description: requiredText(value, 'description', 'Bloqueio'), resolvedAt: nullableDateString(value, 'resolvedAt', 'Bloqueio') })),
    milestones: parseArray(object.milestones, 'milestones', (value) => ({ ...parseBase(value, 'Marco'), description: requiredText(value, 'description', 'Marco'), dueOn: nullableDateString(value, 'dueOn', 'Marco'), completedAt: nullableDateString(value, 'completedAt', 'Marco') })),
    history: parseArray(object.history, 'history', parseHistoryEvent),
  }
  return assertWorkspaceIntegrity(workspace)
}

const migrate = (candidate: unknown): unknown => {
  const object = objectOf(candidate, 'O workspace é inválido.')
  if (object.schemaVersion === CURRENT_SCHEMA_VERSION) return object
  if (object.schemaVersion === 0) {
    return { ...createEmptyWorkspace(), ...object, schemaVersion: CURRENT_SCHEMA_VERSION, settings: object.settings ?? { lastExportedAt: null } }
  }
  throw new Error('A versão dos dados não é compatível.')
}

const objectOf = (value: unknown, errorMessage: string): Record<string, unknown> => {
  if (!isObject(value)) throw new Error(errorMessage)
  return value
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const messageOf = (error: unknown): string => error instanceof Error ? error.message : 'erro desconhecido'

const parseSettings = (value: unknown): Workspace['settings'] => ({ lastExportedAt: nullableDateString(value, 'lastExportedAt', 'Configurações') })
const parseProject = (value: unknown): Workspace['projects'][number] => {
  const object = objectOf(value, 'Projeto inválido.')
  const status = object.status
  if (status !== 'active' && status !== 'archived') throw new Error('Projeto tem status inválido.')
  return { id: requiredText(object, 'id', 'Projeto'), name: requiredText(object, 'name', 'Projeto'), currentSituation: requiredText(object, 'currentSituation', 'Projeto'), status, createdAt: dateString(object, 'createdAt', 'Projeto'), updatedAt: dateString(object, 'updatedAt', 'Projeto') }
}

const parseBase = (value: unknown, label: string) => {
  const object = objectOf(value, `${label} inválido.`)
  return { id: requiredText(object, 'id', label), projectId: requiredText(object, 'projectId', label), createdAt: dateString(object, 'createdAt', label), updatedAt: dateString(object, 'updatedAt', label) }
}

const parseHistoryEvent = (value: unknown): Workspace['history'][number] => {
  const object = objectOf(value, 'Evento de histórico inválido.')
  const type = object.type
  const types: HistoryEventType[] = ['project-created', 'project-updated', 'project-archived', 'project-reactivated', 'project-deleted', 'progress-recorded', 'next-action-set', 'next-action-completed', 'pending-created', 'pending-completed', 'decision-recorded', 'blocker-created', 'blocker-resolved', 'milestone-created', 'milestone-completed']
  if (!types.includes(type as HistoryEventType)) throw new Error('Evento de histórico tem tipo inválido.')
  return { ...parseBase(object, 'Evento de histórico'), type: type as HistoryEventType, description: requiredText(object, 'description', 'Evento de histórico'), occurredOn: dateString(object, 'occurredOn', 'Evento de histórico'), itemId: nullableText(object, 'itemId', 'Evento de histórico') }
}

const parseArray = <T>(value: unknown, key: string, parse: (value: unknown) => T): T[] => {
  if (!Array.isArray(value)) throw new Error(`A coleção ${key} é inválida.`)
  return value.map(parse)
}

const requiredText = (value: unknown, key: string, label: string): string => {
  const object = objectOf(value, `${label} inválido.`)
  const field = object[key]
  if (typeof field !== 'string' || !field.trim()) throw new Error(`${label} tem ${key} inválido.`)
  return field
}

const nullableText = (value: unknown, key: string, label: string): string | null => {
  const object = objectOf(value, `${label} inválido.`)
  const field = object[key]
  if (field !== null && typeof field !== 'string') throw new Error(`${label} tem ${key} inválido.`)
  return field
}

const dateString = (value: unknown, key: string, label: string): string => {
  const date = requiredText(value, key, label)
  if (Number.isNaN(Date.parse(date))) throw new Error(`${label} tem ${key} inválido.`)
  return date
}

const nullableDateString = (value: unknown, key: string, label: string): string | null => {
  const date = nullableText(value, key, label)
  if (date !== null && Number.isNaN(Date.parse(date))) throw new Error(`${label} tem ${key} inválido.`)
  return date
}
