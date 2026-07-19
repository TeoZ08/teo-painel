import type { ReactNode } from 'react'

export type AppDestination = 'overview' | 'projects' | 'daily' | 'reviews' | 'reports' | 'data'

const destinations: Array<{ id: AppDestination; label: string }> = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'projects', label: 'Projetos' },
  { id: 'daily', label: 'Diário' },
  { id: 'reviews', label: 'Revisões' },
  { id: 'reports', label: 'Relatórios' },
  { id: 'data', label: 'Dados' },
]

interface AppShellProps {
  activeDestination: AppDestination
  onDestinationChange(destination: AppDestination): void
  children: ReactNode
}

export function AppShell({ activeDestination, onDestinationChange, children }: AppShellProps) {
  return <main className="app-shell">
    <nav className="destination-nav" aria-label="Navegação principal">
      {destinations.map((destination) => <button
        key={destination.id}
        type="button"
        className={activeDestination === destination.id ? 'destination-link is-active' : 'destination-link'}
        aria-current={activeDestination === destination.id ? 'page' : undefined}
        onClick={() => onDestinationChange(destination.id)}
      >{destination.label}</button>)}
    </nav>
    {children}
  </main>
}
