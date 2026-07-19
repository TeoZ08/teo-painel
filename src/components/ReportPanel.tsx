import { useMemo, useState } from 'react'
import { buildProjectReport, projectReportToMarkdown } from '../domain/report'
import type { Project, Workspace } from '../domain/workspace'

export function ReportPanel({ workspace, project, onClose }: { workspace: Workspace; project: Project; onClose(): void }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const markdown = useMemo(() => projectReportToMarkdown(buildProjectReport(workspace, project.id, { from: from || undefined, to: to || undefined })), [workspace, project.id, from, to])
  const copy = async () => { try { await navigator.clipboard.writeText(markdown); setMessage('Relatório copiado em Markdown.') } catch { setMessage('Não foi possível copiar automaticamente. Selecione o texto abaixo.') } }
  const download = () => { const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'projeto'}-relatorio.md`; link.click(); URL.revokeObjectURL(url); setMessage('Relatório baixado.') }
  return <section className="report-panel" aria-labelledby="report-title">
    <div className="section-heading"><div><p className="eyebrow">Relatório do projeto</p><h2 id="report-title">{project.name}</h2></div><button className="secondary" onClick={onClose}>Voltar ao projeto</button></div>
    <div className="report-controls"><label>De<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label>Até<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label><button className="secondary" onClick={() => { setFrom(''); setTo('') }}>Todo o histórico</button></div>
    <div className="report-actions"><button onClick={() => void copy()}>Copiar Markdown</button><button className="secondary" onClick={download}>Baixar .md</button><button className="secondary" onClick={() => window.print()}>Imprimir</button></div>
    {message && <p role="status" className="notice">{message}</p>}
    <pre className="report-preview" aria-label="Prévia do relatório">{markdown}</pre>
  </section>
}
