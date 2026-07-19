# AGENTS.md — teo-painel

## Produto e prioridade

Este é o painel pessoal de Matteo para decidir o próximo passo e registrar atualizações. Em conflito, siga `docs/PRODUCT.md`, `docs/MVP.md`, a referência em `docs/references/`, `.interface-design/system.md`, `docs/ARCHITECTURE.md` e o pedido atual.

## Fonte de contexto e segurança

- `TeoZ08/teo-contexto`, branch `main`, é a fonte canônica de contexto; o painel recebe apenas um snapshot JSON público e versionado em build.
- O browser não chama GitHub e não recebe token. Nunca registre, imprima ou versione credenciais, `.env`, chaves, tokens, URLs privadas ou Markdown bruto da fonte.
- Dados locais prevalecem para operação: snapshot novo não pode apagar avanços, ações, pendências, decisões, bloqueios, marcos ou histórico.
- O changeset é somente uma proposta baixável para revisão humana; não há escrita automática em `teo-contexto`.

## Interface e validação

- Preserve o clima mineral escuro e o foco de trabalho; a referência de dashboard serve apenas para estrutura compacta de navegação, listas e controles.
- Garanta teclado, foco visível, estados além da cor e o fluxo em 390 px.
- Após mudanças relevantes, execute typecheck, lint, test, build, `git diff --check`, `git status` e `git diff`.
