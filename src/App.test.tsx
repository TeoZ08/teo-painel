import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

describe('technical project interface', () => {
  beforeEach(() => window.localStorage.clear())

  it('creates, edits, deletes and restores a project through local storage', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(screen.getByRole('button', { name: 'Criar projeto' }))
    await user.type(screen.getByLabelText('Nome do projeto'), 'Painel pessoal')
    await user.type(screen.getByLabelText('Situação atual'), 'Criar persistência')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(screen.getByText('Painel pessoal')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const name = screen.getByLabelText('Nome do projeto')
    await user.clear(name)
    await user.type(name, 'Painel local')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    unmount()
    render(<App />)
    expect(screen.getByText('Painel local')).toBeInTheDocument()
    const confirm = window.confirm
    window.confirm = () => true
    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    window.confirm = confirm
    expect(screen.queryByText('Painel local')).not.toBeInTheDocument()
  })

  it('shows an import failure without altering the page', async () => {
    render(<App />)
    const input = screen.getByLabelText('Selecionar arquivo para importar')
    const file = new File(['not json'], 'dados.json', { type: 'application/json' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(await screen.findByText('O arquivo não contém JSON válido.')).toBeInTheDocument()
  })
})
