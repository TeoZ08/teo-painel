# Sistema de interface — teo-painel

## Intent

Usuário: Matteo. Tarefa principal: registrar atualização e deixar a próxima ação inequívoca. Sensação: caderno de trabalho noturno, calmo, concentrado e vivo — não central corporativa.

### Domain

Projetos, atualizações, próximas ações, pendências, decisões, bloqueios, marcos, histórico e relatórios.

### Color world

Preto basalto, grafite azulado, ardósia profunda, ciano moderado, azul mineral, violeta ametista, magenta orquídea e branco frio.

### Signature

Trama mineral orgânica inspirada na referência, com contenção. Tipografia, agrupamento e ritmo fornecem a estrutura funcional.

### Defaults rejeitados

- Dashboard branco com cards e sombras → superfícies escuras e agrupamentos editoriais.
- Gradientes neon em toda tela → acentos pontuais e textura de baixa opacidade.
- Grade de métricas corporativas → registros e próximas ações, com números somente quando ajudarem a decidir.

## Tokens e hierarquia

Usar tokens CSS: `--surface-base`, `--surface-raised`, `--surface-muted`, `--text-primary`, `--text-muted`, `--accent-progress`, `--accent-context`, `--accent-alert`, `--border-subtle` e `--focus-ring`.

Espaçamento em 4, 8, 12, 16, 24, 32, 48 e 64 px; raios 8, 12 e 16 px; bordas 1 px de baixo contraste. Elevação vem de superfície e borda; sombra curta somente em diálogos e menus.

`Registrar atualização` é a única ação de alto destaque por contexto. Home prioriza projetos e próximas ações. Detalhe prioriza situação, última atualização e próxima ação, depois pendências, bloqueios, decisões, marcos e histórico.

## Estados, mobile e acessibilidade

Controles têm estado padrão, hover, foco visível, pressionado, desabilitado, erro, vazio e carregando quando aplicável. Em 1024 px reduzir conteúdo auxiliar; em 768 px reorganizar seções; em 390 px manter ação, situação e próxima ação primeiro. Usar alvos de toque adequados, contraste suficiente, foco claro, texto/ícone para estados e `prefers-reduced-motion`.

## Relação com referência e rejeições

A referência define clima cromático e agrupamentos orgânicos, não semântica nem navegação. Rejeitar slogans, hero, explicações longas, badges ornamentais, painéis de métricas sem ação e filtros avançados abertos.
