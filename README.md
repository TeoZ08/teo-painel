# teo-painel

Painel pessoal e local-first para registrar avanços, manter próximas ações claras e gerar relatórios curtos por projeto.

## O que faz

- Cria, edita, arquiva, reativa e exclui projetos.
- Registra avanços, próximas ações, pendências, decisões, bloqueios e marcos.
- Mantém um histórico das mudanças relevantes.
- Guarda os dados somente no navegador.
- Exporta e importa um backup JSON versionado.
- Gera relatório por projeto, com período opcional, para copiar em Markdown, baixar ou imprimir.

## O que não faz

Não há login, backend, banco remoto, integração com GitHub, n8n ou `teo-contexto`, sincronização automática, IA ou deploy.

## Desenvolvimento local

Requer Node.js 20 ou superior.

```sh
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

## Validações

```sh
npm run typecheck
npm run lint
npm run test
npm run build
```

## Dados locais

O workspace é salvo em `localStorage` sob a chave `teo-painel.workspace`. Antes de substituir dados por uma importação válida, a aplicação preserva uma cópia local do estado anterior.

Exporte os dados regularmente pelo menu **Dados** na tela inicial. A exportação é compatível com a versão de schema indicada no arquivo; mudanças futuras deverão incluir migração explícita.
