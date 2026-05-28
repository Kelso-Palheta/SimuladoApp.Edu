import { NextResponse } from 'next/server';
import { getCorrectionById } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const correction = await getCorrectionById(params.id);
    
    if (!correction) {
      return NextResponse.json({ error: 'Correção não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(correction);
  } catch (error) {
    console.error('Erro ao buscar correção:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
