import { describe, expect, it } from 'vitest'
import { createEmptyWorkspace, createProject } from '../domain/workspace'
import { BACKUP_KEY, WORKSPACE_KEY, exportWorkspace, importWorkspace, loadWorkspace, parseWorkspace, saveWorkspace } from './storage'

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

describe('workspace storage', () => {
  it('starts safely when empty and persists a project', () => {
    const storage = new MemoryStorage()
    expect(loadWorkspace(storage).projects).toEqual([])
    const workspace = createProject(createEmptyWorkspace(), { name: 'Persistido', currentSituation: 'Teste' })
    saveWorkspace(storage, workspace)
    expect(loadWorkspace(storage).projects[0].name).toBe('Persistido')
  })

  it('exports and imports a valid workspace', () => {
    const workspace = createProject(createEmptyWorkspace(), { name: 'Exportado', currentSituation: 'Pronto' })
    const storage = new MemoryStorage()
    const imported = importWorkspace(storage, exportWorkspace(workspace, '2026-07-18T12:00:00.000Z'))
    expect(imported.projects[0].name).toBe('Exportado')
  })

  it('does not overwrite data on invalid import', () => {
    const storage = new MemoryStorage()
    saveWorkspace(storage, createProject(createEmptyWorkspace(), { name: 'Seguro', currentSituation: 'Mantido' }))
    expect(() => importWorkspace(storage, '{invalid json')).toThrow('JSON válido')
    expect(loadWorkspace(storage).projects[0].name).toBe('Seguro')
  })

  it('creates a backup before a successful destructive import', () => {
    const storage = new MemoryStorage()
    const oldWorkspace = createProject(createEmptyWorkspace(), { name: 'Antigo', currentSituation: 'Anterior' })
    saveWorkspace(storage, oldWorkspace)
    const nextWorkspace = createProject(createEmptyWorkspace(), { name: 'Novo', currentSituation: 'Importado' })
    importWorkspace(storage, exportWorkspace(nextWorkspace))
    expect(storage.getItem(BACKUP_KEY)).toBe(JSON.stringify(oldWorkspace))
    expect(JSON.parse(storage.getItem(BACKUP_KEY) ?? '{}').projects[0].name).toBe('Antigo')
  })

  it('migrates schema version zero explicitly', () => {
    const v0 = { ...createEmptyWorkspace(), schemaVersion: 0 }
    expect(parseWorkspace(v0)).toMatchObject({ schemaVersion: 1, settings: { lastExportedAt: null } })
  })

  it('preserves raw storage when a stored workspace is malformed', () => {
    const storage = new MemoryStorage()
    storage.setItem(WORKSPACE_KEY, '{"schemaVersion":1,"projects":"not-an-array"}')
    expect(() => loadWorkspace(storage)).toThrow('dados originais foram preservados')
    expect(storage.getItem(WORKSPACE_KEY)).toContain('not-an-array')
  })

  it('rejects a structurally incomplete import before replacing the workspace', () => {
    const storage = new MemoryStorage()
    saveWorkspace(storage, createProject(createEmptyWorkspace(), { name: 'Preservado', currentSituation: 'Seguro' }))
    const invalid = JSON.stringify({ format: 'teo-painel-export', exportedAt: '2026-07-18T12:00:00.000Z', workspace: { ...createEmptyWorkspace(), projects: [{ id: 'p' }] } })
    expect(() => importWorkspace(storage, invalid)).toThrow('Projeto tem status inválido')
    expect(loadWorkspace(storage).projects[0].name).toBe('Preservado')
  })
})
