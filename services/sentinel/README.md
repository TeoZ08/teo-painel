# Sentinela — política e template sanitizado

Este diretório contém regras reutilizáveis e um template importável para o n8n.
Ele não contém credenciais, clientes de IA, Docker socket, shell de host, token
de refresh ou chamadas diretas à VPS.

## Artefatos

- `policy.mjs`: regras testáveis de janela, idempotência, redaction e limites.
- `workflow-template.json`: workflow **desativado** para importar no n8n depois
  de uma revisão humana.
- `workflow-template.test.mjs`: contrato estrutural do template; não substitui
  um teste controlado no n8n.

## Regras que o template preserva

- O gatilho abre uma única execução às 22:30 em `America/Campo_Grande`.
- A mesma execução consulta às 22:30, 22:45, 23:00, 23:15 e 23:30. Ela encerra
  antes disso quando encontra um SHA já comentado pela Sentinela.
- A marca idempotente é `<!-- sentinela-noturna:v1:head=SHA -->`.
- Regras determinísticas bloqueiam caminhos sensíveis antes da IA e não podem
  ser anuladas por uma resposta de modelo.
- Todo pacote de IA é redigido e limitado em bytes. Gemini é a rota principal;
  Groq só recebe uma segunda opinião para `attention` ou `blocked`.
- O refresh usa somente `POST http://context-materializer:8080/internal/refresh`
  na rede Docker. Ele nunca é publicado pelo Caddy.

## Importação controlada

O template usa apenas referências de credenciais, que devem ser criadas no
cofre criptografado do n8n e nunca no JSON:

1. `Sentinela GitHub`: token fine-grained independente, limitado ao repositório
   `TeoZ08/teo-contexto`, com leitura de pull requests e escrita de comentários
   e labels. Não conceder conteúdo de escrita, administração ou merge.
2. `Sentinela Gemini`: credencial de query para a chave Gemini.
3. `Sentinela Groq`: credencial de header para a chave Groq.
4. `Sentinela refresh interno`: header `Authorization: Bearer <token>` com o
   mesmo segredo interno configurado apenas no materializador.

Antes de ativar, criar os labels `sentinela:revisado`,
`sentinela:atencao` e `sentinela:bloqueado`; importar o JSON; associar as
credenciais a cada nó HTTP; executar manualmente contra um PR de teste; e
confirmar comentário único, ausência de merge e refresh interno. O workflow
permanece desativado se qualquer uma dessas condições não for demonstrada.
