# teo-painel

Painel pessoal, local-first, para acompanhar projetos reais, registrar avanços e deixar a próxima ação inequívoca. A versão publicada usa um snapshot estático e revisável do repositório privado `TeoZ08/teo-contexto`; não há token, API ou sincronização do GitHub no navegador.

## Uso

- A home traz os projetos disponíveis no snapshot e os projetos criados localmente.
- Registre avanços, próximas ações, pendências, decisões, bloqueios e marcos no browser.
- Registros locais prevalecem para operação diária e nunca são apagados por uma atualização do snapshot.
- Em **Dados**, exporte/importa o workspace JSON ou baixe um changeset Markdown para revisão manual antes de qualquer atualização em `teo-contexto`.

## Fonte de contexto

O arquivo publicado em `public/data/teo-contexto.snapshot.json` contém somente dados públicos, estruturados e sanitizados. É gerado no build com:

```sh
npm run sync:teo-contexto -- --source ../teo-contexto --output public/data/teo-contexto.snapshot.json
```

O parser lê `main`, entende front matter simples e headings Markdown como fallback. Não copie Markdown bruto, `.env`, credenciais, tokens, chaves ou links privados para o snapshot.

## Desenvolvimento e validação

Requer Node.js 20 ou superior.

```sh
npm install
npm run sync:teo-contexto -- --source ../teo-contexto --output public/data/teo-contexto.snapshot.json
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

## GitHub Pages

O workflow publica a partir da `main`, pode ser disparado manualmente e tenta atualizar o snapshot a cada 6 horas. Quando o secret `TEO_CONTEXTO_READ_TOKEN` não está disponível, o deploy usa o snapshot revisado que já está commitado. O secret é usado apenas no runner, nunca no artefato estático.

Dados operacionais ficam em `localStorage` (`teo-painel.workspace`). A importação valida o formato antes de gravar e preserva uma cópia local do estado anterior.
