import { NextResponse } from 'next/server';
import { getAllCorrections } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório.' }, { status: 400 });
    }

    const corrections = await getAllCorrections(userId);
    return NextResponse.json(corrections);
  } catch (error) {
    console.error('Erro ao buscar correções do usuário:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
