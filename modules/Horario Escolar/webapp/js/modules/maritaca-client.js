/**
 * Maritaca AI Client
 *
 * Cliente que chama a API da Maritaca AI.
 * - Em DESENVOLVIMENTO (localhost): chama API direto (chave embutida)
 * - Em PRODUÇÃO (Vercel): chama via endpoint /api/maritaca-assistant (chave segura)
 *
 * Auto-detecta o ambiente e escolhe o método correto.
 */

class MaritacaClient {
  constructor(config = {}) {
    // SEMPRE usa backend (Maritaca não permite CORS direto do browser)
    // Local: dev-server.py serve o proxy. Produção: Vercel /api/maritaca-assistant.
    this.mode = 'backend';
    this.apiKey = config.apiKey || window.MARITACA_API_KEY || '';
    this.backendUrl = config.backendUrl || '/api/maritaca-assistant';
    this.model = config.model || 'sabia-3'; // sabia-3 (melhor) | sabiazinho-3 (barato)
    this.debug = config.debug || false;

    if (this.debug) {
      console.log('[Maritaca] Backend URL:', this.backendUrl, '| Model:', this.model);
    }
  }

  /**
   * Chat conversacional simples
   */
  async chat(userMessage, schoolData = {}) {
    return this._request({
      action: 'chat',
      userMessage,
      schoolData
    });
  }

  /**
   * Analisar PDF: extrai estrutura + aloca salas temáticas
   */
  async parsePDF(pdfText, schoolData = {}) {
    return this._request({
      action: 'parse_pdf',
      pdfText,
      schoolData
    });
  }

  /**
   * Aplicar mudança em linguagem natural
   * ex: "Mover matemática para primeira aula"
   */
  async applyChange(userMessage, schoolData) {
    return this._request({
      action: 'apply_change',
      userMessage,
      schoolData
    });
  }

  /**
   * Resolver conflitos automaticamente
   */
  async resolveConflicts(schoolData) {
    return this._request({
      action: 'resolve_conflicts',
      schoolData
    });
  }

  // ====== INTERNAL ======

  async _request(payload) {
    if (this.mode === 'direct') {
      return this._requestDirect(payload);
    } else {
      return this._requestBackend(payload);
    }
  }

  /**
   * Local development: chama Maritaca API direto do browser
   * ⚠️ Chave fica exposta no browser - só usar em dev local!
   */
  async _requestDirect(payload) {
    if (!this.apiKey) {
      throw new Error('Chave Maritaca não configurada. Em dev local, defina window.MARITACA_API_KEY');
    }

    const messages = this._buildMessages(payload);

    const response = await fetch('https://chat.maritaca.ai/api/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Maritaca API ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || '';

    return {
      ok: true,
      message,
      data: this._tryExtractJSON(message),
      usage: data.usage || {},
      model: data.model || this.model
    };
  }

  /**
   * Production: chama backend Vercel (chave segura no servidor)
   */
  async _requestBackend(payload) {
    const response = await fetch(this.backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, model: this.model })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend error ${response.status}: ${errText}`);
    }

    return response.json();
  }

  /**
   * Build messages array based on action
   */
  _buildMessages(payload) {
    const systemPrompt = this._getSystemPrompt();
    const userPrompt = this._getUserPrompt(payload);

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
  }

  _getSystemPrompt() {
    return `Você é um(a) coordenador(a) pedagógico(a) especialista em horários escolares de Ensino Médio Integral com salas temáticas por área de conhecimento (BNCC).

CONTEXTO DA ESCOLA:
- Modelo: Tempo Integral com salas-ambiente temáticas
- Alunos se deslocam entre salas a cada aula
- Cada professor leciona em salas da SUA área (Linguagens, Matemática, Natureza, Humanas)

ÁREAS (BNCC):
- Linguagens: Português, Inglês, Arte, Ed. Física, Literatura
- Matemática: Matemática
- Natureza: Biologia, Química, Física
- Humanas: História, Geografia, Filosofia, Sociologia
- Itinerários: Eletivas, Aprofundamentos, PPA, Clubes

REGRAS CRÍTICAS:
1. Um professor NÃO pode estar em duas turmas no mesmo horário
2. Uma turma NÃO pode ter duas aulas no mesmo horário
3. Disciplinas pesadas (Mat, Port) preferencialmente nas primeiras aulas
4. Cada professor leciona em sua sala temática

QUANDO RESPONDER:
- Seja conciso e prático
- Se retornar dados estruturados, use JSON válido em bloco \`\`\`json
- Sempre justifique decisões pedagógicas
- Use português do Brasil`;
  }

  _getUserPrompt(payload) {
    const { action, userMessage, schoolData, pdfText } = payload;

    if (action === 'parse_pdf') return this._buildParsePDFPrompt(pdfText, schoolData);
    if (action === 'apply_change') return this._buildApplyChangePrompt(userMessage, schoolData);
    if (action === 'resolve_conflicts') return this._buildResolveConflictsPrompt(schoolData);
    return this._buildChatPrompt(userMessage, schoolData);
  }

  _buildParsePDFPrompt(pdfText, schoolData) {
    const profList = (schoolData?.profs || []).join(', ');
    const salaList = (schoolData?.salas || []).join(', ');

    const profSalaMap = {};
    for (const slot of (schoolData?.slots || [])) {
      if (slot.prof && slot.sala && !profSalaMap[slot.prof]) {
        profSalaMap[slot.prof] = slot.sala;
      }
    }
    const profSalaList = Object.entries(profSalaMap)
      .map(([p, s]) => `${p}=${s}`)
      .join(', ');

    return `Analise o texto extraído do PDF abaixo e retorne JSON com TODOS os slots de aula identificados.

TEXTO DO PDF (truncado):
"""
${(pdfText || '').substring(0, 8000)}
"""

PROFESSORES CADASTRADOS: ${profList}
SALAS DISPONÍVEIS: ${salaList}
MAPEAMENTO ATUAL PROFESSOR→SALA: ${profSalaList}

INSTRUÇÕES:
1. Identifique cada aula (turma, dia, número da aula, professor, disciplina)
2. Para cada professor identificado, ALOQUE a sala temática dele do mapeamento acima
3. Se um professor do PDF NÃO está cadastrado, use o nome dele e deixe sala como ""
4. Use APENAS dados que aparecem no PDF (não invente)

RETORNE JSON em bloco \`\`\`json:
{
  "slots": [
    {"dia": "Segunda", "aula": 1, "turma": "1º ANO - 101", "prof": "NOME", "disc": "Disciplina", "sala": "Sala X"}
  ],
  "professores_nao_cadastrados": ["nome1", "nome2"],
  "observacoes": "Observações"
}`;
  }

  _buildApplyChangePrompt(userMessage, schoolData) {
    return `O usuário quer fazer a seguinte mudança no horário:

PEDIDO: "${userMessage}"

ESTADO ATUAL:
- Total slots: ${schoolData?.slots?.length || 0}
- Turmas: ${(schoolData?.turmas || []).join(', ')}
- Professores: ${(schoolData?.profs || []).join(', ')}
- Slots (primeiros 30):
${JSON.stringify((schoolData?.slots || []).slice(0, 30), null, 2)}

INSTRUÇÕES:
1. Entenda o pedido
2. Identifique quais slots modificar
3. Aplique respeitando todas as regras
4. Retorne APENAS slots alterados/removidos

RETORNE JSON em bloco \`\`\`json:
{
  "slots_alterados": [...],
  "slots_removidos": [{"dia": "...", "aula": N, "turma": "..."}],
  "explicacao": "O que foi feito",
  "alertas": ["Aviso 1"]
}`;
  }

  _buildResolveConflictsPrompt(schoolData) {
    return `Analise o horário e identifique/resolva conflitos.

DADOS:
${JSON.stringify(schoolData, null, 2).substring(0, 6000)}

RETORNE JSON em bloco \`\`\`json:
{
  "conflitos_encontrados": [{"tipo": "...", "descricao": "..."}],
  "resolucoes_sugeridas": [{"acao": "...", "slots": [...], "justificativa": "..."}]
}`;
  }

  _buildChatPrompt(userMessage, schoolData) {
    return `Usuário pergunta: "${userMessage}"

CONTEXTO DA ESCOLA:
- Nome: ${schoolData?.meta?.nome_escola || 'Escola'}
- Total slots: ${schoolData?.slots?.length || 0}
- Turmas: ${(schoolData?.turmas || []).join(', ')}
- Professores: ${(schoolData?.profs || []).join(', ')}

Responda de forma conversacional, prática e curta. Se relevante, consulte os dados.`;
  }

  _tryExtractJSON(text) {
    if (!text) return null;

    // Try code block first
    const codeBlock = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (codeBlock) {
      try { return JSON.parse(codeBlock[1]); } catch (e) { /* ignore */ }
    }

    // Try raw JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch (e) { /* ignore */ }
    }

    return null;
  }
}

// Export to window for browser usage
if (typeof window !== 'undefined') {
  window.MaritacaClient = MaritacaClient;
}
