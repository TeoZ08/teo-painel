import { describe, expect, it } from 'vitest'
import { publicText, validatePublicArtifact } from './materialize-context.mjs'

describe('materializador de contexto público', () => {
  it('remove URLs de texto extraído antes da publicação', () => {
    expect(publicText('Leia https://interno.example.test/dados agora.')).toBe('Leia [link removido] agora.')
  })

  it('recusa chaves e valores com aparência de segredo', () => {
    expect(() => validatePublicArtifact('projects', { apiToken: 'não publicar' })).toThrow('campo proibido')
    expect(() => validatePublicArtifact('projects', { description: '-----BEGIN PRIVATE KEY-----' })).toThrow('valor sensível')
  })

  it('aceita a forma pública mínima do manifesto', () => {
    expect(validatePublicArtifact('manifest', { schemaVersion: 2, source: { repository: 'TeoZ08/teo-contexto', ref: 'main', commit: 'abc' } })).toMatchObject({ schemaVersion: 2 })
  })
})
