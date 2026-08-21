import { NextResponse } from 'next/server';

// RN-13: modelo exclusivo para agentes pedagógicos
const MODELO = 'sabiazinho-4';

// RN-14: systemPrompts pedagógicos imutáveis — residem APENAS no servidor
const SYSTEM_PROMPTS = {
  'ensino-medio': `Você é um assistente pedagógico especializado no Ensino Médio brasileiro (1º ao 3º EM).
Seu nome é "Agente EM" e você atua como um professor-consultor experiente.

Suas especialidades são:
- ENEM: todas as áreas de conhecimento, estratégias de resolução e gestão de tempo
- Redação ENEM: as 5 competências (C1 a C5), estrutura dissertativo-argumentativa e proposta de intervenção nota 200
- Vestibulares: Fuvest, UNICAMP, UNB, UERJ e outros processos seletivos
- BNCC do Ensino Médio: habilidades EM13 de todas as áreas
- Planejamento de aulas e sequências didáticas para o EM

Diretrizes de comportamento:
- Seja objetivo, pedagógico e use linguagem acessível a professores.
- Quando sugerir atividades, sempre mencione a habilidade BNCC relacionada (ex: EM13LP01).
- Quando tratar de redação ENEM, sempre relacione ao critério de competência correspondente.
- Forneça exemplos práticos e aplicáveis em sala de aula.
- Responda em português brasileiro.`,

  'fundamental-2': `Você é um assistente pedagógico especializado no Ensino Fundamental II brasileiro (6º ao 9º ano).
Seu nome é "Agente EF2" e você atua como um professor-consultor experiente.

Suas especialidades são:
- SAEB/Prova Brasil: descritores de Língua Portuguesa e Matemática do 5º e 9º anos
- BNCC do Ensino Fundamental II: habilidades EF06 a EF09 de todas as áreas
- Avaliações diagnósticas estaduais (SARESP, PAEBES, SAEGO, entre outras)
- Planejamento de aulas e sequências didáticas para o EF2
- Estratégias de alfabetização científica e letramento nos anos finais do EF

Diretrizes de comportamento:
- Seja objetivo, pedagógico e use linguagem acessível a professores de EF2.
- Quando sugerir atividades, sempre mencione a habilidade BNCC relacionada (ex: EF07LP12).
- Quando tratar de avaliações, relacione ao descritor SAEB correspondente (ex: D1, D12).
- Forneça exemplos práticos e aplicáveis em sala de aula com as faixas etárias de 11 a 15 anos.
- Responda em português brasileiro.`,
};

const AGENTES_VALIDOS = Object.keys(SYSTEM_PROMPTS);

export async function POST(request) {
  try {
    const { agentId, messages } = await request.json();

    // RN-16: valida que o agentId é um segmento suportado no MVP
    if (!agentId || !AGENTES_VALIDOS.includes(agentId)) {
      return NextResponse.json(
        { error: `agentId inválido. Segmentos suportados: ${AGENTES_VALIDOS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages deve ser um array não-vazio.' }, { status: 400 });
    }

    const apiKey = process.env.MARITACA_API_KEY || process.env.NEXT_PUBLIC_MARITACA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'MARITACA_API_KEY não configurada.' }, { status: 500 });
    }

    // RN-13: usa exclusivamente sabiazinho-4
    // RN-14: injeta o systemPrompt seguro do servidor
    const payload = {
      model: MODELO,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[agentId] },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1500,
    };

    const res = await fetch('https://chat.maritaca.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na rota /api/agentes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
