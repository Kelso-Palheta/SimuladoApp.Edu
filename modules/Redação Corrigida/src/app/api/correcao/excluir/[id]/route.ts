import { NextResponse } from 'next/server';
import { deleteCorrection } from '@/lib/storage';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'ID da correção e ID do usuário são obrigatórios.' },
        { status: 400 }
      );
    }

    const result = await deleteCorrection(id, userId);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('API Excluir Error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a exclusão.' },
      { status: 500 }
    );
  }
}
