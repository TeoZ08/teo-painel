import { createServer } from 'node:http'
import { materializeContext, writeDatasetsAtomically } from '../../scripts/lib/materialize-context.mjs'

const port = Number(process.env.PORT ?? 8080)
const source = process.env.CONTEXT_SOURCE ?? '/data/repo'
const output = process.env.CONTEXT_OUTPUT ?? '/data/public'
const refreshToken = process.env.REFRESH_TOKEN
if (!refreshToken) throw new Error('REFRESH_TOKEN é obrigatório para o endpoint interno.')

let refreshing = false
let lastResult = null
const json = (response, status, body) => { response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); response.end(`${JSON.stringify(body)}\n`) }
const safeFailureCode = (error) => {
  const code = error instanceof Error ? error.message : ''
  if (['source_remote_invalid', 'source_fetch_failed', 'source_read_failed'].includes(code)) return code
  if (code.startsWith('Artefato público recusado:')) return 'public_artifact_rejected'
  return 'materialization_failed'
}

const refresh = () => {
  if (refreshing) return { state: 'busy', manifest: null }
  refreshing = true
  try {
    const result = materializeContext({ source })
    const manifest = writeDatasetsAtomically(output, result)
    lastResult = { state: 'ready', generatedAt: manifest.generatedAt, commit: manifest.source.commit }
    return { state: 'ready', manifest: lastResult }
  } finally { refreshing = false }
}

createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/health') return json(response, 200, { state: refreshing ? 'refreshing' : 'ready', lastResult })
  if (request.method !== 'POST' || request.url !== '/internal/refresh') return json(response, 404, { error: 'not_found' })
  if (request.headers.authorization !== `Bearer ${refreshToken}`) return json(response, 401, { error: 'unauthorized' })
  try { return json(response, 200, refresh()) } catch (error) {
    const failure = safeFailureCode(error)
    console.error(`context_materialization_failed:${failure}`)
    return json(response, 500, { state: 'failed', error: failure })
  }
}).listen(port, '0.0.0.0', () => console.log(`context-materializer interno em :${port}`))
