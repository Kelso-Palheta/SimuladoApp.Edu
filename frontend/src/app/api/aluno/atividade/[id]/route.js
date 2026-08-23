import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { decodeToken } from '@/utils/diario/tokenUtils';

export async function GET(request, { params }) {
  try {
    const { id: activityId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token de acesso não fornecido.' }, { status: 401 });
    }

    const decoded = decodeToken(token);
    if (!decoded || decoded.activityId !== activityId) {
      return NextResponse.json({ error: 'Token de acesso inválido ou expirado.' }, { status: 403 });
    }

    const { alunoId } = decoded;

    // 1. Busca a atividade no Firestore
    const atvSnap = await getDoc(doc(db, 'atividades', activityId));
    if (!atvSnap.exists()) {
      return NextResponse.json({ error: 'Atividade não encontrada.' }, { status: 404 });
    }

    const atvData = { ...atvSnap.data(), id: atvSnap.id };

    // 2. SEGURANÇA CRÍTICA: Remove gabaritos e rubricas no servidor antes de entregar ao navegador
    delete atvData.gabarito;
    if (Array.isArray(atvData.questoes)) {
      atvData.questoes = atvData.questoes.map(({ gabarito: _g, rubrica: _r, ...rest }) => rest);
    }

    // 3. Busca a entrega existente do aluno (se houver)
    const entregaId = `${activityId}_${alunoId}`;
    const entregaSnap = await getDoc(doc(db, 'entregas', entregaId));
    const entrega = entregaSnap.exists() ? { ...entregaSnap.data(), id: entregaSnap.id } : null;

    // 4. Busca dados do aluno
    let alunoInfo = null;
    try {
      const tokenDoc = await getDoc(doc(db, 'atividades', activityId, 'tokens', alunoId));
      if (tokenDoc.exists()) {
        alunoInfo = tokenDoc.data();
      }
    } catch {}

    return NextResponse.json({
      atividade: atvData,
      entrega,
      alunoInfo,
    });
  } catch (error) {
    console.error('[/api/aluno/atividade/[id]] Erro:', error);
    return NextResponse.json({ error: 'Erro ao carregar atividade.' }, { status: 500 });
  }
}
