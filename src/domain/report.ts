import type { Blocker, Decision, Milestone, PendingItem, ProgressUpdate, Workspace } from './workspace'

export interface ReportPeriod { from?: string; to?: string }
export interface ProjectReport {
  projectName: string
  situation: string
  period: ReportPeriod
  generatedAt: string
  progressUpdates: ProgressUpdate[]
  decisions: Decision[]
  blockers: Blocker[]
  pendingItems: PendingItem[]
  nextActions: string[]
  milestones: Milestone[]
}

export const buildProjectReport = (workspace: Workspace, projectId: string, period: ReportPeriod = {}, generatedAt = new Date().toISOString()): ProjectReport => {
  const project = workspace.projects.find((item) => item.id === projectId)
  if (!project) throw new Error('Projeto não encontrado.')
  const inPeriod = (date: string) => (!period.from || date >= period.from) && (!period.to || date <= `${period.to}T23:59:59.999Z`)
  const projectItems = <T extends { projectId: string }>(items: T[]) => items.filter((item) => item.projectId === projectId)
  return {
    projectName: project.name,
    situation: project.currentSituation,
    period,
    generatedAt,
    progressUpdates: projectItems(workspace.progressUpdates).filter((item) => inPeriod(item.occurredOn)).sort(byNewest('occurredOn')),
    decisions: projectItems(workspace.decisions).filter((item) => inPeriod(item.decidedOn)).sort(byNewest('decidedOn')),
    blockers: projectItems(workspace.blockers).filter((item) => !item.resolvedAt || inPeriod(item.resolvedAt)).sort(byNewest('updatedAt')),
    pendingItems: projectItems(workspace.pendingItems).filter((item) => !item.completedAt || inPeriod(item.completedAt)).sort(byNewest('updatedAt')),
    nextActions: projectItems(workspace.nextActions).filter((item) => !item.completedAt && !item.replacedAt).map((item) => item.description),
    milestones: projectItems(workspace.milestones).filter((item) => item.completedAt && inPeriod(item.completedAt)).sort(byNewest('completedAt')),
  }
}

export const projectReportToMarkdown = (report: ProjectReport): string => {
  const lines = [`# ${report.projectName}`, '', `**Situação:** ${report.situation}`, `**Período:** ${periodLabel(report.period)}`, `**Gerado em:** ${formatDate(report.generatedAt)}`]
  addSection(lines, 'Avanços', report.progressUpdates.map((item) => item.description))
  addSection(lines, 'Decisões', report.decisions.map((item) => item.rationale ? `${item.description} — ${item.rationale}` : item.description))
  addSection(lines, 'Bloqueios', report.blockers.filter((item) => !item.resolvedAt).map((item) => item.description))
  addSection(lines, 'Pendências', report.pendingItems.filter((item) => !item.completedAt).map((item) => item.description))
  addSection(lines, 'Próximas ações', report.nextActions, true)
  addSection(lines, 'Marcos concluídos', report.milestones.map((item) => item.description))
  return `${lines.join('\n')}\n`
}

const addSection = (lines: string[], title: string, items: string[], ordered = false): void => {
  lines.push('', `## ${title}`)
  if (items.length === 0) lines.push('- Nenhum registro no período.')
  else items.forEach((item, index) => lines.push(ordered ? `${index + 1}. ${item}` : `- ${item}`))
}

const byNewest = <K extends string>(key: K) => <T extends Record<K, string | null>>(a: T, b: T): number => (b[key] ?? '').localeCompare(a[key] ?? '')
const periodLabel = (period: ReportPeriod): string => period.from || period.to ? `${period.from ?? 'início'} a ${period.to ?? 'hoje'}` : 'Todo o histórico'
const formatDate = (value: string): string => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value))
