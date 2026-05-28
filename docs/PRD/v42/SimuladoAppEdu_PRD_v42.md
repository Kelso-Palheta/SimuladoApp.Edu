# SimuladoApp.Edu — PRD v4.2

**Documento de Requisitos do Produto**
**Versão 4.2** · 13 Agentes de Disciplina · Calendário Pedagógico · Briefing Pedagógico Detalhado · Governança de IA · Segurança Enterprise · LGPD · 5 Perfis de Usuário · Roadmap 12-14 meses
**Atualização desde v4.1:** ver `CHANGELOG_v41_v42.md` neste diretório.

---

## ÍNDICE EXECUTIVO

1. Visão Geral do Produto
2. Os Cinco Perfis de Usuário
3. Os 13 Agentes de Disciplina (com Gamificação Básica embutida)
4. Módulos Transversais
5. Arquitetura de IA e Governança Responsável **(NOVO em v4.2)**
6. Arquitetura do Briefing Pedagógico **(NOVO em v4.2)**
7. Arquitetura de Segurança e Proteção de Dados
8. Conformidade LGPD
9. Modelo de Negócio
10. Unit Economics e Custos Operacionais **(NOVO em v4.2)**
11. Roadmap de Implantação Progressiva com KPIs por Fase **(KPIs novos em v4.2)**
12. Validação de Usuário e Pesquisa **(NOVO em v4.2)**
13. Resumo Executivo
14. Apêndice A: Análise Comparativa com Concorrentes **(NOVO em v4.2)**
15. Apêndice B: Análise de Gaps e Roadmap para v4.3

---

## 1. VISÃO GERAL DO PRODUTO

### 1.1 O que é o SimuladoApp.Edu

Plataforma integrada SaaS que une **gestão pedagógica** e **suporte pedagógico baseado em IA generativa**. Construída para o contexto educacional brasileiro real — ENEM, BNCC, DCEPA, escolas de tempo integral, internet instável, realidade amazônica.

**Diferencial competitivo central:** integração nativa com o SimuladoApp (sistema de simulados já em produção), o que permite que todos os agentes de IA tenham acesso a **dados reais de desempenho** dos alunos via o **Briefing Pedagógico** (detalhado no capítulo 6). Nenhum concorrente tem isso.

### 1.2 Os três pilares da plataforma

A v4.2 reorganiza a visão do produto em **três pilares principais** — uma evolução em relação à v4.1, que tratava o Calendário como "transversal":

#### PILAR 1 — Agentes de IA Pedagógicos
13 agentes disciplinares + módulos de produção (Redação, Corretor, Gamificação Avançada, Gerador de Slides, Planejador Curricular). Geram aulas, atividades, rubricas, sequências didáticas, slides — tudo alinhado à BNCC/DCEPA.

#### PILAR 2 — Calendário Pedagógico com Diário de Bordo
**Promovido a pilar principal nesta versão.** É o módulo mais sticky, mais difícil de copiar e mais conectado à dor real do professor brasileiro: cumprir o diário de classe oficial. Funciona como organizador pedagógico + diário digital + auditoria pedagógica.

#### PILAR 3 — Briefing Pedagógico (SimuladoApp Integrado)
Camada de inteligência que conecta os dados reais de desempenho dos alunos (vindos do SimuladoApp via webhook) com todos os agentes de IA. É o fosso competitivo declarado e ganha capítulo próprio na v4.2 (capítulo 6).

### 1.3 Mapa de módulos — visão integrada

**Agentes de Disciplina (13 módulos vendáveis individualmente):**
Linguagens (Português · Literatura · Língua Estrangeira · Educação Física · Arte) · Matemática · Ciências da Natureza (Física · Química · Biologia) · Ciências Humanas (História · Geografia · Filosofia · Sociologia).

Todos os 13 agentes incluem **Gamificação Básica nativa** (ver §3) — funcionalidade nova na v4.2, antes incorretamente posicionada como "embutida" sem ser descrita.

**Módulos Transversais:**
- Agente de Gamificação Avançada (módulo dedicado, ver §4.1)
- Agente de Redação ENEM (ensino progressivo)
- Corretor ENEM (feedback automático por competência)
- **Calendário Pedagógico com Diário de Bordo (pilar)**
- Biblioteca de Conteúdo (organização + busca + reutilização)
- Planejador Curricular (bimestre + ano letivo com alinhamento BNCC/DCEPA)
- Gerador de Slides (exportação PPTX automática)
- **SimuladoApp + Briefing Pedagógico (pilar)** — ver §6
- Modo Offline / Baixa Conectividade
- Organizadores de Horário Escolar (convencional + tempo integral)

**Dashboards / Portais:**
Dashboard do Professor · Dashboard de Coordenação · Dashboard Executivo · Portal do Aluno · Portal do Responsável.

---

## 2. OS CINCO PERFIS DE USUÁRIO

### 2.1 Professor

**Acesso:** agentes das suas disciplinas, Calendário Pedagógico completo, Biblioteca pessoal, Planejador Curricular, SimuladoApp via iframe SSO, relatórios das suas turmas.

**Uso:** conversa com agentes para planejamento e geração de aulas; gera aulas, atividades, rubricas e slides; registra aulas no calendário em tempo real; anota imprevistos e reorganiza conteúdo pendente; exporta materiais em PDF/DOCX/PPTX; consulta dados do SimuladoApp para focar no que precisa reforçar.

**Isolamento de dados:** vê apenas suas turmas e seus alunos. Nunca vê dados de turmas de outros professores, mesmo na mesma escola.

**Persona real (nova em v4.2):** ver capítulo 12 (Validação de Usuário) para personas detalhadas — Prof. Lúcia (rede pública, 3 escolas), Prof. Rafael (escola particular, ENEM-focused), Prof. Ana (interior do Pará, conectividade limitada).

### 2.2 Coordenador Pedagógico

**Acesso:** calendários pedagógicos de toda a equipe; planejamentos curriculares de todas as turmas; cobertura BNCC/DCEPA por disciplina e turma; desempenho agregado por área de conhecimento; alertas de aulas atrasadas ou conteúdos não trabalhados.

**Uso:** monitora o que foi e o que não foi dado; identifica atrasos curriculares; gera relatórios de cobertura; intervém pedagogicamente quando uma turma fica atrasada; valida alinhamento com a proposta curricular da escola.

**Isolamento:** vê dados de todas as turmas da sua escola. Acesso a dados individuais de alunos apenas no contexto pedagógico agregado.

### 2.3 Gestor / Diretor

**Acesso:** visão macro — indicadores agregados da escola; uso da plataforma por professor e por turma; alertas críticos; comparativos entre turmas e entre anos letivos; dados de conformidade BNCC/DCEPA.

**Uso:** monitora a escola como um todo; exporta relatórios para secretaria de educação; toma decisões de intervenção estratégica; acompanha ROI da plataforma; valida resultados contra metas institucionais.

**Isolamento:** dados agregados da escola. SEM acesso a dados individuais (privacidade LGPD).

**Nota v4.2:** o perfil "Gestor" será segmentado em v4.3 entre **Diretor de Escola Privada** e **Gestor de Rede Pública (Secretaria)**, pois têm necessidades distintas. Por ora, ambos são atendidos pelo mesmo dashboard.

### 2.4 Aluno

**Acesso:** painel individual com desempenho nos simulados; evolução entre simulados; assistentes de disciplina para tirar dúvidas (com mediação pedagógica — ver §2.4.1); agente de redação para treinar escrita; histórico de correções e progresso por competência.

**Uso:** consulta seu desempenho; identifica fraquezas; treina redação com feedback automático; usa assistentes para estudar tópicos específicos; acompanha evolução ao longo do tempo.

**Isolamento:** vê apenas seus próprios dados. LGPD: menores de 18 anos exigem consentimento documentado do responsável.

#### 2.4.1 Política de uso de IA por aluno (novo em v4.2)

A v4.1 era ambígua sobre o que o aluno podia ou não fazer com a IA. A v4.2 estabelece:

- **Aluno NÃO pode pedir à IA que "faça o dever de casa por ele".** Política técnica: prompt do aluno é diferente do prompt do professor, com guardrails específicos que recusam pedidos de resolução direta de exercícios atribuídos pelo professor.
- **Aluno PODE:** pedir explicações sobre conceitos; pedir exemplos resolvidos similares (não idênticos) aos da lista; treinar redação com feedback; tirar dúvidas pontuais.
- **Mediação do professor:** professor pode configurar nível de assistência (estrito / moderado / livre) por turma e por bimestre.
- **Auditoria:** todas as interações do aluno com a IA ficam registradas e disponíveis ao professor responsável (não ao coordenador, para preservar privacidade pedagógica).

### 2.5 Responsável (Pai / Mãe / Tutor)

**Acesso:** painel do filho — desempenho nos simulados; áreas de atenção e evolução; aulas previstas no calendário pedagógico; relatório mensal automático; notificações automáticas de eventos relevantes.

**Uso:** acompanha o desempenho do filho sem necessidade de conhecimento técnico; recebe alertas automáticos de queda de desempenho; é notificado quando aulas são reagendadas; acessa relatórios visuais e simples (sem jargão pedagógico).

**Isolamento e LGPD (refinado em v4.2):**
- **Login próprio obrigatório** (não mais compartilhado com aluno) — decisão tomada na v4.2 para clareza de auditoria sob LGPD.
- Cada ação fica registrada como "feita pelo responsável" ou "feita pelo aluno", separadamente.
- Vinculação aluno↔responsável é feita via convite enviado pela escola (com consentimento documentado).
- Múltiplos responsáveis por aluno são suportados (pai + mãe + tutor legal).

---

## 3. OS 13 AGENTES DE DISCIPLINA

### 3.0 Arquitetura comum dos agentes (nova seção em v4.2)

A v4.2 esclarece o que estava implícito: os 13 agentes são instâncias de um **motor único de agente parametrizado** — não 13 sistemas distintos. Isso é decisão técnica honesta (mais barata, mais consistente, mais auditável) e comercialmente sustentável (cada agente tem comportamento perceptivelmente diferenciado).

**Parâmetros por disciplina:**
1. **System prompt disciplinar** — define identidade, escopo, vocabulário e abordagem metodológica do agente. Validado por especialista da área.
2. **Base de conhecimento curricular** — RAG (Retrieval-Augmented Generation) sobre BNCC/DCEPA da disciplina + matriz de referência do ENEM da área + materiais didáticos curados.
3. **Tool use específico** — algumas disciplinas têm ferramentas próprias (ex: Matemática renderiza LaTeX; Educação Física tem gerador de circuitos de estações; Arte tem busca em acervos visuais).
4. **Few-shot examples** — 5-15 exemplos de aulas/atividades de alta qualidade geradas por especialistas humanos da disciplina, usadas como referência de estilo.
5. **Gamificação básica contextualizada** — biblioteca de mecânicas lúdicas adaptadas à disciplina (ver §3.0.2).

**Características funcionais comuns a todos:**
- **Modo Assistente:** professor conversa livremente, pede sugestões, metodologias, referências.
- **Modo Executor:** ao ser pedido, gera planos de aula completos, sequências didáticas, exercícios, questões, rubricas.
- **Exportação:** PDF, DOCX e PPTX — tudo gerado é imediatamente exportável.
- **Briefing Pedagógico:** todos os agentes recebem automaticamente o briefing pedagógico (capítulo 6) com dados de desempenho da turma quando disponível.
- **Alinhamento BNCC/DCEPA:** todo conteúdo gerado é mapeado para competências e habilidades.
- **Gamificação Básica embutida:** disponível em todos os agentes — descrita em §3.0.2.

#### 3.0.1 Diferenças notáveis entre agentes

Apenas os pontos onde a implementação realmente diverge:

| Agente | Diferença técnica/pedagógica notável |
|---|---|
| **Matemática** | Renderização de LaTeX em PDF e PPTX; gerador de questões parametrizadas; calculadora simbólica integrada (sympy). |
| **Física / Química** | Renderização de equações; biblioteca de experimentos de baixo custo; mapas conceituais. |
| **Biologia** | Integração com banco de imagens da fauna/flora amazônica; estudos de caso ambientais regionais. |
| **História / Geografia** | Acervo de fontes primárias digitalizadas; geração de linhas do tempo; mapas interativos (Geografia). |
| **Redação ENEM** | Único agente que tem **dimensão para aluno** (treino direto) além da dimensão para professor. Ver §4.2. |
| **Educação Física** | Único agente com **componente prático** — geradores de circuitos, torneios escolares, planos motores. |
| **Arte** | Integração com acervos visuais públicos (Tate, MASP, Pinacoteca); geração de roteiros de visita virtual. |
| **Língua Estrangeira** | Único agente multilíngue (PT-EN-ES); leitor de texto em áudio nativo. |
| **Filosofia / Sociologia** | Gerador de roteiros de debate socrático; análise de dilemas éticos contemporâneos. |
| **Português / Literatura** | Análise sintática automatizada; gerador de questões de interpretação no padrão ENEM. |

#### 3.0.2 Gamificação Básica embutida (novo em v4.2)

**Esta é a correção principal da v4.2 em relação ao v4.1.** Todo agente disciplinar gera, sob demanda, elementos lúdicos simples diretamente integrados à aula — sem necessidade de ferramenta separada. O professor pede "transforma essa aula em jogo" e o agente entrega:

- **Divisão em equipes** com nomes temáticos relacionados ao conteúdo da disciplina.
- **Pontuação simbólica** por atividade (acertos, participação, criatividade) com regras claras.
- **Narrativa-fio condutor curta** (uma frase de abertura e uma de fechamento que dão sentido lúdico à aula).
- **Desafio final rápido** (5-10 min) com mecânica simples: quiz relâmpago, desafio em duplas, ou pergunta surpresa.
- **Rubrica visual de pontuação** exportável (PDF) que o professor pode imprimir e usar na lousa.

**Esse nível é suficiente para o dia a dia** — uma camada de engajamento que torna qualquer aula mais viva sem exigir produção pedagógica complexa.

Para narrativas elaboradas, torneios entre turmas, campanhas bimestrais e festivais escolares, ver o **Agente de Gamificação Avançada (módulo 4.1)**.

**Adaptação por disciplina (exemplos de equipes/desafios):**

| Disciplina | Equipes temáticas | Desafio sugerido |
|---|---|---|
| Português | Figuras de linguagem | Quiz de regência verbal |
| Literatura | Movimentos literários | "Identifique o autor pelo trecho" |
| Língua Estrangeira | Cidades/países | Speed challenge de vocabulário |
| Educação Física | Modalidades olímpicas | Circuito de estações pontuadas |
| Arte | Escolas/períodos artísticos | "Qual obra é essa?" |
| Matemática | Teoremas/matemáticos | Race-condition de problemas |
| Física | Fenômenos físicos | Desafio de previsão experimental |
| Química | Elementos da tabela periódica | Quiz de reações |
| Biologia | Biomas/sistemas biológicos | "Identifique a espécie" |
| História | Períodos históricos | Debate "quem fez a melhor escolha" |
| Geografia | Biomas/regiões | "Leia o mapa" |
| Filosofia | Escolas filosóficas | Debate socrático pontuado |
| Sociologia | Clássicos da sociologia | Análise de fenômeno atual |

### 3.1 a 3.13 — Descrição compacta dos agentes disciplinares

A v4.2 elimina a repetição da v4.1 (mesmo template 13 vezes) e usa formato compacto, destacando apenas o que diferencia cada agente:

#### 3.1 Português
**Especialidade:** gramática contextualizada, interpretação de texto, produção textual, variação linguística, oralidade e análise linguística. Matriz de Referência de Linguagens do ENEM.
**Diferenciais técnicos:** análise sintática automatizada; gerador de questões de interpretação no padrão ENEM.
**Gamificação básica:** equipes "Figuras de Linguagem"; quiz de regência verbal.

#### 3.2 Literatura
**Especialidade:** literatura brasileira e portuguesa, movimentos literários, análise de obras, intertextualidade, formação do leitor.
**Diferenciais:** acervo de obras com análise estrutural pré-gerada; conexão com temas recorrentes do ENEM.
**Gamificação básica:** equipes "Movimentos Literários"; desafio "Identifique o Autor".

#### 3.3 Língua Estrangeira (Inglês/Espanhol)
**Especialidade:** leitura e interpretação em inglês/espanhol, vocabulário contextualizado, estratégias de compreensão. Foco ENEM.
**Diferenciais:** único agente multilíngue; leitor de texto em áudio nativo; adaptador de dificuldade.
**Gamificação básica:** equipes "Cidades/Países"; speed challenge.

#### 3.4 Educação Física
**Especialidade:** cultura corporal, esportes, jogos, danças, lutas, ginásticas, saúde.
**Diferenciais:** único agente com componente prático estruturado — geradores de circuitos, torneios, planos motores.
**Gamificação básica:** equipes "Modalidades Olímpicas"; circuito de estações pontuadas.

#### 3.5 Arte
**Especialidade:** artes visuais, música, teatro, dança, arte contemporânea, contexto amazônico.
**Diferenciais:** integração com acervos visuais (Tate, MASP, Pinacoteca); roteiros de visita virtual.
**Gamificação básica:** equipes "Escolas Artísticas"; "Qual Obra é Essa?".

#### 3.6 Matemática
**Especialidade:** álgebra, geometria, aritmética, estatística, probabilidade, funções, trigonometria, matemática financeira.
**Diferenciais:** renderização LaTeX; gerador de questões parametrizadas; calculadora simbólica integrada.
**Gamificação básica:** equipes "Teoremas/Matemáticos"; race de problemas.

#### 3.7 Física
**Especialidade:** mecânica, termodinâmica, óptica, eletromagnetismo, física moderna, ondulatória.
**Diferenciais:** biblioteca de experimentos de baixo custo; renderização de equações; simulações pré-prontas.
**Gamificação básica:** equipes "Fenômenos Físicos"; previsão experimental.

#### 3.8 Química
**Especialidade:** química geral, orgânica, inorgânica, transformações, modelos atômicos, estequiometria, química ambiental.
**Diferenciais:** renderização de fórmulas e reações; mapas conceituais; experimentos de baixo custo.
**Gamificação básica:** equipes "Tabela Periódica"; quiz de reações.

#### 3.9 Biologia
**Especialidade:** citologia, genética, evolução, ecologia, fisiologia, biotecnologia, biologia molecular. Contextualizado com saúde e Amazônia.
**Diferenciais:** banco de imagens da fauna/flora amazônica; estudos de caso ambientais regionais.
**Gamificação básica:** equipes "Biomas"; "Identifique a Espécie".

#### 3.10 História
**Especialidade:** história do Brasil, história geral, história da Amazônia, fontes históricas, análise de documentos.
**Diferenciais:** acervo de fontes primárias digitalizadas; geração de linhas do tempo.
**Gamificação básica:** equipes "Períodos Históricos"; debate "Quem Fez a Melhor Escolha".

#### 3.11 Geografia
**Especialidade:** geografia física e humana, geopolítica, cartografia, biomas, climatologia.
**Diferenciais:** mapas interativos; imagens de satélite; integração com OpenStreetMap.
**Gamificação básica:** equipes "Biomas/Regiões"; "Leia o Mapa".

#### 3.12 Filosofia
**Especialidade:** filosofia clássica e contemporânea, ética, política, epistemologia, estética, lógica.
**Diferenciais:** gerador de roteiros de debate socrático; análise de dilemas éticos contemporâneos.
**Gamificação básica:** equipes "Escolas Filosóficas"; debate socrático pontuado.

#### 3.13 Sociologia
**Especialidade:** clássicos da sociologia, cultura, identidade, desigualdade social, movimentos sociais.
**Diferenciais:** banco de dados sociológicos atualizados (IBGE, PNAD); análise de fenômenos contemporâneos.
**Gamificação básica:** equipes "Clássicos da Sociologia"; análise de fenômeno atual.

---

## 4. MÓDULOS TRANSVERSAIS

### 4.1 AGENTE DE GAMIFICAÇÃO AVANÇADA (reescrito em v4.2)

Módulo dedicado a produções gamificadas de alta complexidade — quando o professor (ou a escola) quer ir além da Gamificação Básica que já vem embutida em cada agente disciplinar (§3.0.2).

**Quando usar este agente (e não a gamificação básica):**
- Campanhas pedagógicas bimestrais ou semestrais com narrativa contínua.
- Torneios entre turmas ou entre séries (festivais escolares).
- Sistemas de pontuação cumulativa com progressão de papéis individuais.
- Roleplay pedagógico com personagens, dossiers, missões.
- Eventos escolares gamificados (semana da ciência, mostra cultural, gincanas).
- Produções que envolvem múltiplas disciplinas simultaneamente.

**Como funciona:**
O professor (ou coordenador) conversa com o agente descrevendo o conteúdo, o perfil das turmas, a duração da campanha e o nível de imersão desejado. O agente executa:

- **Cria narrativa imersiva completa** — universo, vilão/missão, arcos de progressão, eventos-marco.
- **Constrói dossiers de equipe** prontos para impressão (PDF A4, colorido e P&B) com identidade visual, regras, missão.
- **Desenha sistema de pontuação multinível** — pontos por atividade, bônus, penalidades, multiplicadores, regras de empate.
- **Gera fichas individuais** para cada aluno com progressão (nível, conquistas, papéis).
- **Produz cronograma de eventos-marco** alinhado ao Calendário Pedagógico.
- **Cria fechamento dramático** — cerimônia final, premiação, retrospectiva.
- **Exporta tudo** em PDF, DOCX e PPTX.

**Integração com outros módulos:**
- **Calendário Pedagógico:** eventos-marco aparecem no calendário do professor.
- **SimuladoApp/Briefing:** usa dados de desempenho para calibrar dificuldade dos desafios.
- **Biblioteca de Conteúdo:** campanhas inteiras ficam salvas e podem ser reutilizadas/adaptadas.
- **Agentes de disciplina:** integração coordenada — pode "puxar" conteúdo dos agentes disciplinares para construir desafios temáticos.

**Diferenciação clara entre Básica e Avançada:**

| Aspecto | Gamificação Básica (embutida) | Gamificação Avançada (este módulo) |
|---|---|---|
| Escopo | Uma aula | Bimestre / semestre / ano |
| Narrativa | Frase de abertura + fechamento | Universo completo com arcos |
| Equipes | Nomes temáticos simples | Dossiers visuais com identidade |
| Pontuação | Simples (acertos, participação) | Multinível com bônus, papéis, progressão |
| Material | Rubrica visual em PDF | Pacote completo de campanha |
| Integração entre disciplinas | Não | Sim |
| Tempo de produção | < 1 minuto | 3-10 minutos |
| Disponibilidade | Todos os agentes contratados | Módulo separado (Escola; R$19/mês avulso) |

### 4.2 AGENTE DE REDAÇÃO ENEM

Diferente do Corretor — **ensina a escrever**, não só avalia.

**Para o professor:**
- Cria sequência didática de produção textual por competência.
- Gera banco de temas com repertório sociocultural organizado.
- Propõe atividades de treino por competência (coesão, argumentação, estrutura, proposta de intervenção).
- Gera rubricas de avaliação com critérios claros por nível.

**Para o aluno (via Portal do Aluno):**
- Treina uma competência por vez com feedback imediato.
- Recebe sugestão de repertório adequado ao tema.
- Vê sua evolução entre rascunhos.
- Simula a nota provável por competência.
- **Política de IA para aluno (§2.4.1) se aplica:** agente ajuda a treinar, não escreve a redação no lugar do aluno.

**Integração SimuladoApp:** usa dados de desempenho em Linguagens para identificar quais competências da redação precisam mais atenção por turma e por aluno individual.

### 4.3 CORRETOR ENEM

Correção completa de redações e questões discursivas nas 5 competências do ENEM.

- Análise detalhada de cada uma das 5 competências.
- Feedback específico por competência com sugestões de melhoria.
- Análise de questões discursivas com critérios claros.
- Sugestão de reescrita quando apropriado.
- Histórico de evolução do aluno entre correções.

**Calibração técnica (nova em v4.2):** o corretor é calibrado contra um corpus de 1.000+ redações ENEM com notas oficiais reais (fase de validação obrigatória antes de produção). Métrica alvo: correlação de Spearman > 0.75 com nota humana oficial. Caso não atinja, ajustes de prompt + few-shot até atingir.

Os dados de correção alimentam o perfil do aluno e informam automaticamente o Agente de Redação e os agentes de disciplina sobre quais competências precisam reforço.

### 4.4 CALENDÁRIO PEDAGÓGICO COM DIÁRIO DE BORDO (Pilar 2)

**Promovido a pilar central na v4.2.** O organizador pedagógico real do professor — compatível com o diário de classe oficial da escola.

#### Configuração inicial
- Professor cadastra seus dias de aula por turma (ex: 3º Ano A — terças e quintas).
- Define calendário escolar: datas de início, feriados, eventos escolares, período de provas.
- O sistema organiza automaticamente as aulas planejadas nos dias disponíveis.

#### Status de cada aula
- ✅ CONCLUÍDA — aula realizada conforme planejado.
- 🔶 PARCIALMENTE CONCLUÍDA — trabalhou o conteúdo mas não terminou tudo.
- ❌ NÃO REALIZADA — aula não aconteceu (feriado não previsto, dispensa etc).

#### Migração automática de conteúdo
- Quando parcialmente concluída: professor registra o que foi trabalhado + o que ficou pendente; o pendente migra automaticamente para a próxima aula.
- Quando não realizada: professor registra o motivo (campo livre); o conteúdo daquela aula migra automaticamente para a próxima.
- **Editabilidade total** — o automático é ponto de partida, não camisa de força.

#### Compatibilidade com diário oficial
- Funciona como diário de bordo digital.
- Exporta relatório formatado: data · conteúdo trabalhado · conteúdo pendente · observações.
- Professor usa esse relatório para preencher o diário físico da escola.
- Exportação em PDF formatado por mês ou bimestre.
- **Integração nativa com DCEPA (Diário de Classe Eletrônico do Pará)** em desenvolvimento para Fase 4.

#### Visão do coordenador
- Vê o calendário de todos os professores.
- Identifica turmas com muitas aulas não realizadas ou conteúdos acumulados.
- Alerta automático quando uma turma está com mais de 2 aulas não realizadas no mês.
- Vê cobertura curricular real vs. planejada por disciplina.

### 4.5 BIBLIOTECA DE CONTEÚDO

Tudo que o professor gerou — organizado, buscável e permanente.

**Para o professor individual:**
- Tudo que foi gerado pelos agentes fica salvo automaticamente.
- Organizado por disciplina, série, bimestre e tipo (aula, atividade, rubrica, slide).
- Busca por palavra-chave, tema ou competência BNCC.
- Nunca perde o que construiu — persiste entre sessões e entre anos letivos.

**Para a escola (Plano Escola):**
- Biblioteca compartilhada entre professores da mesma disciplina.
- Coordenador marca materiais como "recomendado para toda a escola".
- Cria acervo pedagógico institucional que cresce com o tempo.

**Efeito de retenção e de rede:** o professor não quer sair da plataforma porque perderia o acervo; quanto mais professores usam, mais rico fica o acervo.

### 4.6 GERADOR DE SLIDES (PPTX)

Qualquer aula gerada vira apresentação visual pronta para usar.

- Todos os agentes exportam conteúdo como PPTX.
- Estrutura padrão: abertura (tema + objetivo) → desenvolvimento → atividade → fechamento.
- Visual profissional: paleta de cores por disciplina, tipografia legível, ícones temáticos, espaço para imagens.
- Editável: professor baixa o PPTX e edita no PowerPoint ou Google Slides.
- **Print-friendly (novo em v4.2):** versão otimizada para impressão P&B (escolas com toner ruim), com ícones substituídos por símbolos sólidos legíveis.
- **Futuramente:** geração de slides com imagens temáticas via IA de geração de imagem.

### 4.7 SIMULADOAPP INTEGRADO

Sistema independente acessado dentro da plataforma — base de dados de desempenho educacional.

**Integração técnica (detalhada em §6):**
- Acessado via iframe com SSO (sem novo login).
- Quando simulado é corrigido: webhook envia dados de desempenho para a plataforma.
- A plataforma gera o **Briefing Pedagógico** (capítulo 6).

**Integração com Portal do Aluno:**
- Aluno vê desempenho histórico, evolução, áreas de atenção.
- Recebe recomendações de treino baseadas em seus dados.

### 4.8 PLANEJADOR CURRICULAR

Bimestre e ano letivo completos com coerência pedagógica e alinhamento BNCC.

- Gera sequência de 4 a 10 aulas conectadas com objetivos progressivos.
- Planeja o ano letivo com 4 bimestres distribuídos no Calendário Pedagógico.
- Alinhamento automático com BNCC e DCEPA — mapeia cada aula para competências e habilidades.
- Quando há dados do SimuladoApp, prioriza conteúdos com menor desempenho.
- Exporta planejamento oficial em PDF/DOCX formatado para entrega à coordenação.
- Compatível com diferentes modelos de calendário (bimestral, trimestral, etc.).

### 4.9 MODO OFFLINE / BAIXA CONECTIVIDADE

Para escolas com internet instável — realidade do interior do Pará.

- Professor baixa previamente: planos de aula, materiais, calendário.
- Offline: acessa o baixado, marca aulas como concluídas, registra observações.
- Reconexão: sincroniza automaticamente quando a internet volta.
- App mobile (Flutter): versão para celular com offline.

**Estratégia técnica de sincronização (nova em v4.2):**
- Modelo de dados local: SQLite com schema espelho do servidor.
- Estratégia de sync: **last-write-wins por campo** para edições simples; **merge interativo** para conflitos de conteúdo (interface pergunta ao professor qual versão manter).
- Priorização: dados críticos (registros de aulas dadas) sincronizam primeiro; dados grandes (PPTX gerados) sincronizam por último ou sob demanda.
- Bandwidth aware: detecta qualidade da conexão e adapta volume de sync.

### 4.10 ORGANIZADORES DE HORÁRIO ESCOLAR

Mantém-se igual ao v4.1: dois módulos (Convencional + Tempo Integral com Salas Temáticas).

**Atualização v4.2:** o módulo de Tempo Integral terá **POC de 2 semanas antes da Fase 3** para validar viabilidade do constraint solver (OR-Tools) em escolas reais com 400+ alunos. A promessa de "recalcula em 30 segundos" é ambiciosa e precisa ser empiricamente validada antes de marketing.

---

## 5. ARQUITETURA DE IA E GOVERNANÇA RESPONSÁVEL (NOVO em v4.2)

**Este capítulo é nova adição em v4.2.** Endereça o maior gap identificado na análise crítica do v4.1: a ausência total de tratamento sobre riscos, custos e governança de IA.

### 5.1 Stack de IA

**Provider primário:** Anthropic Claude (Sonnet 4.5 ou superior) via API oficial.
**Provider secundário (fallback):** OpenAI GPT-4o.
**Justificativa:** Claude tem melhor qualidade em português, melhor capacidade de seguir instruções pedagógicas, e contrato de Zero Data Retention disponível para uso empresarial.

**Orquestração:** Anthropic SDK oficial em Python (FastAPI) + Vercel AI SDK no frontend para streaming.
**Tool use:** Anthropic tool_use nativo para geração de PDF/DOCX/PPTX e consulta de Briefing Pedagógico.
**RAG:** PostgreSQL + pgvector para base de conhecimento BNCC/DCEPA por disciplina.
**Prompt caching:** ativo para system prompts disciplinares (redução de ~70% no custo de tokens de entrada).

### 5.2 Política de uso de dados em prompts

**Dados que podem ir em prompt (após pseudonimização):**
- Estatísticas agregadas de turma (% de acerto, descritores com maior erro).
- Dados pseudonimizados de aluno (`aluno_a3f9` em vez de "João Silva").
- Histórico de desempenho do aluno em descritores.

**Dados que NUNCA vão em prompt:**
- Nome real, CPF, e-mail, endereço.
- Dados de saúde, comportamento, deficiências.
- Conteúdo de redações de aluno menor de idade sem consentimento explícito do responsável (consentimento separado e específico para "processamento por IA").

**Mapping de pseudonimização:**
- Mantido em tabela `pseudonym_map` no banco do cliente (Supabase RLS).
- Nunca enviado a provider externo.
- Permite desfazer pseudonimização localmente para exibir nomes reais ao professor autorizado.

### 5.3 Tratamento de alucinação

**Mecanismos preventivos:**
- **Grounding obrigatório em BNCC/DCEPA:** quando o agente cita competência ou habilidade, deve referenciar o código exato (ex: EM13LP01). Validação automática: se o código não existe na base, regenera resposta.
- **Few-shot examples** com aulas reais validadas por especialistas (5-15 por disciplina).
- **Temperature baixa** (0.3) para conteúdo factual; **mais alta** (0.7) para conteúdo criativo (gamificação).
- **Citação obrigatória de fontes** em aulas de História, Geografia, Sociologia, Filosofia.

**Mecanismos detectivos:**
- **Aviso explícito na UI:** todo conteúdo gerado por IA tem badge "REVISE ANTES DE USAR" não-dispensável.
- **Workflow de aprovação:** professor marca conteúdo como "aprovado para uso" antes de exportar/imprimir; aprovação é registrada para auditoria.
- **Reportar erro:** botão "marcar como incorreto" em cada bloco gerado, alimentando dataset interno de erros para futura calibração.

**Responsabilidade contratual:**
- ToS deixa claro que **o professor é o responsável pedagógico final** pelo conteúdo levado à sala de aula.
- A plataforma fornece ferramenta de apoio, não substitui curadoria humana.

### 5.4 Custo de inferência e SLA de latência

**Estimativas (Claude Sonnet, preços de 2026):**

| Operação | Tokens (in/out) | Custo médio (USD) | Custo médio (BRL ~R$5) |
|---|---|---|---|
| Gerar plano de aula completo | 8k / 4k | $0.084 | R$0,42 |
| Gerar atividade/exercício | 4k / 1.5k | $0.034 | R$0,17 |
| Gerar rubrica | 3k / 1k | $0.024 | R$0,12 |
| Gerar campanha gamificada (avançada) | 15k / 12k | $0.225 | R$1,13 |
| Correção de redação ENEM | 5k / 2k | $0.045 | R$0,23 |
| Chat livre (assistente) — turno | 6k / 1.5k | $0.041 | R$0,21 |

**Premissas de unit economics (ver capítulo 10 para detalhes):**
- Professor Individual médio: ~40 gerações/mês → custo LLM ~R$15/mês → margem positiva no preço R$29.
- Professor Escola médio: ~80 gerações/mês → custo LLM ~R$30/mês → diluído no contrato R$499-799.

**SLA de latência:**
- Plano de aula completo: <30s P95 (streaming desde 2s).
- Atividade/exercício: <15s P95.
- Chat livre: primeiro token <3s P95.
- Modo degradado (alta carga): mensagem clara ao usuário + fila com posição.

### 5.5 Versionamento e governança de prompts

- **Prompts versionados em Git** (não em banco) — code review obrigatório para mudança.
- **Cada conteúdo gerado registra o `prompt_version`** usado, permitindo reproduzibilidade.
- **A/B testing de prompts** em coorte de 5% dos usuários antes de rollout geral.
- **Rollback rápido:** se nova versão de prompt degrada qualidade (medido por taxa de "marcar como incorreto"), reverte automaticamente.

### 5.6 Comportamento sob falha (graceful degradation)

| Falha | Comportamento |
|---|---|
| API LLM indisponível | Mensagem clara + retry com backoff exponencial; após 3 falhas, sugere modo offline ou retornar mais tarde. |
| Rate limit do provider | Fila com posição visível; usuários pagos têm prioridade. |
| Briefing Pedagógico indisponível | Agente funciona sem o briefing (modo "sem dados"); avisa o professor. |
| Geração de PPTX falha | Oferece exportação alternativa em PDF ou DOCX. |
| Resposta da IA detectada como inadequada (guardrail) | Mensagem ao usuário + alerta interno + log para revisão. |

### 5.7 Roadmap de evolução de IA

| Marco | Quando | O quê |
|---|---|---|
| v4.2 launch | Fase 0 | Claude Sonnet via API, prompts versionados, pseudonimização, prompt caching. |
| Fine-tuning | Fase 4+ | Avaliar fine-tuning de Claude Haiku ou modelo open-source (Llama) com dados próprios da plataforma para reduzir custo. |
| Multi-modal | Fase 5 | Aceitar imagens (foto de quadro, foto de questão de prova) como input para os agentes. |
| Local inference | Pós-roadmap | Avaliar inferência local em servidores Brasil para conformidade adicional LGPD. |

---

## 6. ARQUITETURA DO BRIEFING PEDAGÓGICO (NOVO em v4.2)

**Este capítulo é nova adição em v4.2.** Detalha o que era apenas declarado como "diferencial mágico" no v4.1.

### 6.1 O que é o Briefing Pedagógico

Documento estruturado, gerado automaticamente para cada (turma, disciplina, período), que sintetiza:
- Desempenho geral da turma na disciplina.
- Habilidades BNCC e descritores ENEM com maior taxa de erro.
- Alunos em risco (queda de desempenho ou abaixo do limiar).
- Alunos em destaque (evolução positiva).
- Tópicos sugeridos para reforço.
- Comparação com simulado anterior (evolução).

**O briefing é o que faz os 13 agentes "conhecerem" os alunos** — sem ele, os agentes funcionam como ChatGPT genérico.

### 6.2 Schema do Briefing (JSON)

```json
{
  "briefing_id": "br_2026_t3a_mat_b1",
  "version": "1.0",
  "generated_at": "2026-03-15T08:30:00Z",
  "valid_until": "2026-04-15T08:30:00Z",
  "context": {
    "school_id": "esc_abc123",
    "class_id": "t3a_2026",
    "discipline": "matematica",
    "period": "bimestre_1_2026"
  },
  "summary": {
    "total_students": 32,
    "active_students": 30,
    "last_simulado_avg_score": 612,
    "previous_simulado_avg_score": 587,
    "trend": "improving"
  },
  "weakest_skills": [
    {"bncc_code": "EM13MAT401", "description": "Função afim", "error_rate": 0.78, "rank": 1},
    {"bncc_code": "EM13MAT302", "description": "Probabilidade condicional", "error_rate": 0.71, "rank": 2}
  ],
  "students_at_risk": [
    {"pseudo_id": "aluno_a3f9", "risk_level": "high", "weak_skills": ["EM13MAT401"], "trend": "declining"}
  ],
  "students_excelling": [
    {"pseudo_id": "aluno_b7k2", "trend": "rising", "current_percentile": 92}
  ],
  "recommendations": [
    "Reforçar Função Afim — 78% de erro, é tópico de maior impacto.",
    "5 alunos em risco precisam atenção individualizada em probabilidade."
  ]
}
```

### 6.3 Política de geração e atualização

**Quando é gerado/atualizado:**
- Imediatamente após chegada de novo webhook de simulado corrigido.
- Manualmente pelo professor (botão "atualizar briefing") — útil após avaliações próprias.
- Automaticamente a cada início de bimestre.

**Cache:**
- Cada briefing é cacheado por 30 dias ou até nova invalidação.
- Invalidação dispara recomputação assíncrona (não bloqueia uso).

**Versionamento:**
- Briefings são imutáveis após geração.
- Nova versão = novo `briefing_id` com referência ao anterior.
- Permite auditoria de "qual briefing o agente usou nesta aula?".

### 6.4 Injeção no prompt do agente

**Estratégia:**
- Briefing é injetado no **system prompt** do agente, não em cada turno.
- Tamanho médio do briefing serializado: ~2.000 tokens (cabe em prompt cache do Anthropic).
- Para classes muito grandes (50+ alunos), o briefing é resumido automaticamente mantendo só os 10 alunos mais relevantes (em risco ou destaque).

**Quando é injetado:**
- Sempre que o professor abre uma conversa sobre uma turma específica.
- Quando o professor pede "gera aula sobre X" — agente consulta briefing para priorizar X relacionado a tópicos fracos.
- Não é injetado em modo "consulta livre" sem turma específica (poupa tokens).

### 6.5 Comportamento sem dados (fallback)

**Casos:**
- Escola nova, ainda sem simulados aplicados.
- Professor freemium sem turmas vinculadas.
- Início do ano letivo, dados antigos descartados.

**Comportamento:**
- Agente avisa o professor: "Estou gerando esta aula sem dados de desempenho da turma. Para sugestões mais personalizadas, vincule um simulado ou aguarde aplicação do próximo."
- Usa dados agregados anonimizados do banco SimuladoApp ("tópicos com maior erro em redes públicas do Pará neste bimestre") — disponível para todos os planos, inclusive Individual.
- Pergunta proativamente: "Quer me contar quais tópicos sua turma teve dificuldade no bimestre passado? Posso usar isso como referência."

### 6.6 Granularidade por persona

| Persona | Vê briefing de | Briefing inclui |
|---|---|---|
| Professor | Suas turmas | Detalhado: alunos pseudonimizados, recomendações |
| Coordenador | Todas as turmas da escola | Resumido por turma: tendências, alertas |
| Gestor | Agregado da escola | Apenas indicadores macro, sem pseudo_ids |
| Aluno | Apenas seu próprio briefing | Versão simplificada: "seus pontos fortes e fracos" |
| Responsável | Briefing do filho | Versão didática sem jargão pedagógico |

### 6.7 Webhook SimuladoApp → Plataforma

**Endpoint:** `POST /webhooks/simulado/corrigido`
**Auth:** assinatura HMAC-SHA256 com secret compartilhado.
**Payload (resumo):**
```json
{
  "simulado_id": "sim_2026_03_15",
  "school_id": "esc_abc123",
  "class_id": "t3a_2026",
  "corrected_at": "2026-03-15T08:25:00Z",
  "students_results": [
    {
      "student_pseudo_id": "aluno_a3f9",
      "total_score": 580,
      "by_discipline": {"matematica": 24, "portugues": 31, "...": "..."},
      "by_descriptor": {"D1": 0.8, "D14": 0.2, "...": "..."}
    }
  ]
}
```

**Reliability:**
- Idempotência via `simulado_id` (reprocessar é seguro).
- Dead letter queue após 5 tentativas falhas.
- Alerta a equipe técnica quando DLQ recebe item.
- Painel admin para reprocessar manualmente.

### 6.8 Custo computacional

**Geração de briefing:**
- Agregação SQL no banco: ~100-500ms por turma.
- Não usa LLM (apenas SQL + cálculo estatístico).
- Custo monetário: desprezível.

**Injeção em prompts:**
- ~2k tokens por interação com agente.
- Com prompt caching: cobrança somente na 1ª interação, depois desconto de 90%.
- Custo médio adicional por interação: <R$0,05.

---

## 7. ARQUITETURA DE SEGURANÇA E PROTEÇÃO DE DADOS

Mantém-se com pequenos refinamentos em relação ao v4.1.

### 7.1 Isolamento de dados por perfil (Row-Level Security)

Implementação técnica via PostgreSQL/Supabase RLS:
- Cada linha tem `escola_id` e `owner_id`.
- Policy garante que queries retornam apenas dados do usuário autenticado.
- **Auditoria obrigatória das policies** antes de produção (novo em v4.2): pen-test externo + revisão por consultoria especializada.

**Regras por perfil:** ver §2.

### 7.2 Autenticação e controle de acesso

- Login com e-mail + senha (hash bcrypt cost 12).
- Tokens JWT com expiração: 1h acesso, 7 dias refresh.
- 2FA obrigatório para coordenador e gestor (TOTP via app autenticador).
- Bloqueio automático após 5 tentativas incorretas (15 min de cooldown).
- Sessões inativas encerradas após 30 minutos.
- RBAC: validação no backend de toda requisição.
- **SSO via SAML/OIDC** disponível para Plano Rede.

### 7.3 Criptografia e proteção de dados

**Em trânsito:** HTTPS obrigatório, TLS 1.3, HSTS, CSP restritivo.
**Em repouso:** AES-256 (Supabase default); dados sensíveis (CPF, dados de saúde) com criptografia adicional em nível de aplicação (libsodium); chaves no Vault (HashiCorp ou AWS KMS); backups diários por 30 dias com criptografia separada.

### 7.4 Logs de auditoria (refinado em v4.2)

- Logs em **store separado e imutável** (S3 com Object Lock em modo Compliance).
- Logs cobrem: login/logout, acesso a dados de alunos, criação/edição/exclusão, tentativas de acesso não autorizado, todas as interações com IA (prompt + response + custo).
- Retenção: 2 anos (LGPD).
- Acesso restrito ao DPO e suporte técnico aprovado.
- **Logs NÃO ficam no mesmo banco que os dados auditados** (correção em relação à arquitetura ambígua do v4.1).

### 7.5 Proteção contra ataques

- **SQL Injection:** queries parametrizadas + ORM (SQLAlchemy/Prisma) + nunca string concatenation.
- **XSS:** sanitização de input + CSP estrito + escape automático no React.
- **CSRF:** tokens CSRF + SameSite=Strict cookies.
- **Rate Limiting:** por IP, por usuário e por endpoint (Redis-based).
- **Dependências:** Dependabot ativo, varredura de CVEs, atualização em 48h para críticos.
- **Prompt injection (novo em v4.2):** guardrails contra prompts maliciosos vindos via input de usuário; separação clara entre system/user/assistant roles; validação de output contra tentativas de exfiltração de system prompt.

### 7.6 Plano de resposta a incidentes

- **Detecção:** monitoramento contínuo, alertas automáticos (Sentry + custom).
- **Contenção:** isolamento do ataque, revogação de tokens, bloqueio de IPs, snapshot do banco.
- **Notificação:** ANPD em até 72h (LGPD); notificação de usuários afetados; notificação de escolas.
- **Recuperação:** restauração de backup; auditoria completa; relatório documentado.
- **Revisão:** análise pós-incidente e atualização das defesas.

---

## 8. CONFORMIDADE LGPD

### 8.1 Base legal para tratamento de dados

- **Alunos maiores de 18:** consentimento do próprio aluno.
- **Alunos menores de 18:** consentimento dos pais/responsáveis legais (obrigatório e documentado).
- **Professores e coordenadores:** execução de contrato.
- **Processamento por IA generativa (novo em v4.2):** consentimento específico e separado, obrigatório, com texto explicativo claro sobre uso de provider externo (Anthropic/OpenAI).

### 8.2 Direitos dos titulares

Implementados na plataforma:
- Direito de acesso, correção, exclusão, portabilidade, revogação de consentimento.
- **Exclusão sob backup (novo em v4.2):** dados permanecem em backup criptografado por até 30 dias após pedido de exclusão; isso é documentado no termo de privacidade.

### 8.3 Consentimento documentado

- Termo de consentimento digital assinado pelo responsável no cadastro do aluno menor.
- Registro de data, IP, versão do termo, hash do documento aceito.
- **Termo separado para "processamento por IA"** (novo em v4.2) — obrigatório aceitar para usar funcionalidades de IA.
- Armazenado por 5 anos após encerramento do contrato.

### 8.4 Política de privacidade

- Documento público em linguagem acessível.
- **Versão específica para menores** com linguagem simplificada.
- **Lista pública de sub-processadores** (novo em v4.2): Anthropic, OpenAI (fallback), Supabase, AWS, Vercel, Resend (email), com link para política de privacidade de cada um.

### 8.5 Encarregado de Dados (DPO)

- DPO designado (interno ou terceirizado, conforme tamanho).
- Canal público: `privacidade@simuladoapp.edu.br`.
- Tempo de resposta SLA: 5 dias úteis para requisições simples, 15 dias para complexas.

### 8.6 Retenção e descarte

- Dados de desempenho: período do contrato + 2 anos.
- Após encerramento: anonimização ou exclusão definitiva com comprovante.
- Logs de auditoria: 2 anos.
- **Prompts e responses de IA contendo dados pessoais:** 6 meses (apenas para fins de debugging e melhoria de qualidade, com pseudonimização).

### 8.7 Transferência internacional de dados (novo em v4.2)

- Anthropic e OpenAI são empresas dos EUA. Transferência de dados pessoais para fora do Brasil é regida pelos arts. 33-36 da LGPD.
- **Mitigações:** pseudonimização obrigatória antes de envio; contratos com cláusulas modelo da ANPD; opção futura de inferência em servidor Brasil (Anthropic AWS Bedrock região sa-east-1, quando disponível).
- **Comunicação:** transferência é informada explicitamente no termo de consentimento.

---

## 9. MODELO DE NEGÓCIO

### 9.1 Plano Freemium

Para professores conhecerem antes de pagar.

**Gratuito:**
- 1 agente de disciplina à escolha **com Gamificação Básica integrada**.
- 5 gerações de aula por mês.
- Exportação de texto (sem PDF/PPTX).
- Calendário Pedagógico básico (1 turma).
- **Briefing Pedagógico genérico** (dados anonimizados regionais — Pará/Brasil) — novo em v4.2.

**Objetivo:** eliminar atrito de adoção.
**Conversão:** quando esgota as 5 gerações, recebe oferta de plano Individual com desconto de primeiro mês (R$19 no 1º mês, depois R$29).

### 9.2 Plano Individual (ajustado em v4.2)

**R$29/mês por agente de disciplina**

**INCLUI:**
- 1 Agente de Disciplina ilimitado **com Gamificação Básica integrada nativamente**.
- Exportação PDF, DOCX e PPTX.
- Calendário Pedagógico completo.
- Biblioteca pessoal de conteúdo.
- Até 3 turmas.
- **Briefing Pedagógico genérico** (dados anonimizados regionais) — novo em v4.2.

**NÃO INCLUI:**
- **Briefing Pedagógico personalizado** (dados reais das suas turmas via SimuladoApp).
- **Agente de Gamificação Avançada** (módulo separado).
- Dashboard de Coordenação.

**Posicionamento explícito (novo em v4.2):** o Plano Individual é **loss leader estratégico** para puxar adoção; margem fina é aceitável porque conversão para Escola é o objetivo de negócio.

**Marketplace de módulos avulsos: R$19/mês cada**
- Agente de disciplina adicional.
- Agente de Gamificação Avançada.
- Agente de Redação ENEM.
- Corretor ENEM ilimitado.
- Planejador Curricular.

### 9.3 Plano Escola

**R$499/mês (até 20 professores) · R$799/mês (até 50 professores) · R$1.299/mês (até 100 professores — novo em v4.2)**

**INCLUI TUDO DO INDIVIDUAL PARA TODOS OS PROFESSORES MAIS:**
- ✅ Todos os 13 Agentes de Disciplina para todos os professores
- ✅ **Agente de Gamificação Avançada**
- ✅ Agente de Redação ENEM
- ✅ **SimuladoApp totalmente integrado (Briefing Pedagógico personalizado)**
- ✅ Corretor ENEM ilimitado
- ✅ Planejador Curricular (bimestre + anual + alinhamento BNCC/DCEPA)
- ✅ Calendário Pedagógico com Diário de Bordo para todos
- ✅ Biblioteca de Conteúdo compartilhada entre professores
- ✅ Dashboard de Coordenação (1 acesso de coordenador; +R$99/mês cada adicional)
- ✅ Portal do Aluno + Portal do Responsável
- ✅ Relatórios de turma e escola
- ✅ Organizadores de Horário Escolar (convencional + tempo integral)

### 9.4 Plano Rede

**R$2.000 a R$15.000/mês — negociado por contrato**

**INCLUI TUDO DO ESCOLA MAIS:**
- ✅ Dashboard de Rede — visão comparativa entre escolas por área do conhecimento
- ✅ Relatórios institucionais para secretaria de educação
- ✅ Customização dos agentes para o currículo específico da rede
- ✅ Integrações com Google Classroom e Moodle
- ✅ Suporte pedagógico dedicado
- ✅ SLA de disponibilidade: 99,5% uptime garantido (99,9% mediante contrato premium)
- ✅ DPO compartilhado para conformidade LGPD
- ✅ SSO via SAML/OIDC
- ✅ Onboarding presencial (mediante deslocamento)

**Modelo:** contrato anual com implantação progressiva escola por escola.

---

## 10. UNIT ECONOMICS E CUSTOS OPERACIONAIS (NOVO em v4.2)

**Capítulo novo em v4.2.** Endereça o gap de custos operacionais identificado na análise.

### 10.1 Premissas operacionais

Baseado em mercado SaaS edtech brasileiro (Q2 2026):
- Custo de aquisição (CAC) estimado: R$50-150 (Individual), R$2.000-8.000 (Escola), R$30k-100k (Rede).
- Churn mensal Individual: 8-12% (alto — característica do segmento).
- Churn anual Escola: 15-25%.
- LTV/CAC alvo: >3x para sustentabilidade.

### 10.2 Custos operacionais mensais por escala

#### Cenário "Magro" — pré-lançamento (Fase 0-1)
| Item | Custo/mês (R$) |
|---|---|
| Supabase Pro | 125 |
| Vercel Pro | 100 |
| Anthropic API (testes) | 500 |
| Domínio + SSL + e-mail (Resend) | 100 |
| Sentry/monitoring | 130 |
| **Total** | **~R$955** |

#### Cenário "Médio" — 500 usuários ativos pagantes
| Item | Custo/mês (R$) |
|---|---|
| Supabase Team | 2.500 |
| Vercel Pro + bandwidth | 800 |
| Anthropic API | 7.500 |
| AWS S3 + CloudFront | 600 |
| Storage de backups | 200 |
| Sentry + Logs | 400 |
| Email transacional | 200 |
| Suporte técnico (1 pessoa tempo parcial) | 4.000 |
| **Total** | **~R$16.200** |

#### Cenário "Gordo" — 5.000 usuários ativos
| Item | Custo/mês (R$) |
|---|---|
| Supabase Enterprise + read replicas | 12.000 |
| Vercel Enterprise | 4.500 |
| Anthropic API + caching | 45.000 |
| AWS + CDN | 5.000 |
| Sentry Enterprise + Datadog | 3.500 |
| Email + SMS (notificações pais) | 1.500 |
| Equipe operacional (3 pessoas) | 35.000 |
| DPO terceirizado | 4.000 |
| **Total** | **~R$110.500** |

### 10.3 Custo de inferência LLM por plano

| Plano | Gerações típicas/mês | Custo LLM/usuário/mês (R$) | Preço (R$) | Margem bruta |
|---|---|---|---|---|
| Freemium | 5 | 0,80 | 0 | -R$0,80 (custo de aquisição) |
| Individual | 40 | 15 | 29 | R$14 (~48%) |
| Escola (por prof.) | 80 | 30 | ~25 (R$499/20) | -R$5 (loss leader nas séries iniciais) |
| Rede (por prof.) | 100 | 40 | ~50 (negociado) | R$10 (~20%) |

**Observação crítica:** o Plano Escola tem margem negativa por professor no preço base R$499/20. Sustentabilidade depende de: (a) renegociar para R$799/30 professores em médio prazo; (b) cobrar adicional por acesso de coordenador; (c) reduzir custo LLM via prompt caching + fine-tuning futuro.

### 10.4 Investimento de desenvolvimento revisado

A v4.1 estimava R$103k-218k para 12-14 meses. **Análise da v4.2 sugere que isso está subdimensionado.**

**Revisão realista (v4.2) — para 12-14 meses:**

| Recurso | Custo total (R$) |
|---|---|
| 2 devs fullstack pleno (R$15k/mês × 14) | 420.000 |
| 1 dev mobile Flutter (Fase 5 — 6 meses) | 90.000 |
| 1 designer UX/UI (meio período × 12 meses) | 60.000 |
| 1 especialista pedagógico (consultoria × 12 meses) | 72.000 |
| QA (terceirizado por sprint) | 40.000 |
| DevOps/Infra setup | 30.000 |
| Auditoria de segurança externa (pre-launch) | 25.000 |
| Auditoria LGPD/jurídico | 30.000 |
| Custos operacionais acumulados (12 meses cenário magro→médio) | 70.000 |
| **TOTAL** | **~R$837.000** |

**Comparação:**
- v4.1: R$103k-218k (assumindo fundador faz quase tudo).
- v4.2 realista: R$837k (com equipe profissional).
- v4.2 magro (fundador-faz-muito): ~R$350k-450k.

**Recomendação:** o investimento real deve ser declarado entre **R$450k (cenário magro) e R$850k (cenário profissional)**.

### 10.5 Caminho para break-even

**Premissas:**
- ARPU médio ponderado: R$45 (mix de planos).
- Custo operacional steady-state: R$30k/mês (após Fase 3).
- Break-even mensal: ~670 usuários pagantes.

**Trajetória alvo:**
- Mês 6: 100 usuários pagantes (Fase 1).
- Mês 12: 500 usuários pagantes (Fase 3).
- Mês 18: 1.500 usuários pagantes (pós-Fase 5).
- Break-even projetado: **mês 14-16**.

---

## 11. ROADMAP DE IMPLANTAÇÃO PROGRESSIVA COM KPIs (KPIs novos em v4.2)

Implementação em 5 fases ao longo de 12-14 meses. **Cada fase agora tem KPIs objetivos** para validar conclusão.

### Fase 0 — Fundação técnica e segurança (Semanas 1-4)

**Entregas:** autenticação, banco com RLS, serviço de IA centralizado, logs de auditoria, integração SimuladoApp (iframe + SSO + webhook), segurança base (HTTPS, rate limiting, RLS), estrutura LGPD inicial, **POC de Briefing Pedagógico**.

**Investimento estimado:** R$50k-80k.

**KPIs de conclusão:**
- ✅ Login funcional com 2FA.
- ✅ Webhook do SimuladoApp recebendo dados de teste.
- ✅ Auditoria de segurança externa concluída sem críticos abertos.
- ✅ 100% das policies RLS testadas com casos de tentativa de breach.
- ✅ POC do Briefing Pedagógico gerando JSON válido para 5 turmas de teste.

### Fase 1 — Agente de Arte + Gamificação + Calendário Pedagógico (Semanas 5-12)

**Entregas:** Agente de Arte completo (assistente + executor + export); **Gamificação Básica embutida no Arte (template para os demais agentes)**; Agente de Gamificação Avançada completo; Calendário Pedagógico com Diário de Bordo; Biblioteca de Conteúdo pessoal; Plano Freemium e Individual ativos.

**Investimento estimado:** R$80k-130k.

**KPIs de conclusão:**
- ✅ 50 professores pagantes (Individual ou Avulso).
- ✅ Conversão Freemium → Individual ≥ 8%.
- ✅ NPS ≥ 30 (alvo: 40+).
- ✅ Churn mensal ≤ 15%.
- ✅ Tempo médio para gerar plano de aula ≤ 30s P95.
- ✅ Taxa de "marcar como incorreto" em conteúdo IA ≤ 5%.
- ✅ DAU/MAU ≥ 25% (engajamento real).

### Fase 2 — Linguagens + Redação + Corretor (Semanas 13-20)

**Entregas:** Português, Literatura, Língua Estrangeira, Educação Física; Agente de Redação ENEM (professor + aluno com guardrails §2.4.1); Corretor ENEM com calibração validada (correlação >0.75 com nota humana); Marketplace de módulos avulsos; Portal do Aluno básico.

**Investimento estimado:** R$80k-130k.

**KPIs de conclusão:**
- ✅ 200 professores pagantes total.
- ✅ 50% dos professores ativos usando 2+ agentes.
- ✅ Corretor ENEM com correlação ≥ 0.75 com nota humana oficial.
- ✅ 30+ escolas em conversa comercial.
- ✅ Briefing Pedagógico ativo para 80% das turmas com simulado aplicado.

### Fase 3 — Matemática + Ciências da Natureza + Plano Escola (Semanas 21-30)

**Entregas:** Matemática (com LaTeX), Física, Química, Biologia; SimuladoApp totalmente integrado com Briefing Pedagógico personalizado; Planejador Curricular integrado; Portal do Responsável; Plano Escola ativo; **POC do constraint solver de horário tempo integral**.

**Investimento estimado:** R$110k-170k.

**KPIs de conclusão:**
- ✅ 500 professores pagantes total.
- ✅ 10+ escolas no Plano Escola (B2B funcionando).
- ✅ Receita mensal recorrente (MRR) ≥ R$25.000.
- ✅ Briefing Pedagógico personalizado disponível para 100% dos professores do Plano Escola.
- ✅ POC constraint solver resolve escola-modelo (400 alunos) em <60s.

### Fase 4 — Ciências Humanas + Dashboard de Coordenação (Semanas 31-42)

**Entregas:** História, Geografia, Filosofia, Sociologia; Dashboard de Coordenação com alertas; Biblioteca compartilhada; Exportação compatível com diário oficial (DCEPA); 2FA obrigatório para coordenador/gestor; **integração nativa com DCEPA**.

**Investimento estimado:** R$110k-180k.

**KPIs de conclusão:**
- ✅ 1.000 professores pagantes total.
- ✅ 30+ escolas no Plano Escola.
- ✅ MRR ≥ R$50.000.
- ✅ 1ª secretaria municipal em conversa de Plano Rede.
- ✅ Coordenadores reportam uso ativo do dashboard (>3x/semana).

### Fase 5 — Plataforma completa + Modo offline + Plano Rede (Semanas 43-56)

**Entregas:** App mobile Flutter com offline; Dashboard de Rede; Sistema evolutivo com memória pedagógica por turma; Relatórios institucionais; Integrações com Google Classroom e Moodle; Conformidade LGPD completa com DPO; Plano Rede ativo.

**Investimento estimado:** R$150k-250k.

**KPIs de conclusão:**
- ✅ 1.500 professores pagantes total.
- ✅ 50+ escolas no Plano Escola.
- ✅ 1-2 contratos de Plano Rede ativos.
- ✅ MRR ≥ R$100.000 (caminho para break-even).
- ✅ App mobile com 40%+ de adoção entre professores ativos.
- ✅ NPS ≥ 50.

### Investimento total revisado

**v4.2 — cenário magro (fundador hands-on):** R$450k-550k.
**v4.2 — cenário profissional (equipe completa):** R$700k-900k.

---

## 12. VALIDAÇÃO DE USUÁRIO E PESQUISA (NOVO em v4.2)

**Capítulo novo em v4.2.** Endereça o gap mais grave de pesquisa identificado na análise.

### 12.1 Plano de pesquisa pré-Fase 1

**Antes de investir em desenvolvimento da Fase 1, executar:**

- **Entrevistas estruturadas** com 15-30 professores reais (rede pública + privada, urbano + interior).
- **5 entrevistas com coordenadores pedagógicos**.
- **3 entrevistas com gestores escolares**.
- **2 sessões de teste de usabilidade** com protótipos de baixa fidelidade.
- **Pesquisa quantitativa** com 100+ professores via formulário online.

**Investimento estimado:** R$8k-15k + 4-6 semanas.
**Output esperado:** validação ou pivot de até 30% das hipóteses do PRD.

### 12.2 Personas validadas (estado da arte — a refinar com pesquisa)

#### Persona 1 — Prof. Lúcia Mendes (Rede Pública, multi-escola)
- 42 anos, professora de Português em 3 escolas estaduais do Pará.
- Carga horária: 56h/semana (manhã + tarde + noite).
- Dispositivos: celular Android antigo + computador da escola.
- Internet: dados móveis limitados (4GB/mês) + Wi-Fi escolar instável.
- Dor principal: tempo para planejar; preencher diário; corrigir provas.
- Renda: R$3.500-4.500/mês — preço importa muito.
- **O produto resolve:** Calendário com Diário automatizado + planos prontos para revisar + offline.
- **Plano provável:** Individual no início; escola adere depois.

#### Persona 2 — Prof. Rafael Costa (Escola Particular, ENEM-focused)
- 35 anos, professor de Matemática em escola particular de Belém.
- Carga: 30h/semana + plantão de dúvidas.
- Dispositivos: notebook próprio + iPad da escola.
- Internet: fibra estável.
- Dor principal: gerar listas de exercícios variadas; acompanhar evolução individual dos alunos para o ENEM.
- Renda: R$8.000-12.000/mês.
- **O produto resolve:** Briefing Pedagógico para focar nos descritores mais fracos + gerador de questões.
- **Plano provável:** Individual + adesão da escola ao Plano Escola.

#### Persona 3 — Prof. Ana Silva (Interior do Pará, conectividade limitada)
- 38 anos, professora de Ciências em escola estadual em Marabá.
- Carga: 40h/semana.
- Dispositivos: celular pessoal + computador velho da escola.
- Internet: 3G intermitente.
- Dor principal: falta de materiais; isolamento profissional; sem apoio pedagógico.
- Renda: R$3.200/mês.
- **O produto resolve:** Modo offline + Biblioteca de Conteúdo + acesso a materiais alinhados à DCEPA + agente como "colega" pedagógico.
- **Plano provável:** Freemium prolongado → conversão difícil sem desconto institucional.

#### Persona 4 — Coord. Marcia Tavares (Coordenadora Pedagógica)
- 45 anos, coordenadora de Ensino Médio em escola privada de Belém.
- Dor principal: acompanhar cobertura curricular real vs. planejada; identificar professores em dificuldade; gerar relatórios para direção.
- **O produto resolve:** Dashboard de Coordenação + alertas + relatórios.
- **Plano provável:** influenciadora-chave para adesão ao Plano Escola.

### 12.3 Hipóteses críticas a validar

| # | Hipótese | Como validar | Quando |
|---|---|---|---|
| H1 | Professor brasileiro está disposto a pagar R$29/mês por 1 agente | Pesquisa quantitativa + landing page com checkout | Pré-Fase 1 |
| H2 | Calendário com Diário automatizado é "must-have" para professor | Entrevistas qualitativas + teste de protótipo | Pré-Fase 1 |
| H3 | Briefing Pedagógico muda comportamento do professor (foca em descritores fracos) | A/B test interno com 2 cohorts | Fase 2-3 |
| H4 | Coordenadores adotam dashboard como ferramenta diária | Análise de uso pós-Fase 4 | Fase 4 |
| H5 | Secretaria municipal compra Plano Rede para rede pública | 5+ conversas comerciais reais | Fase 4-5 |
| H6 | Modo offline funciona em escolas com 3G real | Piloto em 3 escolas do interior | Fase 5 |
| H7 | App mobile substitui acesso web para 40%+ dos professores | Métricas de uso pós-Fase 5 | Fase 5 |

### 12.4 Programa de escolas-piloto

**Critério:** 3 escolas selecionadas para piloto gratuito durante Fase 1-2 em troca de feedback intensivo:
- 1 escola pública urbana (Belém).
- 1 escola privada média (Belém).
- 1 escola pública interior (Marabá ou Santarém).

**Compromisso:** plataforma gratuita por 6 meses + 2 reuniões mensais de feedback + análise de uso compartilhada.

---

## 13. RESUMO EXECUTIVO

### 13.1 O que é?

Plataforma integrada SaaS que une gestão pedagógica e suporte pedagógico baseado em IA generativa. Para o contexto brasileiro real — BNCC, DCEPA, ENEM, tempo integral, internet instável, Amazônia.

**Diferencial competitivo (três pilares):**
1. **Agentes de IA Pedagógicos** (13 disciplinas + módulos).
2. **Calendário Pedagógico com Diário de Bordo** (compatível com diário oficial).
3. **Briefing Pedagógico** (integração nativa com SimuladoApp — único no mercado).

### 13.2 Para quem?

- **Professores (B2C):** geram aulas, planejam, registram em tempo real.
- **Escolas (B2B):** acompanham cobertura curricular e desempenho.
- **Redes de educação (B2B Enterprise):** visão comparativa e relatórios para secretarias.

Todo professor pode começar grátis com Freemium.

### 13.3 O que entrega?

- 13 Agentes de Disciplina (vendáveis individualmente) **com Gamificação Básica nativa em cada um**.
- Agente de Gamificação Avançada (módulo dedicado para campanhas, torneios e festivais).
- Agente de Redação ENEM + Corretor calibrado.
- Calendário Pedagógico com Diário de Bordo integrado.
- Planejador Curricular alinhado a BNCC/DCEPA.
- Biblioteca de Conteúdo com busca e reutilização.
- Portal do Aluno com evolução, treino de redação e guardrails de IA.
- Portal do Responsável com login próprio e relatórios automáticos.
- Dashboard de Coordenação com alertas pedagógicos.
- Dashboard Executivo para gestores.
- Modo offline para internet instável.
- Organizadores de Horário (convencional + tempo integral).
- Segurança enterprise-grade + LGPD completo + Governança de IA responsável.

### 13.4 Por quanto?

- **Freemium:** grátis com limitações.
- **Individual:** R$29/mês por agente (loss leader estratégico).
- **Escola:** R$499 / R$799 / R$1.299 por mês (até 20 / 50 / 100 professores).
- **Rede:** R$2.000-15.000/mês (customização + integrações + suporte dedicado).

### 13.5 Em quanto tempo?

12-14 meses até plataforma completa. Cada fase entrega valor e gera receita.
Break-even projetado: mês 14-16.

### 13.6 Diferencial técnico

- **Briefing Pedagógico** (capítulo 6) — schema definido, política de injeção clara, fallback documentado, custo calculado. Nenhum concorrente tem.
- **Calendário Pedagógico com Diário de Bordo** elimina fricção de registro com migração automática de conteúdo + auditoria + compatibilidade com diário oficial.
- **Governança de IA** (capítulo 5) — pseudonimização obrigatória, prompts versionados, custos modelados, fallbacks documentados.

### 13.7 Diferencial de mercado

Construída para o Brasil real. Tempo integral, internet instável, realidade amazônica. Alinhada com BNCC, DCEPA, ENEM. Freemium remove atrito. Funil B2C → B2B → Rede é maduro.

### 13.8 Riscos e mitigações (atualizado em v4.2)

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Adoção lenta de IA educacional no Brasil | Alta | Alto | Freemium remove fricção; Gamificação Avançada é visível e viral; SimuladoApp já tem usuários (alavanca inicial) |
| Resistência de professores à mudança | Alta | Médio | UX intuitiva validada por pesquisa; Biblioteca cria retenção; SimuladoApp transparente |
| Conformidade LGPD complexa (especialmente IA) | Média | Alto | RLS no banco; pseudonimização em prompts; consentimento específico para IA; DPO designado |
| Concorrência (Geekie, MagicSchool) | Alta | Médio | Fosso: Briefing Pedagógico + contexto BR + preço acessível |
| Custo de inferência LLM acima do previsto | Média | Alto | Prompt caching; fine-tuning futuro; tier de uso justo no Individual |
| Constraint solver de horário não escalar | Média | Médio | POC obrigatório antes de promessa comercial |
| Sincronização offline com conflitos | Alta | Médio | Last-write-wins por campo + merge interativo para conflitos importantes |
| Alucinação da IA gera conteúdo incorreto em sala | Média | Alto | Grounding em BNCC, badge "revise antes de usar", botão de erro, responsabilidade contratual no professor |
| Transferência internacional de dados (LGPD) | Baixa | Alto | Cláusulas modelo ANPD; opção futura de inferência local |

---

## 14. APÊNDICE A: ANÁLISE COMPARATIVA COM CONCORRENTES (NOVO em v4.2)

### 14.1 Mapa competitivo

| Concorrente | Mercado | Preço | O que tem que SimuladoApp.Edu não tem | O que SimuladoApp.Edu tem que eles não têm |
|---|---|---|---|---|
| **MagicSchool AI** | Global, professores | Freemium + US$10-15/mês | 60+ ferramentas, marca global | Contexto BR, BNCC/DCEPA, Briefing Pedagógico |
| **Khanmigo** | Global, alunos+prof. | US$4-9/mês | Backing institucional, pesquisa | Foco professor BR, calendário oficial |
| **Geekie One** | BR, escolas privadas | Contrato escolar | Base instalada, conteúdo curado | IA generativa nativa, preço acessível, freemium |
| **Curipod** | Global | Freemium + US$10-20/mês | Slides interativos polidos | Profundidade pedagógica, integração com dados |
| **Brainly/Studeo** | LATAM | Freemium para aluno | Marca, escala | B2B, foco professor |
| **TeachMate AI** | UK + global | £6-9/mês | Maturidade do produto | Contexto BR, BNCC |
| **Eduardo (IA Embraer/SP)** | BR, rede pública SP | Gratuito (contrato com governo) | Patrocínio estatal | Profundidade pedagógica + portfólio completo |
| **Layla (IA do MEC)** | BR, rede pública | Gratuito (governo) | Endorsement oficial | Funcionalidades comerciais robustas |

### 14.2 Posicionamento competitivo

- **Não competir com Khan/MagicSchool no global** — perdemos em escala e marca.
- **Não competir com Geekie em escola privada de elite** — perdemos em base instalada.
- **Ganhar contra Excel + WhatsApp + ChatGPT solto** — que é o que ~90% dos professores brasileiros usam hoje.
- **Espaço claro:** rede pública urbana, escolas privadas pequenas/médias, redes municipais de educação.
- **Threat principal:** se o MEC ou uma secretaria estadual grande lançar IA gratuita nacional, mercado contrai. Mitigação: contratos B2B antes que isso aconteça.

### 14.3 Estratégia anti-comoditização

- **Calendário Pedagógico** é o que retém — investir em deep features (integração DCEPA, exportação para sistema oficial, app mobile).
- **Briefing Pedagógico** é o que diferencia — manter posse do canal SimuladoApp e melhorar continuamente.
- **Conteúdo curado por especialistas** (few-shot examples) cria fosso difícil de copiar.
- **Comunidade de professores** via Biblioteca compartilhada cria efeito de rede.

---

## 15. APÊNDICE B: ANÁLISE DE GAPS E ROADMAP PARA v4.3

### 15.1 O que foi resolvido na v4.2

- ✅ Gamificação reestruturada (Básica embutida + Avançada autônoma).
- ✅ Arquitetura de IA e Governança Responsável (capítulo 5 novo).
- ✅ Arquitetura do Briefing Pedagógico (capítulo 6 novo).
- ✅ Unit Economics e Custos Operacionais (capítulo 10 novo).
- ✅ KPIs por fase de roadmap.
- ✅ Validação de Usuário e Personas (capítulo 12 novo).
- ✅ Análise comparativa com concorrentes (capítulo 14 novo).
- ✅ Reescrita dos 13 agentes (eliminação de repetição, destaque de diferenciais reais).
- ✅ Calendário Pedagógico promovido a pilar central.
- ✅ Política de IA para aluno com guardrails (§2.4.1).
- ✅ Login separado para responsável (§2.5).
- ✅ Plano Individual reposicionado como loss leader explícito.
- ✅ Investimento revisado para cenário realista.

### 15.2 Gaps remanescentes (para v4.3 ou futuras versões)

- Wireframes/protótipos de UI para cada perfil.
- Documento de Arquitetura Técnica separado (componentes, APIs, fluxos).
- Plano de marketing e go-to-market detalhado.
- Plano de onboarding por plano (Freemium, Individual, Escola, Rede).
- Estratégia de suporte técnico (canais, SLA por plano).
- Detalhes técnicos completos de integrações com Google Classroom e Moodle.
- Segmentação do perfil "Gestor" entre Diretor Privado e Gestor Público.
- Política detalhada de fine-tuning futuro com dados próprios.
- Plano de internacionalização (futuro — outros países lusófonos).

### 15.3 Próximas ações recomendadas (em ordem)

1. **Conduzir pesquisa pré-Fase 1** (capítulo 12) — 4-6 semanas, R$8k-15k.
2. **Criar documento de Arquitetura Técnica separado** — antes de Fase 0.
3. **Criar wireframes de baixa fidelidade** para todos os perfis — antes de Fase 0.
4. **Validar orçamento revisado** com 2-3 devs/agências reais.
5. **POC do constraint solver** de horário — antes de prometer em vendas (pré-Fase 3).
6. **Auditoria jurídica LGPD** especialmente sobre processamento por IA — antes de Fase 1.
7. **Pen-test de RLS** — antes de Fase 0 fechar.
8. **Calibração do Corretor ENEM** contra corpus de redações reais — pré-Fase 2.

---

*Fim do PRD v4.2*
*Documento vivo — atualizações em CHANGELOG_v41_v42.md*
