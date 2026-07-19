# MVP — teo-painel

## Entregas

- Snapshot estático, versionado e sanitizado de projetos em `teo-contexto/main`.
- Merge idempotente do snapshot com workspace local, preservando dados locais e cache offline.
- Projetos, avanços, próximas ações, pendências, decisões, bloqueios, marcos, histórico, relatório e backup local.
- Changeset Markdown somente para revisão humana.
- Interface responsiva de atmosfera mineral, com estrutura compacta inspirada na referência de dashboard.

## Critérios de aceite

- O painel funciona sem rede depois de ter carregado um snapshot válido.
- Snapshot novo não apaga registros locais, nem duplica projetos importados.
- O browser não contém credencial nem chama a API do GitHub.
- A próxima ação local prevalece; sem ela, a sugestão canônica é claramente rotulada.
- Importação inválida não modifica o workspace e exclusão exige confirmação.
- O fluxo principal funciona por teclado e em 390 px.
