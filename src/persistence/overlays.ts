export type ChangesetState = 'pending' | 'exported' | 'consolidated' | 'discarded'
export interface LocalProjectOverlay { projectId: string; currentSituation: string | null; nextAction: string | null; updatedAt: string }
export interface ChangesetEntry { id: string; projectId: string; type: 'progress' | 'next_action' | 'pending' | 'decision' | 'blocker' | 'milestone' | 'project'; content: string; relatedField: string | null; occurredAt: string; state: ChangesetState; exportedAt: string | null; consolidatedAt: string | null; baseCommit: string | null; origin: 'local' }

export const pendingChanges = (entries: ChangesetEntry[]) => entries.filter((entry) => entry.state === 'pending')
export const markChangesExported = (entries: ChangesetEntry[], ids: string[], baseCommit: string, at: string): ChangesetEntry[] => entries.map((entry) => ids.includes(entry.id) && entry.state === 'pending' ? { ...entry, state: 'exported', baseCommit, exportedAt: at } : entry)
