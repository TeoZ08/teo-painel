# Arquitetura — teo-painel

## Camadas

- `scripts/lib/materialize-context.mjs`: parser Node que faz `fetch origin main`, fixa o SHA remoto e materializa o contrato público `schemaVersion: 2`.
- `services/context-materializer/`: serviço interno, sem porta no host, que publica datasets em volume compartilhado de forma atômica.
- `fallback.bundle.json`: artefato completo sanitizado, gerado exclusivamente durante o build do GitHub Pages.
- `src/context-source/`: validação, cache offline, merge idempotente e changeset.
- `src/domain/` e `src/persistence/`: regras e backup do workspace local.
- `src/components/` e `src/App.tsx`: experiência React.

## Precedência e falha

O contexto canônico cria a base de projetos que ainda não existem no workspace. Registros locais ganham para tudo o que é operacional; o contexto continua como leitura. O changeset inclui esses registros locais também para projetos que nasceram da fonte canônica. A busca segue a ordem VPS → cache validado do navegador → `fallback.bundle.json`; se não houver contexto válido, o painel ainda preserva todos os registros locais.

## Deploy

GitHub Actions faz checkout privado de `teo-contexto` somente quando `TEO_CONTEXTO_READ_TOKEN` existe no runner. Sem ele, o build falha em vez de publicar uma versão sem fallback v2. O token não é exposto ao build cliente, aos logs ou ao Pages. O Caddy é a única borda pública do materializador: somente datasets estáticos `/v1/*`; o refresh é estritamente interno à rede Docker.
