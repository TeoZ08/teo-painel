import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { materializeContext } from './lib/materialize-context.mjs'

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => value.startsWith('--') ? [...pairs, [value.slice(2), values[index + 1]]] : pairs, []))
if (!args.source || !args.output) throw new Error('Uso: npm run sync:teo-contexto -- --source ../teo-contexto --output public/data/fallback.bundle.json')

const result = materializeContext({ source: resolve(args.source) })
const output = resolve(args.output)
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(result.fallback, null, 2)}\n`)
console.log(`Fallback gerado: ${result.datasets.projects.projects.length} registros, ${result.datasets.quality.warnings.length} warnings, commit ${result.manifest.source.commit.slice(0, 12)}.`)
