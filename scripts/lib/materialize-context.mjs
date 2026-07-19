import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { parse as parseYaml } from 'yaml'

export const DATASET_SCHEMA_VERSION = 2
const RECORD_TYPES = new Set(['project', 'subproject', 'artifact', 'initiative', 'legacy'])
const STATUSES = new Set(['planned', 'active', 'paused', 'blocked', 'completed', 'archived'])
const STAGES = new Set(['idea', 'research', 'prototype', 'mvp', 'release_candidate', 'production', 'maintenance', 'not_applicable'])
const FORBIDDEN_FIELD = /(?:secret|token|password|authorization|cookie|credential|private.?key|encryption|database|sqlite|backup)/i
const FORBIDDEN_VALUE = /(?:-----BEGIN|\bgh[pousr]_[A-Za-z0-9_]+\b|\bAIza[\w-]+\b|\bsk-[A-Za-z0-9_-]+\b)/
const URL_PATTERN = /https?:\/\/[^\s)\]]+/gi
const URL_TEST_PATTERN = /https?:\/\/[^\s)\]]+/i

const runGit = (source, args) => execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' }).trim()
const checksum = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const sourceOperation = (code, operation) => {
  try { return operation() } catch { throw new Error(code) }
}

export const materializeContext = ({ source, generatedAt = new Date().toISOString() }) => {
  const origin = sourceOperation('source_remote_invalid', () => runGit(source, ['remote', 'get-url', 'origin']))
  if (!/TeoZ08\/teo-contexto(?:\.git)?$/.test(origin)) throw new Error('source_remote_invalid')
  sourceOperation('source_fetch_failed', () => runGit(source, ['fetch', 'origin', 'main']))
  const commit = sourceOperation('source_read_failed', () => runGit(source, ['rev-parse', 'origin/main']))
  const files = sourceOperation('source_read_failed', () => runGit(source, ['ls-tree', '-r', '--name-only', commit])).split('\n').filter(Boolean)
  const warnings = []
  const read = (path) => sourceOperation('source_read_failed', () => runGit(source, ['show', `${commit}:${path}`]))
  const projectFiles = files.filter((path) => /^projetos\/[^/]+\.md$/.test(path))
  const projects = projectFiles.map((path) => parseProject(path, read(path), commit, warnings)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  const projectIds = new Set(projects.map((project) => project.id))
  for (const project of projects) {
    if (project.parentId && !projectIds.has(project.parentId)) warnings.push(warning(project.source.path, 'parent_id não encontrado entre os projetos materializados.'))
  }
  const daily = files.filter((path) => /^diario\/.*\.md$/.test(path)).map((path) => parseDaily(path, read(path), commit, projects, warnings))
  const reviews = files.filter((path) => /^handoffs\/.*\.md$/.test(path)).map((path) => ({ id: slug(path), title: heading(read(path)), source: sourceRef(path, commit) }))
  const quality = { schemaVersion: DATASET_SCHEMA_VERSION, generatedAt, source: sourceMeta(commit), warnings, counts: { projects: projects.length, daily: daily.length, reviews: reviews.length } }
  const datasets = {
    projects: { schemaVersion: DATASET_SCHEMA_VERSION, generatedAt, source: sourceMeta(commit), projects },
    daily: { schemaVersion: DATASET_SCHEMA_VERSION, generatedAt, source: sourceMeta(commit), daily },
    reviews: { schemaVersion: DATASET_SCHEMA_VERSION, generatedAt, source: sourceMeta(commit), reviews },
    pipeline: { schemaVersion: DATASET_SCHEMA_VERSION, generatedAt, source: sourceMeta(commit), pipeline: { state: 'unavailable', lastReviewAt: null, message: 'A Sentinela ainda não materializou uma revisão.' } },
    quality,
  }
  const manifest = {
    schemaVersion: DATASET_SCHEMA_VERSION,
    generatedAt,
    source: sourceMeta(commit),
    datasets: Object.fromEntries(Object.entries(datasets).map(([name, dataset]) => [name, { path: `/v1/${name}.json`, sha256: checksum(dataset) }])),
  }
  return { manifest, datasets, fallback: { schemaVersion: DATASET_SCHEMA_VERSION, generatedAt, source: sourceMeta(commit), manifest, ...datasets } }
}

export const writeDatasetsAtomically = (target, result) => {
  const parent = dirname(target)
  const temporary = `${target}.next-${process.pid}`
  mkdirSync(parent, { recursive: true })
  rmSync(temporary, { recursive: true, force: true })
  mkdirSync(join(temporary, 'v1'), { recursive: true })
  const files = { manifest: result.manifest, ...result.datasets }
  for (const [name, data] of Object.entries(files)) validatePublicArtifact(name, data)
  for (const [name, data] of Object.entries(files)) writeFileSync(join(temporary, 'v1', `${name}.json`), `${JSON.stringify(data, null, 2)}\n`)
  rmSync(target, { recursive: true, force: true })
  renameSync(temporary, target)
  return result.manifest
}

const parseProject = (path, content, commit, warnings) => {
  const { attributes, body } = frontMatter(content, path, warnings)
  const id = text(attributes.id) || slug(basename(path, '.md'))
  const recordType = enumValue(attributes.record_type, RECORD_TYPES, null, path, 'record_type', warnings)
  const status = enumValue(attributes.status, STATUSES, null, path, 'status', warnings)
  const stage = enumValue(attributes.stage, STAGES, null, path, 'stage', warnings)
  if (!attributes.id || !recordType || !status || !stage) warnings.push(warning(path, 'Projeto legado: campos v2 obrigatórios ausentes; manter até normalização.'))
  const parentId = text(attributes.parent_id) || null
  if ((recordType === 'artifact' || recordType === 'subproject') && !parentId) warnings.push(warning(path, 'artifact/subproject sem parent_id.'))
  const repositories = uniqueStrings(array(attributes.repositories).filter((item) => /^[\w.-]+\/[\w.-]+$/.test(item)))
  return {
    id,
    recordType: recordType ?? 'legacy',
    parentId,
    name: text(attributes.name) || heading(body) || basename(path, '.md'),
    aliases: uniqueStrings(array(attributes.aliases)),
    status: status ?? 'planned',
    stage: stage ?? 'not_applicable',
    priority: enumValue(attributes.priority, new Set(['low', 'medium', 'high']), null, path, 'priority', warnings),
    summary: publicText(section(body, ['Resumo', 'Objetivo'])) || null,
    currentSituation: publicText(section(body, ['Situação atual', 'Status', 'Estado atual'])) || null,
    nextAction: publicText(text(attributes.next_action) || firstBullet(section(body, ['Próximos passos', 'Próxima ação', 'Próximos passos possíveis']))) || null,
    blocker: publicText(text(attributes.blocker)) || null,
    repositories: repositories.map((name) => ({ name, role: null, trackActivity: true })),
    tags: uniqueStrings(array(attributes.tags)),
    reviewedAt: dateOrNull(attributes.reviewed_at),
    nextReviewAt: dateOrNull(attributes.next_review_at),
    source: sourceRef(path, commit),
  }
}

const parseDaily = (path, content, commit, projects, warnings) => {
  const date = basename(path, '.md')
  const mentions = projects.filter((project) => new RegExp(`\\b${escapeRegExp(project.id)}\\b|\\b${escapeRegExp(project.name)}\\b`, 'i').test(content))
  if (/\b[A-Z][\w-]+\b/.test(content) && mentions.length === 0) warnings.push(warning(path, 'Diário sem associação inequívoca de projeto.'))
  return { id: `daily:${date}`, date, title: publicText(heading(content)) || null, highlights: bullets(content).map(publicText).filter(Boolean).slice(0, 8), decisions: [], pendingItems: [], projectIds: mentions.map((project) => project.id), source: sourceRef(path, commit) }
}

const sourceMeta = (commit) => ({ repository: 'TeoZ08/teo-contexto', ref: 'main', commit })
const sourceRef = (path, commit) => ({ path, commit })
const warning = (path, message) => ({ path, message })
const frontMatter = (content, path, warnings) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/) 
  if (!match) return { attributes: {}, body: content }
  try { return { attributes: parseYaml(match[1]) ?? {}, body: content.slice(match[0].length) } } catch { warnings.push(warning(path, 'Front matter YAML inválido.')); return { attributes: {}, body: content } }
}
const heading = (body) => body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? ''
const section = (body, names) => {
  const name = names.map(escapeRegExp).join('|')
  const match = body.match(new RegExp(`^##\\s+(?:${name})\\s*\\n([\\s\\S]*?)(?=^##\\s|$)`, 'im'))
  return clean(match?.[1] ?? '') || null
}
const bullets = (body) => [...(body ?? '').matchAll(/^[-*]\s+(.+)$/gm)].map((match) => clean(match[1])).filter(Boolean)
const firstBullet = (value) => bullets(value)[0] ?? null
const clean = (value) => typeof value === 'string' ? value.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim() : ''
export const publicText = (value) => clean(value).replace(URL_PATTERN, '[link removido]')
export const validatePublicArtifact = (name, artifact) => {
  const visit = (value, path = name) => {
    if (typeof value === 'string' && (FORBIDDEN_VALUE.test(value) || URL_TEST_PATTERN.test(value))) throw new Error(`Artefato público recusado: valor sensível em ${path}.`)
    if (Array.isArray(value)) value.forEach((item, index) => visit(item, `${path}[${index}]`))
    if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => {
      if (FORBIDDEN_FIELD.test(key)) throw new Error(`Artefato público recusado: campo proibido em ${path}.${key}.`)
      visit(item, `${path}.${key}`)
    })
  }
  visit(artifact)
  return artifact
}
const text = (value) => typeof value === 'string' && value.trim() ? value.trim() : ''
const array = (value) => Array.isArray(value) ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean) : []
const uniqueStrings = (items) => [...new Set(items)]
const dateOrNull = (value) => { const item = text(value); return item && !Number.isNaN(Date.parse(item)) ? item : null }
const enumValue = (value, values, fallback, path, field, warnings) => { const item = text(value); if (!item) return fallback; if (values.has(item)) return item; warnings.push(warning(path, `${field} inválido: ${item}.`)); return fallback }
const slug = (value) => value.toLowerCase().replace(/\.md$/, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
