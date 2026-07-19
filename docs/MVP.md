# MVP — teo-painel

## Funcionalidades

- Criar, editar, arquivar, reativar e excluir projetos com confirmação.
- Registrar avanços, próximas ações, pendências, decisões, bloqueios e marcos.
- Concluir ou resolver itens e preservar os eventos no histórico.
- Gerar relatório curto por período, copiar Markdown, baixar `.md` e imprimir.
- Exportar e importar todo o workspace em JSON validado.

## Fluxos

1. Criar projeto → informar nome e situação atual breve → abrir detalhe.
2. Registrar atualização → escolher projeto → escrever avanço → manter ou atualizar próxima ação.
3. Concluir ou resolver um item → gerar evento de histórico.
4. Selecionar projeto e período → revisar, copiar, baixar ou imprimir relatório.
5. Exportar JSON → importar somente após validação e backup local.

## Critérios de aceite

- O projeto continua disponível após recarregar.
- Avanços, decisões, conclusões e resoluções aparecem no histórico.
- A próxima ação é legível sem abrir áreas secundárias.
- Exclusão exige confirmação; importação inválida não altera os dados existentes.
- Exportações têm versão de schema e são reimportáveis de modo validado.
- Relatórios não incluem IDs, dados técnicos ou conclusões inventadas.
- A tarefa principal funciona em 390 px e por teclado.

## Estados vazios e mobile

Sem projetos, destacar somente `Criar projeto`. Sem próxima ação, convidar o registro sem indicar erro. Sem eventos no período, preservar o seletor. Em mobile, ação principal, situação e próxima ação precedem a navegação secundária e formulários usam toda a largura.

## Fora do escopo

GitHub, n8n, `teo-contexto`, backend, banco remoto, login, colaboração, sincronização automática, IA e deploy.
