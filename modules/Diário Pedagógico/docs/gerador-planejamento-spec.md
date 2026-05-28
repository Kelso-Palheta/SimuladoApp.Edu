# Spec: Gerador de Planejamento Anual + Bimestral

**Versão:** 1.0
**Status:** Em Revisão
**Autor:** Kelso Palheta + Claude AI
**Data:** 2026-05-20
**Reviewers:** Claude AI (automated)

---

## 1. Resumo

Feature core do módulo. Professor informa disciplina, série, carga horária e temas curriculares. Sistema chama Gemini API, gera planejamento anual completo com 4 bimestres, distribui conteúdos entre eles e persiste tudo no PostgreSQL.

---

## 2. Contexto e Motivação

**Problema:**
Professores gastam 10-20h por disciplina montando planejamento anual manualmente. Precisam consultar BNCC, distribuir carga horária, alinhar com calendário escolar. Erro humano frequente — carga horária mal distribuída, temas esquecidos.

**Evidências:**
PRD cita "gerar planejamento pedagógico em segundos" como valor central. Sem este módulo, nenhum outro funciona (Gamificação, Simulação, Avaliação dependem de planejamento base).

**Por que agora:**
É o RF-001 — primeiro requisito funcional, fundação sobre a qual todos os outros 6 RFs são construídos.

---

## 3. Goals (Objetivos)

- [ ] G-01: Professor preenche formulário com 5 campos e recebe planejamento anual completo em < 30s
- [ ] G-02: Planejamento gerado cobre 100% da carga horária informada com distribuição entre 4 bimestres
- [ ] G-03: Sistema persiste planejamento + bimestres + conteúdos no banco com integridade referencial
- [ ] G-04: Em caso de falha da API de IA, sistema retorna erro claro com indicação de retry

**Métricas de sucesso:**
| Métrica | Baseline atual | Target | Prazo |
|---------|---------------|--------|-------|
| Tempo de geração | Manual (10-20h) | < 30s | MVP1 |
| Taxa de sucesso (IA responde JSON válido) | N/A | ≥ 95% | MVP1 |
| Cobertura de carga horária | Variável (erro humano) | 100% | MVP1 |
| Planejamentos salvos com sucesso | N/A | 100% (sem órfãos) | MVP1 |

---

## 4. Non-Goals (Fora do Escopo)

- NG-01: Integração com calendário escolar real (Google/Outlook) — RF-004, Fase 2
- NG-02: Geração de sequência didática detalhada por aula — RF-003, Fase 2
- NG-03: Confirmação de execução de aulas — RF-005, Fase 4
- NG-04: Reagendamento automático — RF-006, Fase 4
- NG-05: Exportação para PDF/Word
- NG-06: Edição manual do planejamento gerado (versão futura)

---

## 5. Usuários e Personas

**Usuário primário:** Professor de ensino fundamental/médio, familiaridade básica com web. Acessa a plataforma, preenche formulário, clica "Gerar Planejamento".

**Jornada atual (sem a feature):**
1. Professor abre documento Word/Google Docs vazio
2. Consulta BNCC manualmente
3. Distribui temas por bimestre fazendo contas manuais de carga horária
4. Revisa e ajusta (4-8h de trabalho)

**Jornada futura (com a feature):**
1. Professor preenche: disciplina, série, carga horária semanal, ano letivo, temas curriculares
2. Clica "Gerar Planejamento"
3. Aguarda < 30s enquanto sistema processa
4. Visualiza planejamento anual com 4 bimestres e conteúdos distribuídos
5. Salvo automaticamente no banco

---

## 6. Requisitos Funcionais

### 6.1 Requisitos Principais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | O sistema (FastAPI) deve aceitar POST com body JSON contendo disciplina, serie, carga_horaria_semanal, ano_letivo, temas_curriculares | Must | POST com body JSON válido retorna 201 |
| RF-02 | O backend deve montar prompt estruturado com todos os campos do input e enviar para Gemini API | Must | Prompt inclui todos os campos do input + instruções de output JSON |
| RF-03 | O backend deve parsear a resposta JSON da IA contendo planejamento anual + 4 bimestres | Must | JSON.parse bem-sucedido, validação Pydantic passa |
| RF-04 | O backend deve persistir PlanejamentoAnual + 4 PlanejamentoBimestral + Conteudo[] em transação atômica | Must | Commit único, rollback se qualquer insert falhar |
| RF-05 | O backend deve retornar planejamento completo (anual + bimestres + conteúdos) no response 201 | Must | Response inclui id, status, dados estruturados |
| RF-06 | O backend deve retornar erro 502 com mensagem clara se Gemini API falhar após 2 retries | Must | Mensagem: "Falha ao gerar planejamento. Tente novamente." |
| RF-07 | O backend deve validar que soma das cargas horárias dos 4 bimestres = carga horária anual calculada | Should | Soma das cargas bimestrais confere com input × 40 semanas |
| RF-08 | O backend deve criar novo registro a cada POST — nunca sobrescrever planejamento existente | Must | Cada POST cria novo PlanejamentoAnual, mesmo com input idêntico |

### 6.2 Fluxo Principal (Happy Path)

1. Professor envia `POST /api/planning/annual` com body JSON
2. Backend valida input com Pydantic → 422 se inválido
3. Backend calcula carga horária anual: `carga_horaria_semanal × 40 semanas`
4. Backend monta prompt Gemini com template incluindo todos os campos
5. Backend chama Gemini API (model: `gemini-2.0-flash`)
6. Gemini retorna JSON com: `{ ano_letivo, disciplina, serie, carga_horaria_anual, bimestres: [{numero, titulo, temas, carga_horaria, conteudos: [{titulo, descricao, tipo, carga_estimada}] }] }`
7. Backend valida JSON com Pydantic schema
8. Backend abre transação DB → insere PlanejamentoAnual → insere 4 PlanejamentoBimestral → insere Conteudo[] para cada bimestre → commit
9. Backend retorna 201 com objeto completo incluindo IDs

### 6.3 Fluxos Alternativos

**Fluxo Alternativo A — Gemini retorna JSON inválido:**
1. Backend tenta parsear resposta → Pydantic ValidationError
2. Backend faz retry (máx 2) com prompt reforçando schema JSON esperado
3. Se 2º retry falhar → retorna 502 com `{ "error": "gemini_invalid_response", "detail": "IA retornou resposta fora do schema esperado após 2 tentativas" }`

**Fluxo Alternativo B — Gemini timeout (30s):**
1. Timeout de 30s na chamada Gemini
2. Retry automático 1x
3. Se 2º timeout → 502 `{ "error": "gemini_timeout", "detail": "Serviço de IA não respondeu a tempo" }`

**Fluxo Alternativo C — Carga horária não bate:**
1. Sistema calcula soma das cargas bimestrais
2. Se diferença > 5% da carga anual esperada → flag `carga_warning: true` no response
3. Planejamento é salvo mesmo assim, mas campo `status = "carga_desalinhada"`

---

## 7. Requisitos Não-Funcionais

| ID | Requisito | Valor alvo | Observação |
|----|-----------|-----------|------------|
| RNF-01 | Tempo de resposta p95 | < 30s | Dominado pela latência da Gemini API |
| RNF-02 | Validação de input | < 50ms | Pydantic, sem IO |
| RNF-03 | Persistência | Transação atômica | Commit único para planejamento + bimestres + conteúdos |
| RNF-04 | Retry policy | Máx 2 tentativas, exponencial backoff 1s → 2s | Aplica apenas a falhas de parsing/schema |
| RNF-05 | Rate limit | 10 req/min por professor_id | Prevenir abuso da API de IA |

---

## 8. Design e Interface

**Componentes afetados:** `POST /api/planning/annual`, `POST /api/planning/bimonthly` (endpoint bimonthly é gerado internamente pelo annual, não exposto diretamente no MVP1)

**Comportamento esperado:**
1. Frontend envia POST com body contendo os 5 campos obrigatórios + temas opcionais
2. Loading state no frontend: spinner/texto "Gerando planejamento..." por até 30s
3. Sucesso: frontend renderiza timeline anual com 4 cards bimestrais
4. Erro: toast/modal com mensagem clara e botão "Tentar novamente"

**Estados da UI:**
- Estado vazio: Formulário com campos a preencher
- Estado de carregamento: Spinner + "Consultando IA e montando planejamento..."
- Estado de erro: Alert com ícone ❌ + mensagem descritiva + botão retry
- Estado de sucesso: Timeline colorida com 4 bimestres + lista de conteúdos

---

## 9. Modelo de Dados

Entidades já existem em `backend/app/models/planejamento.py` e `backend/app/models/aula.py`.

**Schemas Pydantic para API:**

### Request — `POST /api/planning/annual`

```python
class GerarPlanejamentoRequest(BaseModel):
    professor_id: str                    # ex: "prof-123"
    disciplina: str                      # ex: "Língua Portuguesa"
    serie: str                           # ex: "3º Ano Ensino Médio"
    carga_horaria_semanal: int           # ex: 5 (aulas por semana)
    ano_letivo: int                      # ex: 2026
    temas_curriculares: list[str] | None # ex: ["Gramática", "Literatura", "Redação"]
```

### Response — `POST /api/planning/annual` (201)

```python
class ConteudoOut(BaseModel):
    id: UUID
    titulo: str
    descricao: str | None
    tipo: str | None
    carga_horaria_estimada: int

class BimestreOut(BaseModel):
    id: UUID
    numero: int
    titulo: str | None
    temas_principais: str | None
    carga_horaria: int
    conteudos: list[ConteudoOut]

class PlanejamentoResponse(BaseModel):
    id: UUID
    professor_id: str
    disciplina: str
    serie: str
    carga_horaria_semanal: int
    carga_horaria_anual: int
    ano_letivo: int
    status: str
    carga_warning: bool
    bimestres: list[BimestreOut]
    created_at: datetime
```

### Schema esperado da Gemini (formato prompt)

```json
{
  "ano_letivo": 2026,
  "disciplina": "Língua Portuguesa",
  "serie": "3º Ano Ensino Médio",
  "carga_horaria_anual": 200,
  "bimestres": [
    {
      "numero": 1,
      "titulo": "Gramática e Interpretação de Texto",
      "temas_principais": "Gramática normativa, Interpretação textual, Gêneros textuais",
      "carga_horaria": 50,
      "conteudos": [
        {
          "titulo": "Classes gramaticais — revisão",
          "descricao": "Revisão das 10 classes gramaticais com foco em substantivo, verbo e adjetivo",
          "tipo": "teoria",
          "carga_estimada": 5
        }
      ]
    }
  ]
}
```

---

## 10. Integrações e Dependências

| Dependência | Tipo | Impacto se indisponível |
|-------------|------|------------------------|
| Gemini API (`gemini-2.0-flash`) | Obrigatória | Erro 502, usuário não consegue gerar planejamento |
| PostgreSQL | Obrigatória | Erro 500, planejamento gerado mas não salvo (sem fallback) |
| `GEMINI_API_KEY` env var | Obrigatória | Startup falha se ausente — sistema não sobe |

---

## 11. Edge Cases e Tratamento de Erros

| Cenário | Trigger | Comportamento esperado |
|---------|---------|----------------------|
| EC-01: Input inválido | Campo obrigatório ausente ou tipo errado | 422 com `detail: [{loc, msg, type}]` via Pydantic |
| EC-02: Carga horária zero | `carga_horaria_semanal = 0` | 422: "carga_horaria_semanal deve ser ≥ 1" |
| EC-03: Ano letivo passado | `ano_letivo < ano_atual - 1` | Aceita mas adiciona warning `ano_passado: true` no response |
| EC-04: Temas vazios | `temas_curriculares = []` ou `null` | Prompt pede para IA inferir temas baseado na disciplina/série |
| EC-05: Gemini retorna JSON com campos faltando | Falta `bimestres[2].conteudos` | Retry 2x; se persistir, 502 |
| EC-06: Gemini retorna conteúdo impróprio | Safety filter da Gemini dispara | 502 com `detail: "Conteúdo bloqueado pelo filtro de segurança da IA"` |
| EC-07: Rollback no DB | Falha ao inserir PlanejamentoBimestral após PlanejamentoAnual OK | Transação faz rollback completo, nada persiste, 500 |
| EC-08: Carga horária bimestres não soma com anual | Gemini distribuiu errado | Persiste com `status = "carga_desalinhada"` + `carga_warning: true` |
| EC-09: Rate limit excedido | Mesmo professor_id > 10 req/min | 429 `{ "error": "rate_limited", "retry_after_seconds": 47 }` |
| EC-10: Duas requests simultâneas mesmo professor | Concorrência não bloqueante | Cada request gera planejamento independente (idempotência por criação) |

---

## 12. Segurança e Privacidade

- **Autenticação:** Endpoint requer `professor_id` no body. MVP1: confia no ID enviado. MVP2: JWT no header.
- **Autorização:** Professor só acessa seus próprios planejamentos (via `professor_id` match).
- **Dados sensíveis:** Nomes de professores e disciplinas não são PII crítico. API key da Gemini armazenada em env var, nunca em código.
- **Auditoria:** Log de cada chamada: `timestamp, professor_id, disciplina, status (success/failure), duração, tokens_usados`.

---

## 13. Plano de Rollout

- **Estratégia:** Feature flag `ENABLE_AI_GENERATION` — permite desabilitar geração via IA e usar mock em dev.
- **Como reverter (rollback):** Setar `ENABLE_AI_GENERATION=false` → endpoint retorna 503 "Em manutenção".
- **Monitoramento pós-deploy:** Logar latência Gemini, taxa de retry, taxa de parse failures.

---

## 14. Open Questions

| # | Pergunta | Impacto | Dono | Prazo |
|---|---------|---------|------|-------|
| OQ-01 | Google Gemini vs OpenAI como primário? PRD cita ambos. | Médio | Kelso | 2026-05-21 |
| OQ-02 | Quantas semanas letivas considerar no cálculo? Fixo 40 ou parametrizável? | Baixo | Kelso | 2026-05-21 |
| OQ-03 | Prompts em português ou inglês? Impacta qualidade e custo de tokens | Médio | Kelso | 2026-05-21 |

---

## 15. Decisões Tomadas (Decision Log)

| Decisão | Alternativas consideradas | Racional |
|---------|--------------------------|---------|
| Gemini 2.0 Flash como modelo primário | GPT-4o, Claude | Mais barato, mais rápido, prompt em português funciona bem |
| 2 retries com backoff exponencial | 1 retry, 3 retries, sem retry | 2 é equilíbrio entre latência e resiliência |
| Schema validation dupla (Pydantic + prompt constraint) | Só prompt constraint | Pydantic garante parse no backend mesmo se IA desviar |
| Planejamento sempre criado (nunca atualizado) | Upsert por professor+ano+disciplina | Professor pode querer múltiplas versões para comparar |
| 40 semanas letivas como padrão | 36, 38, 44 | Calendário escolar brasileiro típico: 200 dias = 40 semanas |

---

## Apêndice

### Prompt Gemini — Template

```
Você é um especialista em planejamento pedagógico brasileiro. Gere um planejamento anual completo no formato JSON.

DISCIPLINA: {disciplina}
SÉRIE/NÍVEL: {serie}
CARGA HORÁRIA SEMANAL: {carga_horaria_semanal} aulas
CARGA HORÁRIA ANUAL: {carga_horaria_anual} aulas
ANO LETIVO: {ano_letivo}
TEMAS CURRICULARES: {temas_curriculares}

REGRAS:
1. Divida o ano em 4 bimestres equilibrados em carga horária
2. Cada bimestre deve ter de 3 a 8 conteúdos
3. Cada conteúdo deve ter: titulo, descricao (1-2 frases), tipo (teoria/pratica/revisao/avaliacao), carga_estimada (em aulas)
4. A soma das cargas_estimadas dos conteúdos de cada bimestre deve igualar a carga_horaria do bimestre
5. A soma das cargas_horarias dos 4 bimestres deve igualar a carga_horaria_anual
6. Use nomenclatura alinhada à BNCC quando aplicável
7. Temas devem ser progressivos: bimestre 2 avança sobre bimestre 1, etc.

RETORNE APENAS JSON VÁLIDO, sem explicações, seguindo exatamente esta estrutura:
{
  "ano_letivo": {ano_letivo},
  "disciplina": "{disciplina}",
  "serie": "{serie}",
  "carga_horaria_anual": {carga_horaria_anual},
  "bimestres": [
    {
      "numero": 1,
      "titulo": "string",
      "temas_principais": "string",
      "carga_horaria": int,
      "conteudos": [
        {
          "titulo": "string",
          "descricao": "string",
          "tipo": "teoria|pratica|revisao|avaliacao",
          "carga_estimada": int
        }
      ]
    }
  ]
}
```

### Histórico de Revisões
| Versão | Data | Autor | Mudanças |
|--------|------|-------|---------|
| 1.0 | 2026-05-20 | Kelso + Claude | Criação inicial |
