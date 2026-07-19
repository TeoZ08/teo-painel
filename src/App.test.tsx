import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

describe('technical project interface', () => {
  beforeEach(() => window.localStorage.clear())

  const openProjects = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getAllByRole('button', { name: 'Projetos' })[0])
  }

  it('creates, edits, deletes and restores a project through local storage', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await openProjects(user)
    await user.click(screen.getByRole('button', { name: /Criar projeto/ }))
    await user.type(screen.getByLabelText('Nome do projeto'), 'Painel pessoal')
    await user.type(screen.getByLabelText('Situação atual'), 'Criar persistência')
    await user.click(screen.getByRole('button', { name: 'Salvar projeto' }))
    expect(screen.getAllByText('Painel pessoal').length).toBeGreaterThan(0)
    await user.click(screen.getByLabelText('Mais ações para Painel pessoal'))
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const name = screen.getByLabelText('Nome do projeto')
    await user.clear(name)
    await user.type(name, 'Painel local')
    await user.click(screen.getByRole('button', { name: 'Salvar projeto' }))
    unmount()
    render(<App />)
    expect(screen.getAllByText('Painel local').length).toBeGreaterThan(0)
    await openProjects(user)
    await user.click(screen.getByLabelText('Mais ações para Painel local'))
    const confirm = window.confirm
    window.confirm = () => true
    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    window.confirm = confirm
    expect(screen.queryAllByText('Painel local')).toHaveLength(0)
  })

  it('shows an import failure without altering the page', async () => {
    render(<App />)
    const input = screen.getByLabelText('Selecionar arquivo para importar')
    const file = new File(['not json'], 'dados.json', { type: 'application/json' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(await screen.findByText('O arquivo não contém JSON válido.')).toBeInTheDocument()
  })

  it('does not hide a malformed local workspace behind an editable empty state', () => {
    window.localStorage.setItem('teo-painel.workspace', '{bad data')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Os dados locais precisam de revisão.' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Baixar cópia original' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Criar projeto' })).not.toBeInTheDocument()
  })

  it('records an advance and completes a next action from a project detail', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openProjects(user)
    await user.click(screen.getByRole('button', { name: /Criar projeto/ }))
    await user.type(screen.getByLabelText('Nome do projeto'), 'Projeto de fluxo')
    await user.type(screen.getByLabelText('Situação atual'), 'Organizar tarefas')
    await user.click(screen.getByRole('button', { name: 'Salvar projeto' }))
    await user.click(screen.getByRole('button', { name: /Projeto de fluxo/ }))
    await user.type(screen.getByLabelText('Registrar avanço'), 'Dados de teste concluídos')
    await user.click(screen.getByRole('button', { name: 'Registrar avanço' }))
    expect(screen.getAllByText('Dados de teste concluídos').length).toBeGreaterThan(0)
    await user.type(screen.getByLabelText('Definir uma ação local'), 'Revisar a documentação')
    await user.click(screen.getByRole('button', { name: 'Salvar ação' }))
    expect(screen.getByText('Revisar a documentação')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Concluir ação' }))
    expect(screen.getByText('Próxima ação concluída.')).toBeInTheDocument()
  })
})
