import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getSessionFromRequest } from '@/lib/aluno/session';

export async function GET(request, { params }) {
  try {
    const { id: redacaoId } = await params;
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado. Faça login.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const professorUid = searchParams.get('professorUid');

    // Valida se o professorUid pertence aos vínculos do aluno
    const vinculoValido = (session.vinculos || []).some(
      (v) => v.professorUid === professorUid || v.id === professorUid
    );

    if (!vinculoValido && session.vinculos?.length > 0 && professorUid) {
      return NextResponse.json({ error: 'Acesso negado a esta redação.' }, { status: 403 });
    }

    // Busca a redação diretamente no Firestore via servidor
    let correction = null;

    if (professorUid) {
      const snap = await getDoc(doc(db, 'professores', professorUid, 'correcoes', redacaoId));
      if (snap.exists()) {
        correction = { id: snap.id, ...snap.data() };
      }
    }

    // Se não passou professorUid, tenta nos vínculos do aluno
    if (!correction) {
      for (const v of session.vinculos || []) {
        const pUid = v.professorUid || v.id;
        if (pUid) {
          const snap = await getDoc(doc(db, 'professores', pUid, 'correcoes', redacaoId));
          if (snap.exists()) {
            correction = { id: snap.id, ...snap.data() };
            break;
          }
        }
      }
    }

    if (!correction) {
      return NextResponse.json({ error: 'Redação não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ correction });
  } catch (error) {
    console.error('[/api/aluno/redacao/[id]] Erro:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar redação.' }, { status: 500 });
  }
}
