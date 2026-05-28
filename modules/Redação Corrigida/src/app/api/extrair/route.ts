import { NextResponse } from 'next/server';
import { extractTextOnly } from '@/lib/ai-provider';



export async function POST(request: Request) {
  try {
    const { imageBase64, mediaType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Você precisa enviar uma imagem para extração.' },
        { status: 400 }
      );
    }

    const text = await extractTextOnly(imageBase64, mediaType);

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('❌ ERRO NA EXTRAÇÃO DE TEXTO:', error);
    return NextResponse.json(
      { error: 'Não foi possível extrair o texto desta imagem.' },
      { status: 500 }
    );
  }
}
