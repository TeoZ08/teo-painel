import { useRef, useState } from 'react'
import { createEmptyWorkspace, createProject, deleteProject, updateProject, type Project, type Workspace } from './domain/workspace'
import { ProjectDetail } from './components/ProjectDetail'
import { exportWorkspace, importWorkspace, loadWorkspace, saveWorkspace } from './persistence/storage'

const getInitialWorkspace = (): Workspace => {
  try { return loadWorkspace(window.localStorage) } catch { return createEmptyWorkspace() }
}

export function App() {
  const [workspace, setWorkspace] = useState<Workspace>(getInitialWorkspace)
  const [editing, setEditing] = useState<Project | 'new' | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const importInput = useRef<HTMLInputElement>(null)

  const commit = (next: Workspace) => {
    saveWorkspace(window.localStorage, next)
    setWorkspace(next)
  }

  const handleSave = (name: string, situation: string) => {
    const isEditingExistingProject = editing !== null && editing !== 'new'
    const next = isEditingExistingProject ? updateProject(workspace, editing.id, { name, currentSituation: situation }) : createProject(workspace, { name, currentSituation: situation })
    commit(next)
    setEditing(null)
    setMessage(isEditingExistingProject ? 'Projeto atualizado.' : 'Projeto criado.')
  }

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    try {
      commit(importWorkspace(window.localStorage, await file.text()))
      setMessage('Dados importados. Uma cópia do estado anterior foi preservada localmente.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível importar o arquivo.') }
    finally { if (importInput.current) importInput.current.value = '' }
  }

  const download = () => {
    const blob = new Blob([exportWorkspace(workspace)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `teo-painel-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Exportação preparada.')
  }

  const selectedProject = workspace.projects.find((project) => project.id === selectedProjectId) ?? null

  return (
    <main className="app-shell">
      <header className="app-header"><div><p className="eyebrow">teo-painel · base técnica</p><h1>Projetos</h1></div><button onClick={() => setEditing('new')}>Criar projeto</button></header>
      <p className="helper">Registre atualizações e mantenha a próxima ação visível. O acabamento visual final entra na próxima fase.</p>
      {message && <p className="notice" role="status">{message}</p>}
      {editing && <ProjectForm project={editing === 'new' ? null : editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
      <section aria-labelledby="project-list-title"><div className="section-heading"><h2 id="project-list-title">Projetos salvos</h2><div><button className="secondary" onClick={download}>Exportar JSON</button><button className="secondary" onClick={() => importInput.current?.click()}>Importar JSON</button><input ref={importInput} aria-label="Selecionar arquivo para importar" type="file" accept="application/json" hidden onChange={(event) => void handleImport(event.target.files?.[0])} /></div></div>
        {workspace.projects.length === 0 ? <p className="empty">Nenhum projeto criado. Comece por um nome e uma situação atual curta.</p> : <ul className="project-list">{workspace.projects.map((project) => <li key={project.id}><article><h3>{project.name}</h3><p>{project.currentSituation}</p><small>{project.status === 'active' ? 'Ativo' : 'Arquivado'}</small><div><button className="secondary" onClick={() => setSelectedProjectId(project.id)}>Abrir</button><button className="secondary" onClick={() => setEditing(project)}>Editar</button><button className="danger" onClick={() => { if (window.confirm(`Excluir “${project.name}”? Esta ação remove os registros ligados a ele.`)) { commit(deleteProject(workspace, project.id)); setSelectedProjectId(null); setMessage('Projeto excluído.') } }}>Excluir</button></div></article></li>)}</ul>}
      </section>
      {selectedProject && <ProjectDetail workspace={workspace} project={selectedProject} onClose={() => setSelectedProjectId(null)} onCommit={(next, nextMessage) => { commit(next); setMessage(nextMessage) }} />}
    </main>
  )
}

interface ProjectFormProps { project: Project | null; onSave(name: string, situation: string): void; onCancel(): void }

function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? '')
  const [situation, setSituation] = useState(project?.currentSituation ?? '')
  const [error, setError] = useState('')
  return <form className="project-form" onSubmit={(event) => { event.preventDefault(); try { onSave(name, situation) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível salvar.') } }}>
    <h2>{project ? 'Editar projeto' : 'Criar projeto'}</h2>
    <label>Nome do projeto<input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>
    <label>Situação atual<textarea value={situation} onChange={(event) => setSituation(event.target.value)} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div><button type="submit">Salvar</button><button type="button" className="secondary" onClick={onCancel}>Cancelar</button></div>
  </form>
}
