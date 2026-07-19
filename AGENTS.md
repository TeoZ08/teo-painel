# AGENTS.md — teo-painel

## Produto

Este repositório contém um painel pessoal e interativo para Matteo acompanhar projetos. A tarefa principal é registrar avanços, organizar próximas ações e gerar uma visão curta e confiável do estado de cada projeto.

O painel não é ferramenta de compliance, observabilidade de repositórios, demonstrador de regras, leitor de metadados ou dashboard corporativo.

## Fontes e prioridade

Antes de implementar, leia somente os documentos necessários. Em conflito, siga: `docs/PRODUCT.md`, `docs/MVP.md`, a referência em `docs/references/`, `.interface-design/system.md`, `docs/ARCHITECTURE.md` e o pedido atual.

## Escopo e linguagem

- Priorize ações reais do usuário, com português natural e direto.
- O MVP local-first abrange projetos, avanços, próximas ações, pendências, decisões, bloqueios, marcos, histórico, relatórios e importação/exportação.
- Não integrar GitHub, n8n, `teo-contexto`, APIs, autenticação, backend, banco remoto, IA ou deploy.
- Separe domínio, persistência e interface; trate falhas locais; não armazene credenciais; preserve exportações com migrações explícitas.

## Interface e validação

- Consulte a referência, as notas visuais e o sistema de interface antes de mudanças visuais.
- Garanta teclado, telas pequenas, foco visível e estados que não dependam apenas de cor.
- Após mudanças relevantes, execute os scripts aplicáveis de typecheck, lint, test e build, além de `git diff --check`, `git status` e `git diff`.
