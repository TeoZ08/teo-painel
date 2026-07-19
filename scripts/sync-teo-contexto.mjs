import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, basename } from 'node:path'

const options = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => value.startsWith('--') ? [...pairs, [value.slice(2), values[index + 1]]] : pairs, []))
const source = options.source
const output = options.output
if (!source || !output) throw new Error('Uso: npm run sync:teo-contexto -- --source ../teo-contexto --output public/data/teo-contexto.snapshot.json')

const git = (args) => execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' }).trim()
const commit = git(['rev-parse', 'main'])
const files = git(['ls-tree', '-r', '--name-only', 'main', '--', 'projetos']).split('\n').filter((path) => path.endsWith('.md') && !/(readme|template)/i.test(basename(path)))
if (!files.length) throw new Error('A origem não possui projetos/*.md em main.')

const warnings = []
const projects = files.flatMap((path) => {
  try {
    const content = git(['show', `main:${path}`])
    const project = parseProject(path, content, commit)
    if (!project) { warnings.push({ path, message: 'Projeto sem título identificável.' }); return [] }
    return [project]
  } catch (error) { warnings.push({ path, message: error instanceof Error ? error.message : 'Falha ao interpretar projeto.' }); return [] }
}).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

const snapshot = { schemaVersion: 1, generatedAt: new Date().toISOString(), source: { repository: 'TeoZ08/teo-contexto', ref: 'main', commit }, projects, unmappedMentions: [], warnings }
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(snapshot, null, 2)}\n`)
console.log(`Snapshot gerado: ${projects.length} projetos, ${warnings.length} warnings, commit ${commit.slice(0, 12)}.`)

function parseProject(path, content, commit) {
  const { data, body } = frontMatter(content)
  const h1 = body.match(/^#\s+(.+)$/m)?.[1]?.trim()
  const fallbackName = basename(path, '.md').replace(/[-_]+/g, ' ')
  const name = text(data.name) || h1 || fallbackName
  if (!name) return null
  const id = text(data.id) || text(data.slug) || basename(path, '.md').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const section = (...names) => findSection(body, names)
  const summary = text(data.summary) || section('Resumo', 'Objetivo') || 'Sem resumo registrado.'
  const situation = text(data.current_situation) || section('Situação atual', 'Status', 'Estado') || 'Sem situação atual registrada.'
  const nextAction = text(data.next_action) || firstBullet(section('Próxima ação', 'Próximos passos', 'Pendências')) || null
  const blocker = text(data.blocker) || firstBullet(section('Bloqueios')) || null
  const aliases = array(data.aliases)
  const status = normalizeStatus(text(data.status) || section('Status', 'Estado'))
  // Project files in teo-contexto have used both a dedicated links section and
  // inline repository references. Scan the public project document so either
  // form remains useful without exporting the Markdown itself.
  const repositories = repositoriesFrom([text(data.repositories), section('Repositórios', 'Link'), body].filter(Boolean).join('\n'))
  return { id, name, aliases, summary: compact(summary), currentSituation: compact(situation), officialStatus: status, stage: normalizeStage(text(data.stage)), priority: normalizePriority(text(data.priority)), canonicalNextAction: nextAction ? compact(nextAction) : null, canonicalBlocker: blocker ? compact(blocker) : null, tags: array(data.tags), repositories, reviewedAt: dateOrNull(data.reviewed_at), nextReviewAt: dateOrNull(data.next_review_at), recentActivity: [], decisions: [], source: { path, url: null, updatedAt: null } }
}

function frontMatter(content) { const match = content.match(/^---\n([\s\S]*?)\n---\n?/) ; if (!match) return { data: {}, body: content }; const data = Object.fromEntries(match[1].split('\n').flatMap((line) => { const item = line.match(/^([\w-]+):\s*(.*)$/); return item ? [[item[1], item[2].trim()]] : [] })); return { data, body: content.slice(match[0].length) } }
function findSection(body, names) { const escaped = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'); const match = body.match(new RegExp(`^##\\s+(?:${escaped})\\s*\\n([\\s\\S]*?)(?=^##\\s|$)`, 'im')); return match?.[1]?.trim() || '' }
function text(value) { return typeof value === 'string' && value.trim() ? value.trim().replace(/^['"]|['"]$/g, '') : '' }
function array(value) { const raw = text(value); return raw ? raw.replace(/^\[|\]$/g, '').split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean) : [] }
function compact(value) { return value.replace(/\n+/g, ' ').replace(/\s+/g, ' ').replace(/^[-*]\s*/, '').trim().slice(0, 420) }
function firstBullet(value) { return value.split('\n').map((line) => line.replace(/^[-*]\s*/, '').trim()).find(Boolean) || '' }
function normalizeStatus(value) { const normalized = value.toLowerCase(); if (/\b(ativo|active|andamento)\b/.test(normalized)) return 'active'; if (/bloque/.test(normalized)) return 'blocked'; if (/paus/.test(normalized)) return 'paused'; if (/conclu|complete/.test(normalized)) return 'completed'; if (/arquiv/.test(normalized)) return 'archived'; return 'unclassified' }
function normalizeStage(value) { const normalized = value.toLowerCase(); return ['idea', 'research', 'prototype', 'mvp', 'release_candidate', 'production', 'maintenance'].find((stage) => normalized.includes(stage)) || null }
function normalizePriority(value) { const normalized = value.toLowerCase(); return normalized.includes('alta') || normalized.includes('high') ? 'high' : normalized.includes('média') || normalized.includes('media') || normalized.includes('medium') ? 'medium' : normalized.includes('baixa') || normalized.includes('low') ? 'low' : null }
function dateOrNull(value) { const date = text(value); return date && !Number.isNaN(Date.parse(date)) ? date : null }
function repositoriesFrom(value) { return [...value.matchAll(/`?(TeoZ08\/[\w.-]+)`?/g)].map((match) => ({ name: match[1], role: null, trackActivity: true })) }
