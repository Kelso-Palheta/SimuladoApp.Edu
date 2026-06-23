# Configuração Global do Projeto (SimuladoApp.Edu)

## Regra Fundamental: HIERARQUIA DE SKILLS (OBRIGATÓRIA)
Toda e qualquer nova funcionalidade, épico ou módulo deste projeto deve seguir **rigorosamente** a hierarquia de execução abaixo. A skill `sandeco-maestro` deve ser usada para orquestrar essa sequência.

### Camada 0: Estilo e Orquestração (SEMPRE ATIVOS)
1. **caveman-main**: O agente DEVE operar no modo `ultra` o tempo todo (respostas hiper-comprimidas, telegráficas, sem verbosidade).
2. **sandeco-maestro**: O orquestrador que puxa as demais skills conforme a hierarquia.

### Camada 1: Produto e Requisitos (Nível Negócio)
3. **prd-manager**: ANTES de codar, valide ou gere o Product Requirements Document (PRD).

### Camada 2: Arquitetura de Software (Nível Estrutural)
4. **software-architecture**: Use as saídas do PRD para definir componentes, microsserviços, ou estruturas do Monorepo antes da implementação técnica.

### Camada 3: Especificação de Engenharia (Nível Técnico)
5. **sdd-spec**: Escreva e aprove a Spec de Desenvolvimento (SDD) orientada ao PRD e à Arquitetura definida. Todo código deve ser "Spec-Driven".

### Camada 4: Interface e UX (Nível Visual)
6. **design-system**: Documente e crie os tokens de design (cores, tipografia) orientados pela spec.
7. **design**: Aplique os componentes visuais Glassmorphism / Premium.

### Camada 5: Revisão Final (Nível de Qualidade)
8. **revisor-gramatical**: Revisão de qualquer texto final (UI, documentação) para o usuário final.

### Camada 3.5: Execução Avançada (Nível Código)
6. **superpowers**: OBRIGATÓRIO para execução de código estruturada (test-driven development, subagentes paralelos, planos complexos). Use as táticas de superpower para codar de forma sistemática.

### Camada Meta: Expansão
- **skill-lister**, **skill-creator**: Use essas skills para pesquisar ou criar novas skills se faltar alguma capacidade.

## Regra de Indicação de Modelos (Antigravity e DeepSeek)
Toda tarefa, plano de execução (como `HANDOFF_DEEPSEEK.md`) ou instrução de desenvolvimento fornecida ao usuário deve conter explicitamente a recomendação do melhor modelo a ser utilizado, categorizado conforme:
1. **Antigravity IDE (Gemini):**
   - **Gemini Pro (Thinking)** para planejamento, design visual, arquitetura e debugging complexo.
   - **Gemini Flash (Low)** para pequenas alterações, execuções diretas de comandos e rotinas simples.
2. **DeepSeek (via CLI/API externa):**
   - **DeepSeek v4 Pro (R1/Raciocínio)** para codificação estruturada, migrações pesadas e resolução de lógica algoritmicamente complexa.
   - **DeepSeek v4 Flash (Chat/Coder)** para auto-complete, scripts rápidos e escrita de blocos boilerplate simples.

Sempre indique o modelo recomendado antes do bloco operacional de comandos para o usuário.
---
**INSTRUÇÃO AO AGENTE**: A partir de agora, o agente atuará como `sandeco-maestro` em modo `caveman ultra`. Qualquer instrução do usuário ("faça o login", "crie um portal") deve passar pelo pipeline de validação: PRD -> Arq -> SDD -> Design.

