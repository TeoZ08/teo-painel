# teo-painel

Painel pessoal, local-first, para acompanhar projetos reais, registrar avanços e deixar a próxima ação inequívoca. A versão publicada recebe datasets JSON públicos e versionados do repositório canônico `TeoZ08/teo-contexto`; não há token, API do GitHub ou contexto privado no navegador.

## Uso

- A home traz os projetos disponíveis no snapshot e os projetos criados localmente.
- Registre avanços, próximas ações, pendências, decisões, bloqueios e marcos no browser.
- Registros locais prevalecem para operação diária e nunca são apagados por uma atualização do snapshot.
- Em **Dados**, exporte/importa o workspace JSON ou baixe um changeset Markdown para revisão manual antes de qualquer atualização em `teo-contexto`.

## Fonte de contexto

O materializador fixa `origin/main` em um SHA imutável e publica somente estes datasets sanitizados:

```sh
/v1/manifest.json
/v1/projects.json
/v1/daily.json
/v1/reviews.json
/v1/pipeline.json
/v1/quality.json
```

O fallback completo `fallback.bundle.json` é gerado exclusivamente no build do GitHub Pages:

```sh
npm run materialize:context -- --source ../teo-contexto --output public/fallback.bundle.json
```

O parser usa YAML v2 e fallback legado com warning. Ele não copia Markdown bruto, `.env`, credenciais, tokens, chaves, cookies, backups, bancos locais ou URLs privadas para os artefatos públicos.

No navegador, a ordem de degradação é: VPS → cache validado do navegador → fallback do GitHub Pages.

## Desenvolvimento e validação

Requer Node.js 20 ou superior.

```sh
npm install
npm run materialize:context -- --source ../teo-contexto --output public/fallback.bundle.json
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

## GitHub Pages

O workflow publica a partir da `main`, pode ser disparado manualmente e reconstrói o fallback durante o build. `TEO_CONTEXTO_READ_TOKEN` é necessário somente no runner para fazer checkout da fonte canônica; sem ele, o deploy falha em vez de publicar uma versão sem fallback válido. O secret nunca chega ao artefato estático.

Dados operacionais ficam em `localStorage` (`teo-painel.workspace`). A importação valida o formato antes de gravar e preserva uma cópia local do estado anterior.
