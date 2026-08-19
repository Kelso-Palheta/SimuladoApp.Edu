import { NextResponse } from 'next/server';
import OpenAI from "openai";

const SYSTEM_PROMPT = `Você é um especialista em planejamento pedagógico e currículo escolar brasileiro (BNCC).
O usuário enviará um plano de curso ou ementa (frequentemente contendo capítulos e vários subtópicos).
Sua missão é estruturar esse texto em uma lista cronológica de tópicos GRANULARES de aula.

MUITO IMPORTANTE: NÃO agrupe todo o conteúdo de um capítulo em um único tópico genérico.
Você DEVE quebrar os capítulos em subtópicos menores e específicos (ex: cada "bullet point" ou subtema deve virar um item independente na lista). O professor precisa de itens granulares para distribuir nas aulas semanais.

Retorne EXCLUSIVAMENTE um objeto JSON com a propriedade "topicos", que é um array de objetos.
Cada objeto do array DEVE ter:
- "ordem": número inteiro (1, 2, 3...) refletindo a sequência de ensino.
- "titulo": string (máximo 80 caracteres) resumindo especificamente esse subtema/tópico.
- "descricao": string detalhando o conteúdo do subtema (você pode incluir o nome do Capítulo maior aqui para dar contexto).
- "duracaoEstimadaAulas": número inteiro (normalmente 1). Como você foi bem granular, a maioria dos subtópicos levará 1 aula, no máximo 2.

Não retorne markdown, crases ou qualquer texto adicional, apenas o JSON válido puro.`;

export async function POST(request) {
  try {
    const { text, disciplina, anoLetivo } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Você precisa enviar o texto do planejamento para importar.' },
        { status: 400 }
      );
    }

    const prompt = `Contexto: Disciplina ${disciplina || 'Geral'} - Ano ${anoLetivo || 'Não informado'}\n\nTexto do Planejamento:\n${text}`;

    let responseContent = "";

    try {
      // 1. Tentar Gemini primeiro (se existir a chave)
      if (process.env.GEMINI_API_KEY) {
        console.log("[Importar Planejamento] Tentando Gemini API Nativa");
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const geminiBody = {
          system_instruction: { parts: { text: SYSTEM_PROMPT } },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: "application/json"
          }
        };

        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody)
        });

        const data = await res.json();
        
        if (res.ok && data.candidates && data.candidates[0]) {
          responseContent = data.candidates[0].content.parts[0].text;
        } else {
          throw new Error(data.error?.message || "Erro desconhecido no Gemini");
        }
      } else {
        throw new Error("Chave Gemini não configurada");
      }
    } catch (geminiError) {
      console.warn("[Importar Planejamento] Gemini falhou ou indisponível:", geminiError.message);
      
      // 2. Fallback para Maritaca AI (Sabiá-3)
      if (process.env.MARITACA_API_KEY) {
        console.log("[Importar Planejamento] Usando Fallback: Maritaca AI (Sabiá-3)");
        const maritacaUrl = "https://chat.maritaca.ai/api/chat/completions";
        
        const maritacaRes = await fetch(maritacaUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${process.env.MARITACA_API_KEY}`
          },
          body: JSON.stringify({
            model: "sabiazinho-4",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: prompt }
            ],
            temperature: 0.2
          })
        });

        const maritacaData = await maritacaRes.json();
        
        if (!maritacaRes.ok) {
          throw new Error(`Erro no Maritaca: ${maritacaData.error?.message || maritacaRes.statusText}`);
        }
        
        responseContent = maritacaData.choices[0].message.content;
      } 
      // 3. Fallback para OpenAI
      else if (process.env.OPENAI_API_KEY) {
        console.log("[Importar Planejamento] Usando Fallback: OpenAI");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });
        responseContent = completion.choices[0].message.content;
      } 
      else {
        throw new Error(`Falha no Gemini (${geminiError.message}) e não há outras chaves configuradas.`);
      }
    }

    // Limpeza de crases caso o modelo (especialmente Sabiá-3) ignore a instrução de não usar markdown
    const jsonString = responseContent.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsedData = JSON.parse(jsonString);

    if (!parsedData.topicos || !Array.isArray(parsedData.topicos)) {
      throw new Error("A IA não retornou o formato JSON esperado.");
    }

    return NextResponse.json({ topicos: parsedData.topicos });

  } catch (error) {
    console.error('ERRO NA IMPORTAÇÃO DE PLANEJAMENTO:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Não foi possível estruturar o planejamento com a IA.' },
      { status: 500 }
    );
  }
}
