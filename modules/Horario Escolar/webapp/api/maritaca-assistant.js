/**
 * Endpoint Vercel: /api/maritaca-assistant
 *
 * Recebe pedidos do site (texto do usuário + estado atual do horário)
 * e usa a Maritaca AI (modelo Sabiá) para:
 *  - Interpretar PDF de horário com contexto
 *  - Aplicar mudanças em linguagem natural
 *  - Resolver conflitos
 *  - Sugerir ajustes pedagógicos
 *
 * Maritaca API docs: https://docs.maritaca.ai
 */

const MARITACA_API_URL = 'https://chat.maritaca.ai/api/chat/completions';

// System prompt that gives the AI the role of a school schedule specialist
const SYSTEM_PROMPT = `Você é um(a) coordenador(a) pedagógico(a) especialista em horários escolares de Ensino Médio Integral com salas temáticas por área de conhecimento (BNCC).

CONTEXTO DA ESCOLA:
- Modelo: Tempo Integral com salas-ambiente temáticas
- Alunos se deslocam entre salas a cada aula
- Cada professor leciona em salas da SUA área (Linguagens, Matemática, Natureza, Humanas)
- Há laboratórios e salas especiais (Lab Multi, Sala Arte, Quadra, etc.)

ÁREAS DE CONHECIMENTO (BNCC):
- Linguagens: Português, Inglês, Arte, Educação Física, Literatura
- Matemática: Matemática, Raciocínio Lógico
- Natureza: Biologia, Química, Física
- Humanas: História, Geografia, Filosofia, Sociologia
- Itinerários: Eletivas, Aprofundamentos, PPA, Clubes

REGRAS IMPORTANTES:
1. Um professor NÃO pode estar em duas turmas no mesmo horário
2. Uma turma NÃO pode ter duas aulas no mesmo horário
3. Disciplinas pesadas (Mat, Port, Ciências) preferencialmente nas primeiras aulas
4. Aulas de mesma disciplina devem ser distribuídas ao longo da semana (não concentradas em um dia)
5. Cada professor tem dia/turno de planejamento (fora da escola)
6. Salas temáticas: prof de Matemática usa Sala M1, M2, M3; de Linguagens usa Sala L1, L2, L3; etc.

QUANDO RESPONDER:
- Seja conciso e prático (poucas frases)
- Use linguagem clara (público: coordenadores pedagógicos)
- Se for retornar dados estruturados (slots), use JSON válido
- Sempre justifique decisões pedagógicas
- Se algo não for possível, explique o porquê e sugira alternativa

FORMATO DE SLOT (JSON):
{
  "dia": "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta",
  "aula": 1-9 (número da aula),
  "turma": "1º ANO - 101" (formato),
  "prof": "NOME PROFESSOR" (uppercase),
  "disc": "Disciplina",
  "sala": "Sala X" (do cadastro da escola)
}`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const apiKey = process.env.MARITACA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'MARITACA_API_KEY não configurada no servidor'
    });
  }

  try {
    const {
      action,           // 'chat' | 'parse_pdf' | 'apply_change' | 'resolve_conflicts'
      userMessage,      // texto do usuário
      schoolData,       // dados atuais da escola (slots, profs, salas)
      pdfText,          // texto extraído do PDF (para action=parse_pdf)
      model = 'sabia-3' // 'sabia-3' (melhor) ou 'sabiazinho-3' (mais barato)
    } = req.body;

    // Build context-specific messages based on action
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

    if (action === 'parse_pdf' && pdfText) {
      messages.push({
        role: 'user',
        content: buildParsePDFPrompt(pdfText, schoolData)
      });
    } else if (action === 'apply_change') {
      messages.push({
        role: 'user',
        content: buildApplyChangePrompt(userMessage, schoolData)
      });
    } else if (action === 'resolve_conflicts') {
      messages.push({
        role: 'user',
        content: buildResolveConflictsPrompt(schoolData)
      });
    } else {
      // Default: chat conversational
      messages.push({
        role: 'user',
        content: buildChatPrompt(userMessage, schoolData)
      });
    }

    // Call Maritaca API
    const response = await fetch(MARITACA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,    // Baixo = mais consistente para tarefas técnicas
        max_tokens: 4000,
        do_sample: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Maritaca API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || '';

    // Try to extract JSON if response contains structured data
    const extractedJSON = tryExtractJSON(aiMessage);

    return res.status(200).json({
      ok: true,
      message: aiMessage,
      data: extractedJSON,
      usage: data.usage || {},
      model: data.model || model
    });

  } catch (error) {
    console.error('[Maritaca Assistant] Error:', error);
    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// ====== PROMPT BUILDERS ======

function buildParsePDFPrompt(pdfText, schoolData) {
  const profList = (schoolData?.profs || []).join(', ');
  const salaList = (schoolData?.salas || []).join(', ');

  // Build a quick prof → sala map from existing slots for context
  const profSalaMap = {};
  for (const slot of (schoolData?.slots || [])) {
    if (slot.prof && slot.sala && !profSalaMap[slot.prof]) {
      profSalaMap[slot.prof] = slot.sala;
    }
  }
  const profSalaList = Object.entries(profSalaMap)
    .map(([p, s]) => `${p}=${s}`)
    .join(', ');

  return `Analise o texto extraído do PDF abaixo e retorne um JSON com TODOS os slots de aula identificados.

TEXTO DO PDF:
"""
${pdfText.substring(0, 8000)}
"""

PROFESSORES CADASTRADOS NA ESCOLA: ${profList}
SALAS DISPONÍVEIS: ${salaList}
MAPEAMENTO ATUAL PROFESSOR→SALA: ${profSalaList}

INSTRUÇÕES:
1. Identifique cada aula no PDF (turma, dia, número da aula, professor, disciplina)
2. Para cada professor identificado, ALOQUE a sala temática dele baseado no mapeamento acima
3. Se um professor do PDF NÃO está cadastrado, use o nome dele mesmo e deixe sala vazia
4. Use o formato JSON especificado
5. Use APENAS professores e salas que existem no cadastro (exceto para profs novos)

RETORNE APENAS JSON VÁLIDO no formato:
{
  "slots": [
    {"dia": "...", "aula": N, "turma": "...", "prof": "...", "disc": "...", "sala": "..."}
  ],
  "professores_nao_cadastrados": ["nome1", "nome2"],
  "observacoes": "Observações importantes sobre a análise"
}`;
}

function buildApplyChangePrompt(userMessage, schoolData) {
  return `O usuário quer fazer a seguinte mudança no horário atual:

PEDIDO: "${userMessage}"

HORÁRIO ATUAL (resumo):
- Total de slots: ${schoolData?.slots?.length || 0}
- Turmas: ${(schoolData?.turmas || []).join(', ')}
- Professores: ${(schoolData?.profs || []).join(', ')}

SLOTS (primeiros 20):
${JSON.stringify((schoolData?.slots || []).slice(0, 20), null, 2)}

INSTRUÇÕES:
1. Entenda o pedido do usuário
2. Identifique quais slots precisam ser modificados
3. Aplique a mudança respeitando todas as regras (sem conflitos)
4. Retorne JSON com os slots ALTERADOS apenas (não retorne todos)

FORMATO:
{
  "slots_alterados": [
    {"dia": "...", "aula": N, "turma": "...", "prof": "...", "disc": "...", "sala": "..."}
  ],
  "slots_removidos": [
    {"dia": "...", "aula": N, "turma": "..."}
  ],
  "explicacao": "Explicação do que foi feito",
  "alertas": ["Aviso 1", "Aviso 2"]
}`;
}

function buildResolveConflictsPrompt(schoolData) {
  return `Analise o horário atual e identifique/resolva conflitos.

DADOS:
${JSON.stringify(schoolData, null, 2).substring(0, 6000)}

INSTRUÇÕES:
1. Identifique TODOS os conflitos (prof em 2 lugares, sala ocupada, etc.)
2. Sugira resolução para cada conflito
3. Priorize manter o máximo de aulas no horário original

RETORNE JSON:
{
  "conflitos_encontrados": [
    {"tipo": "...", "descricao": "...", "slots_envolvidos": [...]}
  ],
  "resolucoes_sugeridas": [
    {"acao": "trocar|remover|realocar", "slots": [...], "justificativa": "..."}
  ]
}`;
}

function buildChatPrompt(userMessage, schoolData) {
  return `O usuário está usando o sistema de horário escolar e perguntou:

"${userMessage}"

CONTEXTO DA ESCOLA:
- Nome: ${schoolData?.meta?.nome_escola || 'Escola'}
- Total de slots: ${schoolData?.slots?.length || 0}
- Turmas: ${(schoolData?.turmas || []).join(', ')}
- Professores: ${(schoolData?.profs || []).join(', ')}
- Salas: ${(schoolData?.salas || []).join(', ')}

Responda de forma conversacional, prática e útil. Se for relevante consultar dados específicos, faça-o.`;
}

function tryExtractJSON(text) {
  if (!text) return null;

  // Try to find JSON in code blocks first
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) { /* ignore */ }
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) { /* ignore */ }
  }

  return null;
}
