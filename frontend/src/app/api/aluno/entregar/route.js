import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { activityId, alunoId, turmaId, bimestre, respostas, respostaTexto } = body;

    if (!activityId || !alunoId) {
      return NextResponse.json({ error: 'Dados da entrega incompletos.' }, { status: 400 });
    }

    // 1. Valida se a atividade existe e se ainda está no prazo
    const atvSnap = await getDoc(doc(db, 'atividades', activityId));
    if (!atvSnap.exists()) {
      return NextResponse.json({ error: 'Atividade não encontrada.' }, { status: 404 });
    }

    const atvData = atvSnap.data();
    const agora = new Date();
    const prazo = atvData.dataEntrega?.toDate?.() || new Date(atvData.dataEntrega);

    if (prazo < agora) {
      return NextResponse.json({ error: 'O prazo de entrega desta atividade já expirou.' }, { status: 400 });
    }

    // 2. Grava a entrega no Firestore
    const entregaId = `${activityId}_${alunoId}`;
    const ref = doc(db, 'entregas', entregaId);

    const payload = {
      activityId,
      alunoId,
      turmaId: turmaId || null,
      bimestre: bimestre || atvData.bimestre || 1,
      professorId: atvData.professorId || null,
      ...(respostas != null ? { respostas } : {}),
      ...(respostaTexto != null ? { respostaTexto } : {}),
      status: 'entregue',
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(ref, payload, { merge: true });

    return NextResponse.json({ success: true, entregaId });
  } catch (error) {
    console.error('[/api/aluno/entregar] Erro:', error);
    return NextResponse.json({ error: 'Erro ao registrar entrega.' }, { status: 500 });
  }
}
