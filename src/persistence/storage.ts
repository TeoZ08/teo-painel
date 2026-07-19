import { CURRENT_SCHEMA_VERSION, assertWorkspaceIntegrity, createEmptyWorkspace, type Workspace } from '../domain/workspace'

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
  const keys = ['projects', 'progressUpdates', 'nextActions', 'pendingItems', 'decisions', 'blockers', 'milestones', 'history'] as const
  for (const key of keys) if (!Array.isArray(object[key])) throw new Error(`A coleção ${key} é inválida.`)
  if (!isObject(object.settings)) throw new Error('As configurações são inválidas.')
  return assertWorkspaceIntegrity(object as unknown as Workspace)
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
