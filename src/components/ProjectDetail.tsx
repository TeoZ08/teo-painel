import { useState, type FormEvent } from 'react'
import {
  addBlocker, addDecision, addMilestone, addPendingItem, addProgressUpdate, completeMilestone, completeNextAction, completePendingItem, resolveBlocker, setNextAction, updateBlocker, updateNextAction, updatePendingItem,
  type Project, type Workspace,
} from '../domain/workspace'
import type { ContextProject } from '../context-source/types'

interface ProjectDetailProps { workspace: Workspace; project: Project; context: ContextProject | null; onCommit(workspace: Workspace, message: string): void; onClose(): void; onOpenReport(): void }

export function ProjectDetail({ workspace, project, context, onCommit, onClose, onOpenReport }: ProjectDetailProps) {
  const activeAction = workspace.nextActions.find((item) => item.projectId === project.id && !item.completedAt && !item.replacedAt)
  const records = <T extends { projectId: string }>(items: T[]) => items.filter((item) => item.projectId === project.id)
  const history = records(workspace.history).sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
  const latestUpdate = [...records(workspace.progressUpdates)].sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))[0]
  const commit = (next: Workspace, message: string) => onCommit(next, message)

  return <section className="project-detail" aria-labelledby="detail-title">
    <div className="section-heading"><div><p className="eyebrow">Projeto aberto</p><h2 id="detail-title">{project.name}</h2></div><div><button className="secondary" onClick={onOpenReport}>Gerar relatório</button><button className="secondary" onClick={onClose}>Fechar detalhe</button></div></div>
    <div className="detail-summary"><p className="situation"><strong>Situação atual</strong>{project.currentSituation}</p><p className="last-update"><strong>Última atualização</strong>{latestUpdate ? `${formatDate(latestUpdate.occurredOn)} · ${latestUpdate.description}` : 'Ainda não há atualização registrada.'}</p></div>
    <section className="next-action"><h3>Próxima ação</h3>{activeAction ? <Item text={activeAction.description} action="Concluir" onAction={() => commit(completeNextAction(workspace, activeAction.id), 'Próxima ação concluída.')} editAction="Editar" onEdit={() => editText(activeAction.description, (description) => commit(updateNextAction(workspace, activeAction.id, { description }), 'Próxima ação atualizada.'))} /> : context?.canonicalNextAction ? <p className="context-next">Sugestão da fonte: <strong>{context.canonicalNextAction}</strong></p> : <p className="empty">Defina o próximo passo deste projeto.</p>}<TextForm label="Definir próxima ação" placeholder="Ex.: revisar os dados importados" submitLabel={activeAction ? 'Substituir ação' : 'Salvar ação'} onSubmit={(description) => commit(setNextAction(workspace, project.id, { description }), activeAction ? 'Próxima ação substituída.' : 'Próxima ação definida.')} /></section>
    {context && <section className="context-summary"><p><strong>Contexto canônico</strong>{context.summary}</p>{context.source.url && <p><strong>Fonte</strong><a href={context.source.url} target="_blank" rel="noreferrer">{context.source.path}</a></p>}{context.repositories.map((repository) => <a key={repository.name} href={`https://github.com/${repository.name}`} target="_blank" rel="noreferrer">{repository.name}</a>)}</section>}
    <div className="detail-grid">
      <RecordSection title="Avanços" empty="Nenhum avanço registrado." items={records(workspace.progressUpdates)} render={(item) => <Item text={item.description} meta={formatDate(item.occurredOn)} />}><TextForm label="Registrar avanço" placeholder="O que avançou?" submitLabel="Registrar avanço" onSubmit={(description) => commit(addProgressUpdate(workspace, project.id, { description }), 'Avanço registrado.')} /></RecordSection>
      <RecordSection title="Pendências" empty="Nenhuma pendência aberta." items={records(workspace.pendingItems).filter((item) => !item.completedAt)} render={(item) => <Item text={item.description} action="Concluir" onAction={() => commit(completePendingItem(workspace, item.id), 'Pendência concluída.')} editAction="Editar" onEdit={() => editText(item.description, (description) => commit(updatePendingItem(workspace, item.id, { description }), 'Pendência atualizada.'))} />}><TextForm label="Nova pendência" placeholder="O que ainda falta?" submitLabel="Adicionar pendência" onSubmit={(description) => commit(addPendingItem(workspace, project.id, { description }), 'Pendência adicionada.')} /></RecordSection>
      <RecordSection title="Bloqueios" empty="Nenhum bloqueio ativo." items={records(workspace.blockers).filter((item) => !item.resolvedAt)} render={(item) => <Item text={item.description} action="Resolver" onAction={() => commit(resolveBlocker(workspace, item.id), 'Bloqueio resolvido.')} editAction="Editar" onEdit={() => editText(item.description, (description) => commit(updateBlocker(workspace, item.id, { description }), 'Bloqueio atualizado.'))} />}><TextForm label="Registrar bloqueio" placeholder="O que está impedindo o avanço?" submitLabel="Registrar bloqueio" onSubmit={(description) => commit(addBlocker(workspace, project.id, { description }), 'Bloqueio registrado.')} /></RecordSection>
      <RecordSection title="Marcos" empty="Nenhum marco em aberto." items={records(workspace.milestones).filter((item) => !item.completedAt)} render={(item) => <Item text={item.description} meta={item.dueOn ? `Data: ${formatDate(item.dueOn)}` : undefined} action="Concluir" onAction={() => commit(completeMilestone(workspace, item.id), 'Marco concluído.')} />}><MilestoneForm onSubmit={(description, dueOn) => commit(addMilestone(workspace, project.id, { description, dueOn }), 'Marco registrado.')} /></RecordSection>
    </div>
    <section className="decisions"><h3>Decisões</h3>{records(workspace.decisions).length === 0 ? <p className="empty">Nenhuma decisão registrada.</p> : <ul className="record-list">{records(workspace.decisions).map((item) => <li key={item.id}><strong>{item.description}</strong>{item.rationale && <span>{item.rationale}</span>}</li>)}</ul>}<DecisionForm onSubmit={(description, rationale) => commit(addDecision(workspace, project.id, { description, rationale }), 'Decisão registrada.')} /></section>
    <section className="history"><h3>Histórico</h3>{history.length === 0 ? <p className="empty">Nenhum evento neste projeto.</p> : <ol>{history.map((event) => <li key={event.id}><span>{formatDate(event.occurredOn)}</span>{event.description}</li>)}</ol>}</section>
  </section>
}

interface TextFormProps { label: string; placeholder: string; submitLabel: string; onSubmit(description: string): void }
function TextForm({ label, placeholder, submitLabel, onSubmit }: TextFormProps) {
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent) => { event.preventDefault(); try { onSubmit(description); setDescription(''); setError('') } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível salvar.') } }
  return <form className="inline-form" onSubmit={submit}><label>{label}<input value={description} placeholder={placeholder} onChange={(event) => setDescription(event.target.value)} /></label>{error && <p role="alert" className="form-error">{error}</p>}<button type="submit">{submitLabel}</button></form>
}

function MilestoneForm({ onSubmit }: { onSubmit(description: string, dueOn: string | null): void }) {
  const [description, setDescription] = useState(''); const [dueOn, setDueOn] = useState('')
  return <form className="inline-form" onSubmit={(event) => { event.preventDefault(); onSubmit(description, dueOn || null); setDescription(''); setDueOn('') }}><label>Novo marco<input value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>Data opcional<input type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} /></label><button type="submit">Adicionar marco</button></form>
}

function DecisionForm({ onSubmit }: { onSubmit(description: string, rationale: string): void }) {
  const [description, setDescription] = useState(''); const [rationale, setRationale] = useState('')
  return <form className="inline-form" onSubmit={(event) => { event.preventDefault(); onSubmit(description, rationale); setDescription(''); setRationale('') }}><label>Nova decisão<input value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>Justificativa opcional<input value={rationale} onChange={(event) => setRationale(event.target.value)} /></label><button type="submit">Registrar decisão</button></form>
}

function RecordSection<T>({ title, empty, items, render, children }: { title: string; empty: string; items: T[]; render(item: T): React.ReactNode; children: React.ReactNode }) {
  return <section className="record-section"><h3>{title}</h3>{items.length ? <ul className="record-list">{items.map((item, index) => <li key={index}>{render(item)}</li>)}</ul> : <p className="empty">{empty}</p>}{children}</section>
}

function Item({ text, meta, action, onAction, editAction, onEdit }: { text: string; meta?: string; action?: string; onAction?: () => void; editAction?: string; onEdit?: () => void }) { return <div className="record-item"><span><strong>{text}</strong>{meta && <small>{meta}</small>}</span><div>{editAction && <button className="secondary" onClick={onEdit}>{editAction}</button>}{action && <button className="secondary" onClick={onAction}>{action}</button>}</div></div> }
function formatDate(value: string): string { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value)) }
function editText(current: string, onConfirm: (value: string) => void): void { const next = window.prompt('Atualizar texto', current); if (next !== null) onConfirm(next) }
