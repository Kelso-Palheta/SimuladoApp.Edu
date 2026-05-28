# Design Pedagógico — Sequência Didática (RF-003)

**Versão:** 1.0
**Data:** 2026-05-20
**Orquestrador:** SandecoMaestro

---

## 1. Estrutura Pedagógica

As 8 seções formam um fluxo pedagógico completo. Ordem importa — cada seção depende ou prepara a seguinte.

```
Objetivo Geral ──→ Objetivos Específicos ──→ Metodologia
                                                    │
Avaliação ←── Etapas ←── Recursos ←────────────────┘
    │
Referências
```

**Dependências pedagógicas:**

| Seção | Depende de | Justificativa |
|-------|-----------|---------------|
| Titulo | Conteudo.titulo + disciplina | Nome da aula deriva do conteúdo base |
| Objetivo Geral | Conteudo.descricao + BNCC | Alinhado à habilidade BNCC do conteúdo |
| Objetivos Específicos | Objetivo Geral | Decompõem o objetivo geral em verificáveis |
| Metodologia | Objetivos Específicos + série | Abordagem adequada à faixa etária |
| Recursos | Metodologia + Etapas | Recursos dependem do que será feito |
| Etapas | Objetivos + Metodologia + carga_estimada | Cronograma da aula |
| Avaliação | Objetivos Específicos | Avalia o que foi definido como objetivo |
| Referências | Conteúdo + Disciplina | Fontes relevantes ao tema |

---

## 2. Validações Pedagógicas

### 2.1 Validações Estruturais

| Validação | Regra | Severidade |
|-----------|-------|------------|
| V01 — Duração total | Soma `duracao_minutos` de todas as etapas entre 40-55 min | Erro |
| V02 — Etapas mínimas | Mínimo 4 etapas (abertura, desenvolvimento, prática, fechamento) | Erro |
| V03 — Objetivos mensuráveis | Cada objetivo específico contém verbo de ação observável (identificar, resolver, classificar, produzir...) | Warning |
| V04 — Recursos coerentes | Recursos listados são físicos/digitais concretos, não abstratos | Warning |
| V05 — Referências reais | Referências parecem títulos reais (não genéricos como "Livro didático") | Warning |
| V06 — Etapa de avaliação | Pelo menos 1 etapa é de verificação de aprendizagem | Warning |
| V07 — Objetivo alinhado BNCC | Objetivo geral contém habilidade compatível com a habilidade_bncc do conteúdo | Info |

### 2.2 Verbos de Ação Esperados (Taxonomia de Bloom adaptada)

```
Nível 1 — Conhecimento: identificar, reconhecer, listar, nomear
Nível 2 — Compreensão: explicar, descrever, resumir, classificar
Nível 3 — Aplicação: resolver, usar, demonstrar, executar
Nível 4 — Análise: comparar, diferenciar, examinar, investigar
Nível 5 — Síntese: criar, planejar, produzir, elaborar
Nível 6 — Avaliação: argumentar, criticar, julgar, defender
```

### 2.3 Estrutura Mínima de Etapas (Template)

```
Etapa 1 — Abertura (5-10 min): contextualização, levantamento conhecimento prévio
Etapa 2 — Desenvolvimento 1 (10-15 min): exposição do conteúdo novo
Etapa 3 — Desenvolvimento 2 (10-15 min): atividade prática/colaborativa
Etapa 4 — Síntese (5-10 min): discussão, correção, dúvidas
Etapa 5 — Fechamento (3-5 min): resumo, conexão com próxima aula
```

---

## 3. Conexão com Modelos Existentes

```
PlanejamentoAnual
  └── PlanejamentoBimestral
        ├── Conteudo ──────────── SequenciaDidatica (NEW)
        │    ├── titulo              ├── conteudo_id (FK)
        │    ├── descricao           ├── titulo
        │    ├── tipo                ├── objetivo_geral
        │    ├── prioridade          ├── objetivos_especificos[]
        │    ├── carga_estimada      ├── metodologia
        │    └── habilidade_bncc     ├── recursos[]
        │                            ├── etapas[]
        └── AulaPlano                ├── avaliacao
             ├── conteudo_id (FK)    └── referencias[]
             ├── data
             └── status_execucao
```

**Regra de negócio:** Conteudo tem 1 SequenciaDidatica (1:1). Se já existe, novo POST sobrescreve (update). AulaPlano referencia Conteudo — ao confirmar execução, professor visualiza a sequência vinculada.

---

## 4. Prompt IA Otimizado

```python
SEQUENCE_SYSTEM_PROMPT = """Você é um professor especialista em didática com 15 anos de experiência em sala de aula. Conhece profundamente a BNCC, metodologias ativas (sala de aula invertida, aprendizagem baseada em problemas, ensino híbrido) e taxonomia de Bloom.

Ao gerar uma sequência didática:
1. Use linguagem clara e objetiva — imagine que um professor substituto precisa dar essa aula amanhã
2. Objetivos específicos SEMPRE começam com verbo de ação observável
3. Etapas devem ser realistas e cronometradas — respeite o tempo de atenção da faixa etária
4. Metodologia deve mencionar a abordagem pedagógica usada
5. Recursos devem ser itens que uma escola pública brasileira típica possui
6. Avaliação deve ser prática e rápida de aplicar
7. Referências devem incluir pelo menos 1 fonte digital acessível gratuitamente"""
```

---

## 5. Critérios de Qualidade da Resposta IA

| Critério | Peso | Como verificar |
|----------|------|---------------|
| CQ-01: Objetivos usam verbos de ação | 25% | Regex contra lista de verbos Bloom |
| CQ-02: Etapas somam 40-55 min | 25% | Soma aritmética |
| CQ-03: Todas as 8 seções preenchidas | 20% | None/empty check em cada campo |
| CQ-04: Mínimo 3 objetivos específicos | 10% | len(objetivos_especificos) >= 3 |
| CQ-05: Mínimo 4 etapas | 10% | len(etapas) >= 4 |
| CQ-06: Referências incluem URL | 10% | Regex http(s) em referencias |

**Score mínimo para aceitar:** ≥ 60/100. Abaixo disso, retry com prompt reforçando critérios falhos.

---

## 6. Integração com AulaPlano (ponte RF-003 → RF-004)

Quando professor gera sequência didática e depois sincroniza calendário:

```
1. RF-003: Conteudo → SequenciaDidatica (plano detalhado da aula)
2. RF-004: Conteudo → AulaPlano.data (data real no calendário)
3. Professor vê AulaPlano com: data, conteúdo, link para sequência didática
```

---

## 7. Métricas de Qualidade

| Métrica | Target |
|---------|--------|
| Taxa aceitação 1ª tentativa (score ≥ 60) | ≥ 80% |
| Objetivos com verbos Bloom (CQ-01) | ≥ 90% |
| Etapas com soma 40-55 min (CQ-02) | ≥ 85% |
| Tempo médio geração | < 15s |
