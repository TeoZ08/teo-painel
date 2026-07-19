# Sentinela — política determinística

Este diretório contém somente regras reutilizáveis e testadas para o workflow do n8n. Não contém credenciais, clientes de IA, Docker socket, shell de host ou chamadas diretas à VPS.

- O gatilho agenda uma única execução às 22:30 em `America/Campo_Grande`.
- A execução pode consultar nos horários 22:30, 22:45, 23:00, 23:15 e 23:30, sempre interrompendo quando o SHA já foi revisado.
- Todo conteúdo de IA passa por redaction e limite em bytes.
- Gemini admite no máximo duas chamadas por execução; Groq é segunda opinião para `attention`/`blocked` ou fallback.
- O workflow deve chamar somente `POST http://context-materializer:8080/internal/refresh` depois de um evento autorizado, com token interno, pela rede Docker.
