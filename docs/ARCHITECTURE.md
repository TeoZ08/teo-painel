# Arquitetura — teo-painel

## Stack e limites

Aplicação local-first em Vite, React e TypeScript, com Vitest e Testing Library. Sem backend, variáveis de ambiente ou serviços externos no MVP.

Separar domínio (tipos e regras), persistência (leitura, validação, migração, backup e escrita) e interface (rotas, formulários e componentes).

## Entidades

`Project`, `ProgressUpdate`, `NextAction`, `PendingItem`, `Decision`, `Blocker`, `Milestone`, `HistoryEvent` e `WorkspaceSettings`. Todos os registros têm IDs estáveis e timestamps. Eventos registram uma ação legível e referenciam o item de origem, mas não são a fonte única dos dados.

## Persistência e schema

Um documento versionado em `localStorage`, na chave `teo-painel.workspace`, conterá `schemaVersion`, configurações e coleções. A primeira execução cria workspace vazio seguro. Leituras inválidas não sobrescrevem o valor original. A escrita valida a serialização antes de substituir o valor atual.

A importação valida formato, versão, IDs e relações antes de alterar o workspace. Antes de uma importação destrutiva, uma cópia do valor atual é preservada numa chave de backup versionada. Cada mudança terá função explícita e testada de `vN` para `vN+1`.

## Exportação, relatório e testes

O JSON exportado inclui versão de schema, data e documento do workspace. O relatório é determinístico e usa apenas informações registradas. Cobrir regras de domínio, persistência, migrações, importação/exportação e fluxos críticos de interface.

## Futuro, não implementado

Uma integração com `teo-contexto` poderá consumir ou publicar exportações versionadas por adaptador separado; domínio e formato local não dependem dela.
