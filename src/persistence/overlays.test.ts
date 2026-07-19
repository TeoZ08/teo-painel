import { describe, expect, it } from 'vitest'
import { markChangesExported, pendingChanges, type ChangesetEntry } from './overlays'

const entry: ChangesetEntry = { id: 'a', projectId: 'useart', type: 'progress', content: 'Validado', relatedField: null, occurredAt: '2026-07-19', state: 'pending', exportedAt: null, consolidatedAt: null, baseCommit: null, origin: 'local' }
describe('changeset overlays', () => {
  it('marks pending entries as exported without changing their content', () => {
    const exported = markChangesExported([entry], ['a'], 'sha', '2026-07-19T00:00:00.000Z')
    expect(pendingChanges(exported)).toHaveLength(0)
    expect(exported[0]).toMatchObject({ content: 'Validado', state: 'exported', baseCommit: 'sha' })
  })
})
