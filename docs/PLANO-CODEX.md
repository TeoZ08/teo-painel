# Plano completo — reconstrução do `teo-painel` com Codex no VS Code

## Finalidade deste arquivo

Este documento organiza a criação, do zero, de um painel pessoal e interativo para acompanhamento de projetos.

Ele foi preparado para ser usado com o Codex dentro do VS Code, com:

- inicialização local do repositório;
- uso de uma referência visual anexada por Matteo;
- divisão do trabalho em fases;
- agentes especializados e econômicos;
- seleção de modelos por complexidade;
- prompts prontos;
- validação por testes, revisão visual e Git;
- controle de consumo de tokens.

O produto não deve repetir o protótipo anterior, que priorizou auditoria, sinais técnicos e visualização somente leitura.

---

# 1. Definição central do produto

O produto é:

> Um espaço pessoal e interativo para registrar avanços, organizar próximas ações e gerar uma visão curta e confiável do estado de cada projeto.

O usuário inicial é Matteo.

A ferramenta deve permitir, com poucos cliques:

1. criar um projeto;
2. registrar um avanço;
3. atualizar a próxima ação;
4. adicionar uma pendência;
5. registrar uma decisão;
6. registrar ou remover um bloqueio;
7. acompanhar marcos;
8. consultar o histórico;
9. gerar um relatório curto;
10. exportar e importar os dados.

O produto não é:

- ferramenta de compliance;
- observabilidade de repositórios;
- leitor técnico de metadados;
- dashboard corporativo;
- gerenciador automático;
- demonstrador de regras;
- substituto do GitHub;
- substituto do `teo-contexto`;
- sistema multiusuário nesta fase.

---

# 2. Estado inicial considerado

Este plano considera que:

- o repositório `TeoZ08/teo-painel` já foi criado no GitHub;
- ele ainda não foi clonado ou inicializado no computador;
- o protótipo anterior não precisa ser importado;
- uma referência visual será fornecida em imagem;
- a implementação será feita pelo Codex no VS Code;
- o projeto deve começar localmente e permanecer privado;
- não haverá deploy na primeira rodada.

Caso o repositório remoto possua apenas um README, isso não é problema.

---

# 3. Preparação local

## 3.1. Escolher uma pasta de projetos

Exemplo:

```bash
mkdir -p ~/Projetos
cd ~/Projetos
```

## 3.2. Clonar o repositório

Via SSH:

```bash
git clone git@github.com:TeoZ08/teo-painel.git
cd teo-painel
```

Via HTTPS, caso o SSH não esteja configurado:

```bash
git clone https://github.com/TeoZ08/teo-painel.git
cd teo-painel
```

## 3.3. Conferir o estado

```bash
git status
git remote -v
git branch --show-current
ls -la
```

## 3.4. Criar a branch de reconstrução

```bash
git switch main
git pull --ff-only
git switch -c feat/rebuild-interactive-mvp
```

Não trabalhar diretamente na `main`.

## 3.5. Abrir no VS Code

```bash
code .
```

## 3.6. Copiar este plano para o repositório

Salve este arquivo no projeto como:

```text
docs/PLANO-CODEX.md
```

Ele será um guia de execução, não a especificação final do produto.

---

# 4. Referência visual

## 4.1. Onde colocar

Crie a pasta:

```bash
mkdir -p docs/references
```

Salve a imagem anexada por Matteo com um nome explícito, por exemplo:

```text
docs/references/referencia-visual-painel.png
```

Caso existam várias imagens:

```text
docs/references/
├── referencia-visual-home.png
├── referencia-visual-projeto.png
└── referencia-visual-mobile.png
```

Não use nomes genéricos como `image.png`, `print.png` ou `foto1.png`.

## 4.2. Como o Codex deve usar a referência

A referência visual deve orientar:

- hierarquia;
- densidade;
- organização da página;
- ritmo vertical;
- navegação;
- proporções;
- comportamento dos blocos;
- posicionamento de ações;
- sensação geral.

Ela não deve ser copiada cegamente.

O Codex não deve:

- copiar marca;
- copiar textos;
- copiar dados;
- presumir que toda decisão da imagem serve ao produto;
- reproduzir problemas de acessibilidade;
- inventar componentes só para preencher a tela.

## 4.3. Artefato de interpretação obrigatório

Antes de implementar a interface, criar:

```text
docs/VISUAL-REFERENCE-NOTES.md
```

Esse documento deve registrar:

- o que foi observado;
- o que será aproveitado;
- o que será adaptado;
- o que será rejeitado;
- como a referência será traduzida para desktop e mobile;
- quais decisões continuam específicas do `teo-painel`.

O documento deve ser curto. Não transformar a referência em uma análise acadêmica extensa.

---

# 5. Estratégia de modelos

Os nomes disponíveis podem variar no seletor do Codex. Use a seguinte ordem de preferência.

## 5.1. Modelo principal de engenharia

Preferência:

```text
GPT-5.3-Codex
```

Uso:

- implementação;
- arquitetura de código;
- bugs;
- testes;
- revisão de diff;
- tarefas agentivas no repositório.

Configuração cotidiana:

```text
reasoning: medium
```

Usar `high` apenas para:

- arquitetura inicial;
- migração de dados;
- bugs difíceis;
- revisão final;
- decisões com impacto amplo.

Evitar `xhigh` neste projeto, salvo falha comprovada das opções menores.

## 5.2. Modelo forte de produto

Preferência, quando disponível:

```text
GPT-5.6 Sol
```

Uso restrito:

- definição inicial do produto;
- decisão de arquitetura;
- resolução de conflito entre requisitos;
- revisão estratégica final.

Configuração:

```text
reasoning: high
```

Não usar como modelo cotidiano.

## 5.3. Modelo equilibrado

Preferência:

```text
GPT-5.6 Terra
```

Uso:

- crítica de UX;
- implementação visual normal;
- revisão de textos;
- testes de comportamento;
- revisão independente.

Configuração cotidiana:

```text
reasoning: medium
```

## 5.4. Modelo econômico

Preferência:

```text
GPT-5.6 Luna
```

Uso:

- localizar arquivos;
- listar scripts;
- pequenas alterações documentais;
- limpeza mecânica;
- resumo de logs;
- checagens simples e delimitadas.

Configuração:

```text
reasoning: low
```

Não delegar ao modelo econômico:

- arquitetura;
- modelo de dados;
- migração;
- decisão visual ampla;
- correção de bug sem causa conhecida;
- revisão final.

## 5.5. Matriz prática

| Tarefa | Modelo preferido | Raciocínio |
|---|---|---:|
| Definição do produto | GPT-5.6 Sol | high |
| Arquitetura inicial | GPT-5.3-Codex ou GPT-5.6 Sol | high |
| Implementação cotidiana | GPT-5.3-Codex | medium |
| Interface com referência | GPT-5.3-Codex ou GPT-5.6 Terra | medium |
| Exploração de arquivos | GPT-5.6 Luna | low |
| Textos e documentação simples | GPT-5.6 Luna | low |
| Crítica de UX | GPT-5.6 Terra | medium |
| Testes e revisão funcional | GPT-5.6 Terra | medium/high |
| Bug complexo | GPT-5.3-Codex | high |
| Revisão final do produto | GPT-5.3-Codex ou GPT-5.6 Sol | high |

## 5.6. Regra de economia

Antes de aumentar modelo ou raciocínio, verificar:

1. o escopo está claro?
2. o arquivo correto foi identificado?
3. existe um erro reproduzível?
4. há evidência concreta?
5. uma tarefa grande pode ser dividida?

Muitos desperdícios vêm de prompts vagos, não de falta de capacidade do modelo.

---

# 6. Arquitetura dos agentes

Use um agente principal e, no máximo, três agentes especializados.

Somente o agente principal escreve em arquivos compartilhados.

## 6.1. Agente principal — Orquestrador/Implementador

Modelo:

```text
GPT-5.3-Codex
```

Responsabilidades:

- ler o prompt da fase;
- consultar apenas os documentos relevantes;
- preservar o escopo;
- implementar;
- executar testes;
- revisar o diff;
- consolidar achados dos subagentes;
- fazer commits.

O agente principal não deve delegar a implementação principal.

## 6.2. `repo_scout`

Modelo:

```text
GPT-5.6 Luna / low
```

Modo:

```text
somente leitura
```

Responsabilidades:

- localizar arquivos;
- descobrir scripts;
- mapear fluxo existente;
- informar dependências relevantes;
- devolver resumo curto.

Não deve:

- alterar código;
- decidir arquitetura;
- produzir longos relatórios;
- reler o repositório inteiro sem necessidade.

## 6.3. `ux_critic`

Modelo:

```text
GPT-5.6 Terra / medium
```

Modo:

```text
somente leitura
```

Responsabilidades:

- avaliar utilidade diária;
- verificar clareza da ação principal;
- detectar linguagem genérica de IA;
- verificar excesso de informação;
- comparar a implementação com a referência visual;
- revisar desktop e mobile.

## 6.4. `verifier`

Modelo:

```text
GPT-5.3-Codex high
```

Alternativa econômica:

```text
GPT-5.6 Terra high
```

Modo:

```text
somente leitura
```

Responsabilidades:

- revisar requisitos;
- revisar diff;
- verificar regressões;
- verificar testes;
- identificar escopo excedido;
- procurar riscos de perda de dados;
- declarar bloqueadores.

---

# 7. Configuração do Codex

Crie:

```text
.codex/
├── config.toml
└── agents/
    ├── repo-scout.toml
    ├── ux-critic.toml
    └── verifier.toml
```

## 7.1. `.codex/config.toml`

```toml
[agents]
max_threads = 3
max_depth = 1
interrupt_message = false
```

Objetivos:

- impedir delegação excessiva;
- impedir que subagentes criem outros agentes;
- reduzir consumo e conflitos;
- manter controle no agente principal.

## 7.2. `.codex/agents/repo-scout.toml`

```toml
name = "repo_scout"
description = "Explorador econômico e somente leitura para localizar arquivos, fluxos e comandos relevantes."
model = "gpt-5.6-luna"
model_reasoning_effort = "low"
sandbox_mode = "read-only"

developer_instructions = """
Trabalhe somente em modo de exploração.

Localize apenas os arquivos materialmente relevantes para a tarefa.
Prefira buscas direcionadas a leituras amplas do repositório.
Não altere arquivos.
Não proponha reformulações gerais.
Não reproduza arquivos inteiros ou logs extensos.

Retorne no máximo:
- arquivos relevantes;
- fluxo identificado;
- comandos existentes;
- riscos objetivos;
- lacunas que o agente principal precisa resolver.
"""
```

Caso o nome do modelo não esteja disponível no Codex, use o modelo econômico oferecido no seletor ou remova a linha `model`, preservando `low` e `read-only`.

## 7.3. `.codex/agents/ux-critic.toml`

```toml
name = "ux_critic"
description = "Crítico de produto e UX focado em utilidade diária, clareza, interação e linguagem natural."
model = "gpt-5.6-terra"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"

developer_instructions = """
Avalie o produto pela perspectiva de Matteo, não pela perspectiva da arquitetura interna.

Consulte a referência visual indicada pelo agente principal.

Verifique:
- se a ação principal está evidente;
- se é fácil registrar avanços;
- se é fácil descobrir a próxima ação;
- se o relatório é curto e útil;
- se há conceitos técnicos expostos sem necessidade;
- se os textos parecem genéricos ou escritos por IA;
- se a hierarquia visual funciona;
- se desktop e mobile preservam a tarefa principal;
- se a referência visual foi interpretada, não copiada mecanicamente.

Não altere arquivos.
Não redesenhe tudo por preferência estética.
Retorne no máximo dez achados, ordenados por impacto.
Cada achado deve conter problema, evidência e recomendação objetiva.
"""
```

## 7.4. `.codex/agents/verifier.toml`

```toml
name = "verifier"
description = "Revisor final independente de requisitos, comportamento, testes, segurança e escopo."
model = "gpt-5.3-codex"
model_reasoning_effort = "high"
sandbox_mode = "read-only"

developer_instructions = """
Revise a implementação como um mantenedor independente.

Compare:
- documentos do produto;
- critérios de aceite;
- referência visual e suas notas;
- comportamento implementado;
- diff da branch;
- testes existentes;
- resultados de build, lint e typecheck.

Priorize:
- comportamento incorreto;
- regressões;
- perda de dados;
- fluxos quebrados;
- interação insuficiente;
- testes que não comprovam o requisito;
- código fora do escopo;
- complexidade sem necessidade;
- inconsistência entre desktop e mobile.

Não altere arquivos.
Não faça comentários exclusivamente estéticos.
Retorne achados por gravidade, com arquivos e evidências.
Declare explicitamente quando não houver achados bloqueadores.
"""
```

---

# 8. `AGENTS.md` do projeto

Criar na raiz:

```markdown
# AGENTS.md — teo-painel

## Produto

Este repositório contém um painel pessoal e interativo para Matteo acompanhar seus projetos.

A tarefa principal do produto é:

> Registrar avanços, organizar próximas ações e gerar uma visão curta e confiável do estado de cada projeto.

O painel não é um demonstrador de regras, uma ferramenta de compliance ou um observador técnico de repositórios.

## Fontes internas

Antes de implementar uma tarefa, consulte somente os documentos relevantes:

- `docs/PRODUCT.md`
- `docs/MVP.md`
- `docs/ARCHITECTURE.md`
- `docs/VISUAL-REFERENCE-NOTES.md`
- `.interface-design/system.md`

Não releia todos os documentos em toda alteração.

Em caso de conflito:

1. `docs/PRODUCT.md`;
2. `docs/MVP.md`;
3. referência visual fornecida por Matteo;
4. `.interface-design/system.md`;
5. `docs/ARCHITECTURE.md`;
6. prompt da tarefa.

A referência visual orienta forma e hierarquia. Os requisitos do produto orientam comportamento.

## Organização dos agentes

- O agente principal é o único responsável por escrever código compartilhado.
- Subagentes devem ser usados apenas quando a tarefa puder ser delimitada claramente.
- Não use subagentes para repetir a mesma análise.
- Prefira subagentes de leitura para exploração, crítica de UX e revisão.
- Nunca permita que dois agentes alterem os mesmos arquivos simultaneamente.
- Não use delegação automática ou ampla.
- Use no máximo dois subagentes por etapa.

## Produto e linguagem

- Priorize ações reais do usuário, não metadados internos.
- A tela deve favorecer registrar avanço, definir próxima ação e consultar o estado atual.
- Evite textos genéricos de IA.
- Evite títulos abstratos, slogans e explicações conceituais na interface.
- Use português natural, direto e específico.
- Conceitos técnicos devem ficar em áreas secundárias.
- Não exponha arquitetura interna como conteúdo principal.
- Não use cards, badges, filtros ou indicadores sem utilidade clara.

## Escopo do MVP

O MVP é local e interativo.

Deve permitir:

- criar e editar projetos;
- registrar avanços;
- criar próximas ações e pendências;
- registrar decisões;
- registrar e remover bloqueios;
- acompanhar marcos;
- visualizar histórico;
- gerar relatório resumido;
- exportar e importar dados.

Não integrar nesta fase:

- GitHub;
- n8n;
- `teo-contexto`;
- APIs externas;
- autenticação remota;
- banco ou backend;
- IA para classificar projetos;
- deploy em VPS.

## Implementação

- Faça alterações em escopo pequeno e verificável.
- Não refatore áreas não relacionadas.
- Não adicione dependências sem necessidade comprovada.
- Separe domínio, persistência e interface.
- Trate falhas de leitura e gravação de dados.
- Não armazene credenciais.
- Preserve compatibilidade dos dados exportados.
- Crie migração explícita quando o schema local mudar.

## Interface

Antes de mudanças visuais, consulte:

- a referência em `docs/references/`;
- `docs/VISUAL-REFERENCE-NOTES.md`;
- `.interface-design/system.md`.

A interface deve:

- parecer uma ferramenta pessoal;
- ter boa densidade sem poluição;
- evitar visual corporativo genérico;
- possuir uma ação principal evidente;
- funcionar por teclado;
- funcionar em telas pequenas;
- comunicar estado sem depender apenas de cor;
- evitar animações sem função.

## Validação

Após mudanças relevantes, execute os comandos aplicáveis:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Revise também:

```bash
git status
git diff --check
git diff
```

## Entrega

Ao terminar uma etapa, informe apenas:

- o que foi implementado;
- arquivos principais;
- testes executados;
- limitações reais;
- decisões que exigem validação humana.

Não gere relatórios longos sobre tarefas triviais.
```

---

# 9. Documentos permanentes

A implementação deve ser guiada por documentos curtos.

```text
docs/
├── PRODUCT.md
├── MVP.md
├── ARCHITECTURE.md
├── VISUAL-REFERENCE-NOTES.md
├── PLANO-CODEX.md
└── references/
    └── referencia-visual-painel.png

.interface-design/
└── system.md
```

## 9.1. `docs/PRODUCT.md`

Deve registrar:

- problema;
- usuário;
- tarefa principal;
- resultado esperado;
- experiência diária;
- vocabulário;
- o que o produto não é.

## 9.2. `docs/MVP.md`

Deve registrar:

- funcionalidades;
- fluxos;
- critérios de aceite;
- estados vazios;
- fora do escopo;
- dados mínimos;
- comportamento mobile.

## 9.3. `docs/ARCHITECTURE.md`

Deve registrar:

- stack;
- entidades;
- persistência;
- schema;
- importação/exportação;
- migrações;
- limites;
- testes;
- futura integração, sem implementá-la.

## 9.4. `.interface-design/system.md`

Deve registrar:

- intenção;
- hierarquia;
- tokens;
- tipografia;
- espaçamento;
- componentes;
- estados;
- mobile;
- acessibilidade;
- relação com a referência visual;
- palavras e padrões rejeitados.

---

# 10. Fluxo de trabalho por fases

Cada fase deve usar uma conversa nova no Codex.

Não acumular toda a implementação em uma única conversa.

## Fase 00 — produto e documentação

Modelo:

```text
GPT-5.6 Sol high
```

Alternativa:

```text
GPT-5.3-Codex high
```

Resultado:

- documentos;
- configuração dos agentes;
- nenhuma aplicação criada.

## Fase 01 — bootstrap, domínio e persistência

Modelo:

```text
GPT-5.3-Codex medium
```

Resultado:

- Vite;
- React;
- TypeScript;
- testes;
- tipos;
- schema;
- armazenamento local;
- CRUD;
- importação/exportação.

Sem interface final.

## Fase 02 — fluxos interativos

Modelo:

```text
GPT-5.3-Codex medium
```

Resultado:

- criar projeto;
- registrar avanço;
- próxima ação;
- pendência;
- decisão;
- bloqueio;
- marco;
- histórico.

## Fase 03 — interface baseada na referência

Modelo:

```text
GPT-5.3-Codex medium
```

Subagente:

```text
ux_critic
```

Resultado:

- tela inicial;
- detalhe;
- navegação;
- formulários;
- responsividade;
- comparação visual.

## Fase 04 — relatório

Modelo:

```text
GPT-5.3-Codex medium
```

Resultado:

- relatório curto;
- seleção de período;
- copiar Markdown;
- impressão;
- exportação.

## Fase 05 — revisão final

Modelo:

```text
GPT-5.3-Codex high
```

Subagente:

```text
verifier
```

Resultado:

- correções;
- validação;
- PR em rascunho.

---

# 11. Prompt 00 — definição antes do código

Copiar em uma conversa nova do Codex.

```markdown
Você está iniciando do zero a nova versão do projeto `TeoZ08/teo-painel`.

Trabalhe na branch `feat/rebuild-interactive-mvp`.

## Situação

O repositório foi criado no GitHub e acabou de ser clonado no computador.

Não existe uma implementação aprovada que precise ser preservada.

Existe uma referência visual fornecida por Matteo em:

`docs/references/`

Localize a imagem pelo nome disponível nessa pasta.

Um protótipo anterior foi rejeitado porque priorizou auditoria, sinais derivados, metadados técnicos e visualização somente leitura.

O novo produto não deve repetir:

- ausência de edição;
- excesso de filtros;
- linguagem de compliance;
- conceitos internos exibidos na tela;
- textos genéricos de IA;
- grandes blocos explicativos;
- hero desnecessário;
- dashboard corporativo;
- informação sem ação.

## Objetivo desta etapa

Não implemente a aplicação.

Defina corretamente o produto e prepare os documentos que orientarão as próximas conversas do Codex.

## Leitura inicial

Leia:

- `docs/PLANO-CODEX.md`;
- a referência em `docs/references/`.

Não procure o protótipo antigo.

## Arquivos obrigatórios

Crie:

- `docs/PRODUCT.md`
- `docs/MVP.md`
- `docs/ARCHITECTURE.md`
- `docs/VISUAL-REFERENCE-NOTES.md`
- `.interface-design/system.md`
- `AGENTS.md`
- `.codex/config.toml`
- `.codex/agents/repo-scout.toml`
- `.codex/agents/ux-critic.toml`
- `.codex/agents/verifier.toml`

Use as configurações fornecidas em `docs/PLANO-CODEX.md`.

## Definição central

O produto é:

> Um espaço pessoal e interativo para registrar avanços, organizar próximas ações e gerar uma visão curta e confiável do estado de cada projeto.

O produto não é:

- observabilidade de repositórios;
- compliance;
- sistema corporativo;
- gerenciador automático;
- leitor de metadados;
- demonstrador de regras;
- dashboard decorativo.

## Usuário

O único usuário inicial é Matteo.

Ele precisa conseguir, com poucos cliques:

1. abrir um projeto;
2. registrar o que avançou;
3. atualizar a próxima ação;
4. adicionar uma pendência;
5. registrar uma decisão;
6. informar um bloqueio;
7. visualizar avanços recentes;
8. gerar um relatório curto.

## MVP pretendido

O MVP será local-first e funcionará sem serviços externos.

Funcionalidades esperadas:

- projetos;
- avanços;
- próximas ações;
- pendências;
- decisões;
- bloqueios;
- marcos;
- histórico;
- relatórios;
- importação e exportação.

Nesta fase não haverá:

- GitHub;
- n8n;
- `teo-contexto`;
- backend;
- autenticação;
- deploy;
- IA classificadora;
- banco remoto;
- sincronização automática.

## Referência visual

Analise a referência fornecida.

Registre em `docs/VISUAL-REFERENCE-NOTES.md`:

- estrutura percebida;
- hierarquia;
- densidade;
- padrões aproveitáveis;
- adaptações necessárias;
- elementos que não devem ser copiados;
- tradução para desktop e mobile.

A referência visual orienta aparência e composição.

Os documentos de produto orientam comportamento.

Não copie marca, conteúdo ou dados da referência.

## Persistência

Analise e documente uma estratégia local apropriada.

Considere:

- segurança contra perda acidental;
- exportação em JSON;
- importação com validação;
- versão de schema;
- futuras migrações;
- possibilidade de integração posterior com o `teo-contexto`.

Não implemente integração externa.

## Linguagem

Use português natural e direto.

Evite expressões como:

- recorte operacional;
- evidência derivada;
- prioridade calculada;
- estado normalizado;
- metadado obrigatório;
- sinal de atenção;
- fonte canônica;
- contexto operacional.

Esses conceitos podem existir internamente, mas não devem dominar a interface.

## Agente de UX

Depois de escrever a primeira versão dos documentos, delegue uma única revisão ao agente `ux_critic`.

Peça que ele avalie:

- clareza da tarefa principal;
- utilidade diária;
- fluxo de registro;
- simplicidade do relatório;
- interpretação da referência visual;
- risco de repetir o produto anterior;
- linguagem artificial.

Incorpore somente críticas justificadas.

Não use outros subagentes nesta etapa.

## Validação

Execute:

```bash
git diff --check
git status
git diff
```

## Saída

Ao finalizar:

1. apresente a árvore dos documentos criados;
2. resuma a definição do produto em até dez linhas;
3. liste as principais entidades;
4. liste os fluxos do MVP;
5. liste decisões ainda não implementadas;
6. confirme que nenhum código da aplicação foi implementado;
7. confirme que nenhum serviço externo foi conectado;
8. pare e aguarde revisão humana.

Não inicialize React ou Vite nesta etapa.
Não implemente componentes.
Não abra PR ainda.
```

---

# 12. Prompt 01 — bootstrap, domínio e persistência

Executar somente após revisar e aprovar os documentos da Fase 00.

```markdown
Implemente a Fase 01 do `teo-painel`.

Trabalhe na branch atual `feat/rebuild-interactive-mvp`.

## Fonte de verdade

Leia somente:

- `AGENTS.md`;
- `docs/PRODUCT.md`;
- `docs/MVP.md`;
- `docs/ARCHITECTURE.md`.

Não implemente interface final nesta fase.

## Objetivo

Criar a base técnica local-first:

- Vite;
- React;
- TypeScript;
- Vitest;
- lint;
- typecheck;
- domínio;
- armazenamento local;
- importação e exportação;
- testes.

## Requisitos técnicos

Implemente entidades para:

- projeto;
- avanço;
- próxima ação;
- pendência;
- decisão;
- bloqueio;
- marco;
- evento de histórico;
- configuração do workspace.

Defina:

- IDs estáveis;
- timestamps;
- versão do schema;
- validação de importação;
- migração explícita;
- backup antes de importação destrutiva;
- tratamento de JSON inválido;
- recuperação segura quando o armazenamento estiver vazio.

## Persistência

Use a estratégia aprovada em `docs/ARCHITECTURE.md`.

Não use:

- backend;
- Supabase;
- Firebase;
- banco remoto;
- API externa;
- `.env`;
- GitHub;
- n8n.

## Interface permitida

Crie apenas uma interface técnica mínima para provar:

- criação;
- leitura;
- edição;
- remoção;
- persistência após recarregar;
- exportação;
- importação.

Não faça o design final.

## Testes obrigatórios

Teste:

1. criação de projeto;
2. edição;
3. remoção;
4. persistência;
5. exportação;
6. importação válida;
7. importação inválida;
8. migração;
9. integridade das relações;
10. prevenção de perda silenciosa.

## Validação

Execute:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
git diff --check
git status
```

## Git

Faça commits pequenos.

Sugestão:

```text
chore: initialize interactive panel
feat: add local project domain
feat: add versioned local persistence
test: cover project storage and import
```

## Saída

Informe:

- estrutura criada;
- modelo de dados;
- persistência escolhida;
- testes;
- limitações;
- confirmação de ausência de serviços externos.

Não abra PR.
Pare ao concluir a base.
```

---

# 13. Prompt 02 — fluxos interativos

```markdown
Implemente a Fase 02 do `teo-painel`.

## Fonte de verdade

Leia:

- `AGENTS.md`;
- `docs/PRODUCT.md`;
- `docs/MVP.md`;
- `docs/ARCHITECTURE.md`.

Preserve a base da Fase 01.

## Objetivo

Implementar os fluxos reais de trabalho do usuário.

## Fluxos obrigatórios

### Projeto

- criar;
- editar;
- arquivar;
- reativar;
- excluir com confirmação.

### Avanço

- registrar descrição curta;
- data;
- relação com o projeto;
- registrar no histórico.

### Próxima ação

- criar;
- editar;
- concluir;
- substituir;
- manter histórico da conclusão.

### Pendência

- criar;
- editar;
- marcar como concluída;
- remover.

### Decisão

- registrar decisão;
- registrar justificativa opcional;
- registrar data;
- preservar no histórico.

### Bloqueio

- registrar;
- editar;
- resolver;
- manter evento de resolução.

### Marco

- criar;
- definir data opcional;
- concluir;
- registrar no histórico.

## Experiência

As ações devem exigir poucos passos.

Não obrigue o usuário a preencher campos técnicos.

Não use linguagem abstrata.

Não implemente ainda o acabamento visual final.

## Testes

Crie testes de domínio e de componentes para os fluxos críticos.

Teste especialmente:

- registros no histórico;
- conclusão de ações;
- resolução de bloqueio;
- arquivamento;
- relações entre itens;
- recarregamento dos dados.

## Validação

Execute todos os scripts.

Revise o diff.

## Saída

Informe:

- fluxos implementados;
- testes;
- decisões de interação;
- pontos ainda provisórios.

Não abra PR.
```

---

# 14. Prompt 03 — interface com referência visual

```markdown
Implemente a Fase 03 do `teo-painel`.

## Fonte de verdade

Leia:

- `AGENTS.md`;
- `docs/PRODUCT.md`;
- `docs/MVP.md`;
- `docs/VISUAL-REFERENCE-NOTES.md`;
- `.interface-design/system.md`;
- a imagem em `docs/references/`.

Preserve domínio, persistência e fluxos existentes.

## Objetivo

Construir a interface principal baseada na referência visual, adaptada às necessidades reais do produto.

## Tela inicial

Priorize:

- botão `Registrar atualização`;
- projetos recentes;
- projetos com próxima ação;
- últimas atualizações;
- bloqueios ativos;
- busca simples;
- acesso rápido a cada projeto.

Evite:

- hero;
- slogan;
- explicações do sistema;
- excesso de indicadores;
- filtros avançados abertos;
- cards repetitivos;
- conceitos técnicos.

## Página do projeto

Priorize:

1. situação atual;
2. última atualização;
3. próxima ação;
4. ações rápidas;
5. pendências;
6. bloqueios;
7. decisões;
8. marcos;
9. histórico.

Ações rápidas:

- registrar avanço;
- atualizar próxima ação;
- nova pendência;
- registrar decisão;
- registrar bloqueio.

## Formulários

Devem:

- ser curtos;
- usar rótulos claros;
- preservar dados ao cancelar;
- mostrar erros próximos ao campo;
- funcionar por teclado;
- confirmar ações destrutivas.

## Referência visual

Use a referência para:

- composição;
- proporções;
- hierarquia;
- densidade;
- navegação;
- tratamento de superfícies.

Não copie:

- marca;
- conteúdo;
- estrutura que conflite com o produto;
- problemas de acessibilidade.

## Responsividade

Validar pelo menos:

- 1440 px;
- 1024 px;
- 768 px;
- 390 px.

Não resolver mobile apenas empilhando tudo sem prioridade.

## Revisão com agente

Após a primeira versão:

1. execute a aplicação;
2. capture ou inspecione home, detalhe e formulários;
3. delegue revisão ao `ux_critic`;
4. peça comparação com `PRODUCT.md`, `MVP.md` e a referência;
5. incorpore apenas achados justificados.

## Validação visual

Verifique:

- ação principal;
- hierarquia;
- textos;
- densidade;
- alinhamentos;
- estados vazios;
- erros;
- foco;
- contraste;
- redução de movimento;
- desktop e mobile.

## Validação técnica

Execute:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
git diff --check
```

## Saída

Informe:

- telas implementadas;
- como a referência foi adaptada;
- achados do `ux_critic`;
- correções;
- pontos ainda não finais.

Não abra PR.
```

---

# 15. Prompt 04 — relatório

```markdown
Implemente a Fase 04 do `teo-painel`.

## Fonte de verdade

Leia:

- `AGENTS.md`;
- `docs/PRODUCT.md`;
- `docs/MVP.md`;
- `.interface-design/system.md`.

## Objetivo

Criar um relatório curto e realmente utilizável.

## Conteúdo padrão

O relatório de um projeto deve incluir:

- nome;
- situação atual;
- período;
- avanços;
- decisões;
- bloqueios;
- pendências relevantes;
- próximas ações;
- marcos concluídos;
- data da geração.

## Regras

- não incluir detalhes técnicos internos;
- não incluir IDs;
- não incluir linguagem de auditoria;
- não gerar parágrafos genéricos;
- não inventar conclusões;
- não classificar o projeto por IA;
- usar somente informações registradas.

## Formatos

Implementar:

- visualização na aplicação;
- copiar em Markdown;
- baixar `.md`;
- impressão limpa;
- período configurável.

## Resultado esperado

Exemplo:

```text
Projeto: useART
Situação: Preparação para lançamento

Avanços
- Catálogo responsivo concluído.
- Imagens oficiais incorporadas.
- Checkout validado.

Decisões
- A refatoração visual será realizada posteriormente no Figma.

Bloqueios
- Faltam informações finais de alguns produtos.

Próximas ações
1. Revisar a PR de conteúdo.
2. Validar os assets restantes.
```

## Testes

Teste:

- projeto sem avanço;
- projeto sem bloqueio;
- período sem eventos;
- ordenação cronológica;
- caracteres especiais;
- exportação;
- ausência de informações inventadas.

## Validação

Execute todos os scripts e revise o resultado impresso.

Não abra PR.
```

---

# 16. Prompt 05 — revisão final e PR

```markdown
Execute a revisão final da branch `feat/rebuild-interactive-mvp`.

## Fonte de verdade

Leia:

- `AGENTS.md`;
- `docs/PRODUCT.md`;
- `docs/MVP.md`;
- `docs/ARCHITECTURE.md`;
- `docs/VISUAL-REFERENCE-NOTES.md`;
- `.interface-design/system.md`;
- a referência visual.

## Etapa 1 — validação completa

Execute:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
git diff --check
git status
```

## Etapa 2 — revisão independente

Delegue ao agente `verifier`.

Forneça:

- requisitos;
- diff;
- resultados dos comandos;
- telas principais;
- referência visual.

Peça achados por gravidade.

## Etapa 3 — correção

O agente principal deve corrigir:

- todos os bloqueadores;
- regressões confirmadas;
- risco de perda de dados;
- fluxo quebrado;
- problemas graves de responsividade;
- textos artificiais relevantes;
- testes insuficientes para requisitos centrais.

Não faça refatorações opcionais grandes.

## Etapa 4 — inspeção de produto

Confirme manualmente:

- criar projeto;
- editar projeto;
- registrar avanço;
- alterar próxima ação;
- criar pendência;
- concluir pendência;
- registrar decisão;
- criar e resolver bloqueio;
- concluir marco;
- recarregar sem perder dados;
- exportar;
- importar;
- gerar relatório;
- usar em 390 px;
- navegar por teclado.

## Etapa 5 — Git

Revise:

```bash
git diff
git log --oneline --decorate -n 15
git status
```

Atualize o README.

Abra um PR em rascunho.

Não faça merge.
Não faça deploy.

## Corpo do PR

Inclua:

- objetivo;
- problema do protótipo anterior;
- fluxos implementados;
- persistência;
- referência visual utilizada;
- validações;
- testes;
- limitações;
- o que não foi integrado;
- checklist manual.

## Saída final

Informe:

- branch;
- commits;
- link do PR;
- testes;
- revisão do `verifier`;
- limitações;
- confirmação de ausência de deploy;
- confirmação de ausência de serviços externos;
- confirmação de árvore limpa.
```

---

# 17. Política para economizar tokens

## 17.1. Uma conversa por fase

Não executar todas as fases na mesma conversa.

Criar uma conversa nova para:

- documentos;
- domínio;
- interação;
- interface;
- relatório;
- revisão.

## 17.2. Não pedir releitura total

Cada prompt já indica os documentos necessários.

Não usar:

```text
Leia todo o repositório e todo o teo-contexto.
```

Usar:

```text
Leia AGENTS.md, PRODUCT.md e os arquivos diretamente envolvidos.
```

## 17.3. Delegar somente tarefas independentes

Bom uso:

- localizar arquivos;
- revisar UX;
- revisar diff.

Mau uso:

- dois agentes implementando a mesma tela;
- três agentes propondo arquitetura;
- agentes reescrevendo documentos simultaneamente;
- delegação ampla sem critério.

## 17.4. Limitar relatórios

Os subagentes devem devolver:

- poucos achados;
- evidência;
- recomendação.

Não pedir narrativas extensas.

## 17.5. Não usar modelo forte para tarefas mecânicas

Usar Luna/low para:

- procurar arquivos;
- listar scripts;
- alterar títulos;
- corrigir pequenas inconsistências documentais;
- resumir logs.

## 17.6. Não usar modelo pequeno para decisões amplas

Arquitetura ruim custa mais tokens depois.

Usar o modelo forte uma vez na definição e economizar na implementação.

## 17.7. Exigir evidência antes de refatorar

Não aceitar:

```text
Acho que seria melhor reestruturar tudo.
```

Exigir:

- problema;
- arquivo;
- impacto;
- critério de aceite;
- alternativa mínima.

---

# 18. Checklist de início

Antes de abrir o Codex:

- [ ] Repositório privado criado no GitHub.
- [ ] Repositório clonado no computador.
- [ ] Branch `feat/rebuild-interactive-mvp` criada.
- [ ] Este arquivo salvo em `docs/PLANO-CODEX.md`.
- [ ] Referência visual salva em `docs/references/`.
- [ ] VS Code aberto na raiz do projeto.
- [ ] Codex conectado.
- [ ] Prompt 00 selecionado.
- [ ] Modelo forte usado apenas para a Fase 00.

---

# 19. Checklist antes do PR

- [ ] Produto permite registrar informações.
- [ ] Produto permite editar informações.
- [ ] Dados persistem após recarregar.
- [ ] Exportação funciona.
- [ ] Importação possui validação.
- [ ] Relatório é curto e útil.
- [ ] Não há textos genéricos de IA.
- [ ] Não há linguagem de compliance na interface.
- [ ] Referência visual foi usada conscientemente.
- [ ] Mobile foi revisado.
- [ ] Teclado foi revisado.
- [ ] Testes passaram.
- [ ] Build passou.
- [ ] Lint passou.
- [ ] Typecheck passou.
- [ ] Não há `.env`.
- [ ] Não há tokens.
- [ ] Não há integração externa.
- [ ] Não houve deploy.
- [ ] PR está em rascunho.
- [ ] Não houve merge.

---

# 20. Próxima ação exata

Depois de salvar a referência visual:

1. clone `TeoZ08/teo-painel`;
2. crie `feat/rebuild-interactive-mvp`;
3. salve este arquivo em `docs/PLANO-CODEX.md`;
4. salve a referência em `docs/references/`;
5. abra o projeto no VS Code;
6. inicie uma conversa nova no Codex;
7. selecione GPT-5.6 Sol high ou GPT-5.3-Codex high;
8. execute apenas o Prompt 00;
9. revise os documentos antes de iniciar código.