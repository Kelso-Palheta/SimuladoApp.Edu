import { NextResponse } from 'next/server';
import { generateCorrection } from '@/lib/ai-provider';
import { saveCorrection } from '@/lib/storage';



export const maxDuration = 60; // Limite máximo da Vercel Hobby para IAs

export async function POST(request: Request) {
  try {
    const { 
      text, 
      imageBase64, 
      studentName, 
      studentClass, 
      essayTheme, 
      depth, 
      competencies,
      userId
    } = await request.json();

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: 'Você precisa enviar um texto ou uma imagem da redação.' },
        { status: 400 }
      );
    }

    const result = await generateCorrection({ 
      text, 
      imageBase64,
      studentName,
      studentClass,
      essayTheme,
      depth,
      competencies
    });

    // Extrair score para salvar junto
    const extractScore = (fullText: string) => {
      try {
        const jsonMatch = fullText.match(/```json[\s\S]*?(\{[\s\S]*?\})[\s\S]*?```/) || fullText.match(/(\{[\s]*?"c1"[\s\S]*?\})/);
        if (jsonMatch && jsonMatch[1]) {
          const obj = JSON.parse(jsonMatch[1].trim());
          const c1 = Number(obj.c1) || 0;
          const c2 = Number(obj.c2) || 0;
          const c3 = Number(obj.c3) || 0;
          const c4 = Number(obj.c4) || 0;
          const c5 = Number(obj.c5) || 0;
          const total = Number(obj.total) || (c1 + c2 + c3 + c4 + c5);
          return {
            total,
            items: [
              { subject: 'C1', A: c1, fullMark: 200 },
              { subject: 'C2', A: c2, fullMark: 200 },
              { subject: 'C3', A: c3, fullMark: 200 },
              { subject: 'C4', A: c4, fullMark: 200 },
              { subject: 'C5', A: c5, fullMark: 200 },
            ]
          };
        }
      } catch (e) {}
      return null;
    };

    const scores = result ? extractScore(result) : null;

    const id = await saveCorrection({
      userId,
      studentName: studentName || 'Estudante',
      studentClass: studentClass || 'N/A',
      essayTheme: essayTheme || 'Geral',
      result: result || '',
      scoreData: scores?.items || [],
      totalScore: scores?.total || 0,
    });

    return NextResponse.json({ result, id });
  } catch (error: any) {
    console.error('❌ ERRO CRÍTICO NA API DE CORREÇÃO:', error);
    return NextResponse.json(
      { error: `Não foi possível realizar a correção no momento. Detalhe: ${error.message || 'Erro Desconhecido'}` },
      { status: 500 }
    );
  }
}
