import type { ReactNode } from 'react'

export type AppDestination = 'overview' | 'projects' | 'daily' | 'reviews' | 'reports' | 'data'

const destinations: Array<{ id: AppDestination; label: string; short: string; glyph: string }> = [
  { id: 'overview', label: 'Visão geral', short: 'Agora', glyph: '◐' },
  { id: 'projects', label: 'Projetos', short: 'Projetos', glyph: '▤' },
  { id: 'daily', label: 'Diário', short: 'Diário', glyph: '⌁' },
  { id: 'reviews', label: 'Revisões', short: 'Revisar', glyph: '◇' },
  { id: 'reports', label: 'Relatórios', short: 'Relatos', glyph: '↗' },
  { id: 'data', label: 'Dados', short: 'Dados', glyph: '⊹' },
]

interface AppShellProps {
  activeDestination: AppDestination
  onDestinationChange(destination: AppDestination): void
  sourceState: 'loading' | 'live' | 'cached' | 'fallback' | 'unavailable'
  onQuickUpdate(): void
  children: ReactNode
}

const sourceLabel = (state: AppShellProps['sourceState']) => ({
  loading: 'Conectando contexto',
  live: 'Contexto atualizado',
  cached: 'Cópia local',
  fallback: 'Fallback integrado',
  unavailable: 'Contexto indisponível',
}[state])

export function AppShell({ activeDestination, onDestinationChange, sourceState, onQuickUpdate, children }: AppShellProps) {
  return <main className="workbench">
    <aside className="rail" aria-label="Navegação principal">
      <div className="rail-brand"><span aria-hidden="true" className="brand-mark">t</span><span className="brand-name">teo</span></div>
      <nav className="rail-nav">
        {destinations.map((destination) => <button
          key={destination.id}
          type="button"
          className={activeDestination === destination.id ? 'rail-link is-active' : 'rail-link'}
          aria-current={activeDestination === destination.id ? 'page' : undefined}
          onClick={() => onDestinationChange(destination.id)}
        ><span aria-hidden="true" className="rail-glyph">{destination.glyph}</span><span>{destination.label}</span></button>)}
      </nav>
      <div className="rail-foot"><span className={`source-pulse is-${sourceState}`} aria-hidden="true" /><span>{sourceLabel(sourceState)}</span></div>
    </aside>
    <section className="workbench-stage">
      <header className="topbar">
        <p className="topbar-context"><span className="eyebrow">Contexto pessoal</span><span className="topbar-date">{new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' }).format(new Date())}</span></p>
        <button className="action-primary" onClick={onQuickUpdate}><span aria-hidden="true">+</span> Registrar atualização</button>
      </header>
      <div className="stage-content">{children}</div>
    </section>
    <nav className="mobile-nav" aria-label="Navegação móvel">
      {destinations.slice(0, 5).map((destination) => <button key={destination.id} type="button" className={activeDestination === destination.id ? 'mobile-link is-active' : 'mobile-link'} aria-current={activeDestination === destination.id ? 'page' : undefined} onClick={() => onDestinationChange(destination.id)}><span aria-hidden="true">{destination.glyph}</span><span>{destination.short}</span></button>)}
    </nav>
  </main>
}
