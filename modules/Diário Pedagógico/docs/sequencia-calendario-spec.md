# Spec: Gerador de Sequência Didática + Sincronização com Calendário

**Versão:** 1.0
**Status:** Em Revisão
**Autor:** Kelso Palheta + Claude AI
**Data:** 2026-05-20
**Reviewers:** Claude AI (automated)

---

## 1. Resumo

RF-003: Professor seleciona um conteúdo do planejamento bimestral, sistema chama Gemini API e gera sequência didática completa (objetivos, metodologia, recursos, etapas, avaliação). RF-004: Sistema conecta com Google Calendar, importa horários de aula do professor, distribui conteúdos nas datas reais respeitando feriados e recessos.

---

## 2. Contexto e Motivação

**Problema (RF-003):**
Professor tem lista de conteúdos mas precisa preparar cada aula individualmente — objetivos de aprendizagem, metodologia ativa, recursos necessários, etapas cronometradas. Isso toma 1-2h por aula.

**Problema (RF-004):**
Planejamento gerado na Fase 1 tem conteúdos distribuídos por bimestre, mas sem datas reais. Professor precisa manualmente olhar o calendário e alocar cada conteúdo em uma data específica. Com 40 semanas × 5 aulas/semana = 200 aulas, é inviável fazer manualmente.

**Evidências:**
PRD Seção 4.3 e 4.4 detalham ambos. Sem RF-004, o planejamento fica "teórico" — conteúdos sem data.

**Por que agora:**
Fase 2 do cronograma. RF-001/002 já entrega planejamento com conteúdos. RF-003 enriquece cada conteúdo. RF-004 torna o planejamento executável no mundo real.

---

## 3. Goals (Objetivos)

- [ ] G-01: Professor seleciona conteúdo e recebe sequência didática completa em < 20s
- [ ] G-02: Sequência didática inclui: título, objetivo geral, objetivos específicos (3-5), metodologia, recursos, etapas (5-8 com duração), avaliação, referências
- [ ] G-03: Sistema conecta com Google Calendar via OAuth2 e importa eventos do professor
- [ ] G-04: Sistema mapeia horários de aula a partir dos eventos importados (ex: "Português - 3º EM" toda seg/qua/sex 07:30)
- [ ] G-05: Sistema distribui automaticamente conteúdos do bimestre nas datas de aula disponíveis
- [ ] G-06: Sistema pula feriados e recessos (eventos do tipo "Feriado" ou "Recesso" no calendário)

**Métricas de sucesso:**
| Métrica | Baseline | Target |
|---------|----------|--------|
| Tempo geração sequência didática | Manual (1-2h) | < 20s |
| Taxa de parse válido Gemini | N/A | ≥ 95% |
| Precisão detecção slots de aula | N/A | 100% (aulas com disciplina correta) |
| Feriados respeitados | Erro humano | 100% |

---

## 4. Non-Goals (Fora do Escopo)

- NG-01: Integração com Outlook Calendar (Fase futura — só Google no MVP)
- NG-02: Edição manual da sequência didática gerada (v2)
- NG-03: Sincronização bidirecional (escrever de volta no Google Calendar) — só leitura no MVP
- NG-04: Geração de sequência didática em lote para todo o bimestre (só 1 conteúdo por vez)
- NG-05: Suporte a múltiplos calendários por professor (só 1 calendar ID)
- NG-06: Notificações/lembretes de aula

---

## 5. Usuários e Personas

**Usuário primário:** Professor que já gerou planejamento anual (RF-001). Agora quer detalhar cada aula e ver as datas reais no calendário.

**Jornada atual (sem a feature):**
1. Professor olha lista de conteúdos do bimestre
2. Abre documento word, escreve plano de aula para cada conteúdo
3. Abre Google Calendar, procura seus horários de aula
4. Manualmente digita cada conteúdo na data correspondente
5. Torce para não contar feriado como dia letivo

**Jornada futura (com a feature):**
1. Professor clica em "Gerar Sequência" em um conteúdo → recebe plano detalhado em < 20s
2. Professor clica em "Sincronizar Calendário" → autoriza Google OAuth
3. Sistema importa eventos, detecta slots de aula, distribui conteúdos automaticamente
4. Professor vê timeline real com datas e conteúdos alocados

---

## 6. Requisitos Funcionais

### 6.1 RF-003 — Gerador de Sequência Didática

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-03.1 | O backend deve aceitar POST /api/planning/sequence com conteudo_id e contexto (disciplina, série, bimestre) | Must | POST com body válido retorna 201 |
| RF-03.2 | O backend deve montar prompt estruturado com metadados do conteúdo e chamar Gemini | Must | Prompt inclui disciplina, série, conteúdo base, carga horária |
| RF-03.3 | O backend deve parsear resposta JSON com sequência didática completa (8 seções) | Must | JSON com titulo, objetivo_geral, objetivos_especificos[], metodologia, recursos[], etapas[], avaliacao, referencias[] |
| RF-03.4 | O backend deve persistir a sequência vinculada ao Conteudo (campo novo ou tabela separada) | Must | Sequência salva no banco, vinculada ao conteudo_id |
| RF-03.5 | O backend deve retornar a sequência completa no response 201 | Must | Response inclui todas as 8 seções |
| RF-03.6 | O backend deve retornar 502 se Gemini falhar após 2 retries | Must | Mesmo padrão de erro do RF-001 |

### 6.2 RF-004 — Sincronização com Calendário de Aulas

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-04.1 | O backend deve aceitar POST /api/calendar/sync iniciando OAuth2 flow com Google | Must | Retorna URL de autorização Google OAuth2 |
| RF-04.2 | O backend deve receber callback OAuth2, armazenar tokens, importar eventos | Must | GET /api/calendar/callback processa code, salva tokens, dispara import |
| RF-04.3 | O backend deve importar eventos do Google Calendar do professor | Must | Eventos visíveis no GET /api/calendar/events |
| RF-04.4 | O backend deve detectar automaticamente slots de aula (eventos recorrentes com nome da disciplina) | Must | Slot detectado se: resumo contém disciplina cadastrada |
| RF-04.5 | O backend deve pular eventos marcados como "Feriado" ou "Recesso" na distribuição | Must | Feriados não viram AulaPlano |
| RF-04.6 | O backend deve distribuir conteúdos do bimestre nos slots de aula disponíveis (POST /api/calendar/distribute) | Must | Cada conteúdo vira AulaPlano com data real |
| RF-04.7 | O backend deve retornar GET /api/calendar/events com todos os eventos + slots detectados | Must | Response combina eventos Google + AulaPlano do banco |

### 6.3 Fluxo Principal — RF-003

1. Professor clica "Gerar Sequência" em um Conteudo específico
2. Frontend envia `POST /api/planning/sequence` com `conteudo_id`
3. Backend busca Conteudo + PlanejamentoBimestral + PlanejamentoAnual no banco
4. Backend monta prompt Gemini com: disciplina, série, título do conteúdo, descrição, carga estimada, bimestre
5. Gemini retorna JSON com 8 seções da sequência didática
6. Backend valida com Pydantic, persiste no banco
7. Backend retorna 201 com a sequência completa

### 6.4 Fluxo Principal — RF-004 (Sincronização)

1. Professor clica "Conectar Google Calendar"
2. Frontend chama `POST /api/calendar/sync` → backend retorna URL OAuth2
3. Frontend redireciona para Google OAuth consent screen
4. Google redireciona de volta para `GET /api/calendar/callback?code=...`
5. Backend troca code por access_token + refresh_token, salva no banco
6. Backend chama Google Calendar API, importa eventos do período letivo
7. Backend detecta slots de aula: eventos recorrentes cujo summary contém a disciplina
8. Backend retorna lista de eventos + slots detectados

### 6.5 Fluxo Principal — RF-004 (Distribuição)

1. Professor clica "Distribuir Conteúdos no Calendário"
2. Frontend chama `POST /api/calendar/distribute` com `planejamento_bimestral_id`
3. Backend busca conteúdos do bimestre (ordenados por prioridade)
4. Backend busca slots de aula disponíveis (ordenados por data)
5. Backend aloca 1 conteúdo por slot, sequencialmente
6. Backend cria AulaPlano para cada par (slot, conteúdo) com data real
7. Backend retorna lista de AulaPlano criadas

---

## 7. Requisitos Não-Funcionais

| ID | Requisito | Valor alvo |
|----|-----------|------------|
| RNF-01 | Tempo geração sequência didática p95 | < 20s |
| RNF-02 | Tempo importação calendário (até 200 eventos) | < 5s |
| RNF-03 | Tempo distribuição conteúdos (até 50 conteúdos) | < 2s |
| RNF-04 | Segurança OAuth2 | Google Identity verified, state param anti-CSRF |
| RNF-05 | Token storage | refresh_token criptografado em repouso |

---

## 8. Design e Interface

**Endpoints:**

### POST /api/planning/sequence

```
Request:  { "conteudo_id": "uuid" }
Response: 201 {
  id, conteudo_id, titulo, objetivo_geral,
  objetivos_especificos: ["...", "..."],
  metodologia, recursos: ["...", "..."],
  etapas: [{numero, descricao, duracao_minutos, estrategia}],
  avaliacao, referencias: ["...", "..."],
  created_at
}
```

### POST /api/calendar/sync

```
Request:  { "professor_id": "prof-123" }
Response: 200 { "auth_url": "https://accounts.google.com/o/oauth2/auth?..." }
```

### GET /api/calendar/callback

```
Params: code, state
Response: 302 redirect para /calendario com query ?sync=ok
```

### GET /api/calendar/events

```
Query: professor_id, data_inicio, data_fim
Response: 200 {
  eventos_google: [...],
  slots_aula: [{data, horario_inicio, duracao, disciplina}],
  aulas_planejadas: [{id, data, conteudo_id, titulo}]
}
```

### POST /api/calendar/distribute

```
Request:  { "planejamento_bimestral_id": "uuid", "professor_id": "prof-123" }
Response: 201 { aulas_criadas: [{id, data, conteudo_id, titulo}], total: N }
```

---

## 9. Modelo de Dados

### Novas entidades / Alterações

**SequenciaDidatica (nova tabela):**
```python
class SequenciaDidatica(Base):
    __tablename__ = "sequencias_didaticas"
    id: UUID PK
    conteudo_id: FK → conteudos.id
    titulo: str
    objetivo_geral: str
    objetivos_especificos: JSON (list[str])
    metodologia: str
    recursos: JSON (list[str])
    etapas: JSON (list[dict])
    avaliacao: str
    referencias: JSON (list[str])
    created_at: datetime
```

**CalendarioEscolar (alterar existente):**
- `fonte_calendario`: já existe ("manual" | "google" | "outlook")
- Adicionar: `google_tokens_json` (access_token, refresh_token, expiry — criptografado)
- Adicionar: `google_calendar_id` (ID do calendário no Google)

**AulaPlano (alterar existente):**
- `data`: já existe (DateTime)
- `conteudo_id`: já existe (FK)
- `google_event_id`: já existe — usado para link reverso com Google

---

## 10. Integrações e Dependências

| Dependência | Tipo | Impacto se indisponível |
|-------------|------|------------------------|
| Gemini API | Obrigatória (RF-003) | Erro 502, sem geração de sequência |
| Google Calendar API | Obrigatória (RF-004) | Erro 502, sem sincronização |
| Google OAuth2 credentials | Obrigatória (RF-004) | POST /api/calendar/sync retorna 500 |
| PostgreSQL | Obrigatória | Erro 500 |

---

## 11. Edge Cases e Tratamento de Erros

| Cenário | Trigger | Comportamento esperado |
|---------|---------|----------------------|
| EC-01: Conteúdo não encontrado | conteudo_id inexistente | 404 "Conteúdo não encontrado" |
| EC-02: Gemini retorna JSON sem etapas | Campo `etapas` vazio ou ausente | Retry 1x; se falhar, 502 |
| EC-03: Google OAuth negado pelo usuário | User clica "Cancel" no consent screen | Google redireciona com ?error=access_denied → 200 com msg amigável |
| EC-04: Token Google expirado | access_token expirou | Usar refresh_token automaticamente |
| EC-05: Sem eventos de aula detectados | Google Calendar sem eventos com nome da disciplina | 200 com `slots_aula: []` e warning "Nenhum slot de aula detectado" |
| EC-06: Mais conteúdos que slots | Bimestre tem 30 conteúdos mas só 25 slots | Alocar os primeiros 25; warning com lista de não-alocados |
| EC-07: Menos conteúdos que slots | Bimestre tem 20 conteúdos e 30 slots | Alocar 20; slots extras ficam como AulaPlano sem conteúdo (aula livre) |
| EC-08: Conteúdo já alocado em data | Mesmo conteúdo distribuído 2x | Cada POST /distribute é idempotente — limpa alocações anteriores do bimestre e recria |
| EC-09: Rate limit Google Calendar API | 1000 req/100s por user | Backoff exponencial; erro 429 se exceder |

---

## 12. Segurança e Privacidade

- **Autenticação:** Google OAuth2 com state param (anti-CSRF). MVP1: professor_id no body. MVP2: JWT.
- **Autorização:** Tokens Google isolados por professor_id.
- **Dados sensíveis:** access_token e refresh_token do Google armazenados com criptografia AES-256 em repouso.
- **Auditoria:** Log de cada sincronização: timestamp, professor_id, eventos_importados, slots_detectados.

---

## 13. Plano de Rollout

- **Estratégia:** Feature flag `ENABLE_GOOGLE_CALENDAR` para RF-004. RF-003 não precisa de flag.
- **Rollback:** Desabilitar flag → endpoints de calendário retornam 503.
- **Monitoramento:** Logar taxa de sucesso OAuth, latência Gemini, eventos importados por sync.

---

## 14. Open Questions

| # | Pergunta | Impacto | Dono | Prazo |
|---|---------|---------|------|-------|
| OQ-01 | Suportar múltiplas turmas com mesma disciplina? Ex: "Português - 3ºA" vs "Português - 3ºB" | Médio | Kelso | 2026-05-21 |
| OQ-02 | Distribuição automática deve considerar tipo de conteúdo? (teoria antes de prática) | Baixo | Kelso | 2026-05-21 |

---

## 15. Decisões Tomadas

| Decisão | Alternativas | Racional |
|---------|-------------|---------|
| Sequência em tabela separada (SequenciaDidatica) | JSON field no Conteudo | Tabela própria permite queries, versionamento futuro, múltiplas versões |
| Distribuição sequencial simples (1 conteúdo por slot em ordem) | Algoritmo com restrições (tipo, prioridade, carga) | MVP: simples cobre 90% dos casos. v2: restrições |
| Google Calendar read-only no MVP | Read-write bidirecional | Menos complexidade, menos risco de bagunçar calendário do professor |
| Token Google criptografado em repouso | Plaintext no banco | Segurança básica; AES-256 com chave da env var |

---

## Apêndice

### Prompt Gemini — Sequência Didática

```
Você é um especialista em didática e metodologia de ensino brasileiro. Gere uma sequência didática completa para uma aula no formato JSON.

DISCIPLINA: {disciplina}
SÉRIE/NÍVEL: {serie}
BIMESTRE: {bimestre}
CONTEÚDO: {conteudo_titulo}
DESCRIÇÃO DO CONTEÚDO: {conteudo_descricao}
CARGA HORÁRIA ESTIMADA: {carga_estimada} aulas

REGRAS:
1. Objetivo geral: 1 frase clara com verbo no infinitivo
2. Objetivos específicos: 3 a 5, mensuráveis
3. Metodologia: 1 parágrafo descrevendo abordagem (ex: "Aula expositiva dialogada com atividade em grupo")
4. Recursos: lista de 3 a 8 itens necessários (projetor, cartolina, etc.)
5. Etapas: 5 a 8 etapas cronológicas, cada uma com descricao, duracao_minutos e estrategia
6. Avaliação: 1 parágrafo descrevendo como verificar aprendizagem
7. Referências: 3 a 5 referências (livros, sites, artigos)
8. A soma das durações das etapas deve totalizar entre 40-50 min (1 aula típica)

RETORNE APENAS JSON VÁLIDO:
{
  "titulo": "string",
  "objetivo_geral": "string",
  "objetivos_especificos": ["string"],
  "metodologia": "string",
  "recursos": ["string"],
  "etapas": [
    {
      "numero": 1,
      "descricao": "string",
      "duracao_minutos": int,
      "estrategia": "string"
    }
  ],
  "avaliacao": "string",
  "referencias": ["string"]
}
```

### Histórico de Revisões
| Versão | Data | Autor | Mudanças |
|--------|------|-------|---------|
| 1.0 | 2026-05-20 | Kelso + Claude | Criação inicial |
