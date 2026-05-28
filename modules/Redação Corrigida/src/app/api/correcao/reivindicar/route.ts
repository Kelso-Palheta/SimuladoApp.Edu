import { NextResponse } from 'next/server';
import { claimCorrection } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const { correctionId, userId } = await request.json();

    if (!correctionId || !userId) {
      return NextResponse.json(
        { error: 'ID da correção e ID do usuário são obrigatórios.' },
        { status: 400 }
      );
    }

    const result = await claimCorrection(correctionId, userId);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('API Reivindicar Error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a reivindicação.' },
      { status: 500 }
    );
  }
}
