import { NextResponse } from 'next/server';
import { updatePassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'E-mail e Nova Senha são obrigatórios.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const { success, error } = await updatePassword(email, newPassword);

    if (!success) {
      return NextResponse.json({ error: error || 'Erro ao redefinir a senha.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro na rota de reset de senha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
