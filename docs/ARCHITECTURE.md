# Arquitetura — teo-painel

## Camadas

- `scripts/sync-teo-contexto.mjs`: parser Node executado no build; lê somente `main` e publica o contrato `schemaVersion: 1`.
- `public/data/teo-contexto.snapshot.json`: artefato estático sanitizado e revisável.
- `src/context-source/`: validação, cache offline, merge idempotente e changeset.
- `src/domain/` e `src/persistence/`: regras e backup do workspace local.
- `src/components/` e `src/App.tsx`: experiência React.

## Precedência e falha

O snapshot cria a base de projetos que ainda não existem no workspace. Registros locais ganham para tudo o que é operacional; o snapshot continua como contexto de leitura. O changeset inclui esses registros locais também para projetos que nasceram da fonte canônica. Se a busca falhar, o último snapshot validado no `localStorage` é usado; se não existir, o painel ainda preserva todos os registros locais.

## Deploy

GitHub Actions pode fazer checkout privado de `teo-contexto` apenas quando `TEO_CONTEXTO_READ_TOKEN` existe no runner. Sem ele, gera-se o site com o snapshot já commitado. O token não é exposto ao build cliente, aos logs ou ao Pages.
