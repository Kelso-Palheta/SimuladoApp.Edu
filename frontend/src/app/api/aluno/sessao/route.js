import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/aluno/session';

export async function GET(request) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      aluno: {
        loginKey: session.loginKey,
        nome: session.nome,
        login: session.login,
        vinculos: session.vinculos || [],
      },
    });
  } catch (error) {
    console.error('[/api/aluno/sessao] Erro:', error);
    return NextResponse.json({ authenticated: false, error: 'Erro ao validar sessão.' }, { status: 500 });
  }
}
