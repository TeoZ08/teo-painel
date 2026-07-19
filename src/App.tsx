import { useEffect, useRef, useState } from 'react'
import { addProgressUpdate, createEmptyWorkspace, createProject, deleteProject, setNextAction, setProjectStatus, updateProject, type Project, type Workspace } from './domain/workspace'
import { ProjectDetail } from './components/ProjectDetail'
import { ReportPanel } from './components/ReportPanel'
import { BACKUP_KEY, WORKSPACE_KEY, exportWorkspace, importWorkspace, loadWorkspace, saveWorkspace } from './persistence/storage'
import { changesetAsMarkdown } from './context-source/changeset'
import { loadContextV2, toLegacySnapshot } from './context-source/v2'
import { contextForLocalProject, mergeSnapshotIntoWorkspace } from './context-source/mergeWorkspace'
import type { TeoContextSnapshot } from './context-source/types'

interface InitialWorkspaceState { workspace: Workspace; recoveryError: string | null }

const getInitialWorkspace = (): InitialWorkspaceState => {
  try { return { workspace: loadWorkspace(window.localStorage), recoveryError: null } } catch (error) { return { workspace: createEmptyWorkspace(), recoveryError: error instanceof Error ? error.message : 'Não foi possível ler os dados locais.' } }
}

export function App() {
  const [initialWorkspace] = useState<InitialWorkspaceState>(getInitialWorkspace)
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace.workspace)
  const [recoveryError, setRecoveryError] = useState<string | null>(initialWorkspace.recoveryError)
  const [editing, setEditing] = useState<Project | 'new' | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showQuickUpdate, setShowQuickUpdate] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [message, setMessage] = useState('')
  const [snapshot, setSnapshot] = useState<TeoContextSnapshot | null>(null)
  const [snapshotStatus, setSnapshotStatus] = useState<'loading' | 'live' | 'cached' | 'fallback' | 'unavailable'>('loading')
  const importInput = useRef<HTMLInputElement>(null)

  const commit = (next: Workspace) => {
    saveWorkspace(window.localStorage, next)
    setWorkspace(next)
  }

  useEffect(() => {
    let active = true
    void loadContextV2(window.localStorage).then(({ bundle, origin }) => {
      if (!active) return
      const nextSnapshot = toLegacySnapshot(bundle)
      setSnapshot(nextSnapshot)
      setSnapshotStatus(origin === 'vps' ? 'live' : origin === 'cache' ? 'cached' : 'fallback')
      setWorkspace((previous) => {
        const merged = mergeSnapshotIntoWorkspace(previous, nextSnapshot)
        if (merged.projects.length !== previous.projects.length) saveWorkspace(window.localStorage, merged)
        return merged
      })
    }).catch(() => { if (active) setSnapshotStatus('unavailable') })
    return () => { active = false }
  }, [])

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

  const downloadChangeset = () => {
    const blob = new Blob([changesetAsMarkdown(workspace, snapshot)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `teo-painel-changeset-${new Date().toISOString().slice(0, 10)}.md`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Changeset local preparado para revisão; nenhuma alteração foi enviada ao repositório de contexto.')
  }

  const selectedProject = workspace.projects.find((project) => project.id === selectedProjectId) ?? null
  const visibleProjects = workspace.projects.filter((project) => (showArchived ? project.status === 'archived' : project.status === 'active') && project.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
  const recentUpdates = [...workspace.progressUpdates].sort((a, b) => b.occurredOn.localeCompare(a.occurredOn)).slice(0, 5)
  const activeBlockers = workspace.blockers.filter((blocker) => !blocker.resolvedAt)

  if (recoveryError) return <RecoveryScreen error={recoveryError} onStartOver={() => { const raw = window.localStorage.getItem(WORKSPACE_KEY); if (raw !== null) window.localStorage.setItem(BACKUP_KEY, raw); const empty = createEmptyWorkspace(); saveWorkspace(window.localStorage, empty); setWorkspace(empty); setRecoveryError(null); setMessage('Um novo workspace foi iniciado. A cópia anterior ficou preservada localmente.') }} />

  return (
    <main className="app-shell">
      <header className="app-header"><div><p className="eyebrow">teo-painel · contexto pessoal</p><h1>O que pede atenção agora?</h1></div><div className="header-actions">{workspace.projects.length > 0 && <button onClick={() => setShowQuickUpdate(true)}>Registrar atualização</button>}<button className={workspace.projects.length === 0 ? '' : 'secondary'} onClick={() => setEditing('new')}>Criar projeto</button></div></header>
      <p className="helper">Atualize o que avançou, deixe o próximo passo claro e consulte o restante quando precisar.</p>
      {snapshotStatus !== 'loading' && <p className="context-status" role="status">{snapshotStatus === 'live' ? 'Contexto atualizado.' : snapshotStatus === 'cached' ? 'Usando cópia local do contexto.' : snapshotStatus === 'fallback' ? 'Usando o fallback integrado ao painel.' : 'Contexto indisponível; seus registros locais continuam seguros.'}</p>}
      {message && <p className="notice" role="status">{message}</p>}
      {editing && <ProjectForm project={editing === 'new' ? null : editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
      {showQuickUpdate && <QuickUpdate projects={workspace.projects.filter((project) => project.status === 'active')} onCancel={() => setShowQuickUpdate(false)} onSave={(projectId, description, nextAction) => { let next = addProgressUpdate(workspace, projectId, { description }); if (nextAction.trim()) next = setNextAction(next, projectId, { description: nextAction }); commit(next); setShowQuickUpdate(false); setSelectedProjectId(projectId); setMessage('Atualização registrada.') }} />}
      {!selectedProject && <><section className="home-controls"><label>Buscar projeto<input value={search} placeholder="Buscar pelo nome" onChange={(event) => setSearch(event.target.value)} /></label><div><button className="secondary" onClick={() => setShowArchived(!showArchived)}>{showArchived ? 'Ver projetos ativos' : 'Ver arquivados'}</button><details><summary>Dados</summary><div><button className="secondary" onClick={download}>Exportar JSON</button><button className="secondary" onClick={downloadChangeset}>Baixar changeset</button><button className="secondary" onClick={() => importInput.current?.click()}>Importar JSON</button><input ref={importInput} aria-label="Selecionar arquivo para importar" type="file" accept="application/json" hidden onChange={(event) => void handleImport(event.target.files?.[0])} /></div></details></div></section><div className="home-grid"><section aria-labelledby="project-list-title"><div className="section-heading"><h2 id="project-list-title">{showArchived ? 'Projetos arquivados' : 'Projetos'}</h2><span>{visibleProjects.length} visíveis</span></div>{visibleProjects.length === 0 ? workspace.projects.length === 0 ? <div className="empty-start"><p>Comece criando um projeto e registre o primeiro avanço quando ele acontecer.</p></div> : <p className="empty">Nenhum projeto encontrado.</p> : <ul className="project-list">{visibleProjects.map((project) => { const next = workspace.nextActions.find((item) => item.projectId === project.id && !item.completedAt && !item.replacedAt); const context = contextForLocalProject(snapshot, project.id); return <li key={project.id}><article><div className="project-card-heading"><h3>{project.name}</h3><small>{project.status === 'active' ? 'Ativo' : 'Arquivado'}</small></div><p>{project.currentSituation}</p><p className="next-label">Próxima ação <strong>{next?.description ?? context?.canonicalNextAction ?? 'Ainda não definida'}</strong></p>{context?.source.url && <a className="source-link" href={context.source.url} target="_blank" rel="noreferrer">Ver fonte de contexto</a>}<div><button className="secondary" onClick={() => setSelectedProjectId(project.id)}>Abrir</button><button className="secondary" onClick={() => setEditing(project)}>Editar</button><button className="secondary" onClick={() => { commit(setProjectStatus(workspace, project.id, project.status === 'active' ? 'archived' : 'active')); setMessage(project.status === 'active' ? 'Projeto arquivado.' : 'Projeto reativado.') }}>{project.status === 'active' ? 'Arquivar' : 'Reativar'}</button><button className="danger" onClick={() => { if (window.confirm(`Excluir “${project.name}”? Esta ação remove os registros ligados a ele.`)) { commit(deleteProject(workspace, project.id)); setMessage('Projeto excluído.') } }}>Excluir</button></div></article></li> })}</ul>}</section><aside className="home-aside"><section><h2>Atualizações recentes</h2>{recentUpdates.length ? <ul className="compact-list">{recentUpdates.map((item) => <li key={item.id}><strong>{workspace.projects.find((project) => project.id === item.projectId)?.name ?? 'Projeto removido'}</strong><span>{item.description}</span></li>)}</ul> : <p className="empty">Nenhuma atualização registrada.</p>}</section><section><h2>Bloqueios ativos</h2>{activeBlockers.length ? <ul className="compact-list blockers">{activeBlockers.map((item) => <li key={item.id}>{item.description}</li>)}</ul> : <p className="empty">Nenhum bloqueio ativo.</p>}</section></aside></div></>}
      {selectedProject && (showReport ? <ReportPanel workspace={workspace} project={selectedProject} onClose={() => setShowReport(false)} /> : <ProjectDetail workspace={workspace} project={selectedProject} context={contextForLocalProject(snapshot, selectedProject.id)} onClose={() => setSelectedProjectId(null)} onOpenReport={() => setShowReport(true)} onCommit={(next, nextMessage) => { commit(next); setMessage(nextMessage) }} />)}
    </main>
  )
}

function RecoveryScreen({ error, onStartOver }: { error: string; onStartOver(): void }) {
  const downloadRaw = () => { const raw = window.localStorage.getItem(WORKSPACE_KEY); if (!raw) return; const blob = new Blob([raw], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'teo-painel-dados-recuperacao.json'; link.click(); URL.revokeObjectURL(url) }
  return <main className="app-shell recovery"><p className="eyebrow">Recuperação de dados</p><h1>Os dados locais precisam de revisão.</h1><p>O painel não gravará nada sobre eles até você decidir o que fazer. Baixe a cópia original para guardar ou tentar corrigir antes de iniciar um workspace vazio.</p><p className="form-error" role="alert">{error}</p><div><button onClick={downloadRaw}>Baixar dados originais</button><button className="secondary" onClick={() => { if (window.confirm('Iniciar um workspace vazio? A cópia original continuará guardada localmente como backup.')) onStartOver() }}>Iniciar workspace vazio</button></div></main>
}

function QuickUpdate({ projects, onCancel, onSave }: { projects: Project[]; onCancel(): void; onSave(projectId: string, description: string, nextAction: string): void }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [description, setDescription] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [error, setError] = useState('')
  return <form className="quick-update" onSubmit={(event) => { event.preventDefault(); try { onSave(projectId, description, nextAction) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível registrar.') } }}><div><p className="eyebrow">Registro rápido</p><h2>Registrar atualização</h2></div><label>Projeto<select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label>O que avançou?<textarea autoFocus value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>Próxima ação <span>Opcional — substitui a atual.</span><input value={nextAction} onChange={(event) => setNextAction(event.target.value)} /></label>{error && <p role="alert" className="form-error">{error}</p>}<div><button type="submit" disabled={projects.length === 0}>Salvar atualização</button><button type="button" className="secondary" onClick={onCancel}>Cancelar</button></div></form>
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
