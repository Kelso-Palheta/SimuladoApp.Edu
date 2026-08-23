import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getSessionFromRequest } from '@/lib/aluno/session';

export async function GET(request) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const professorUid = searchParams.get('professorUid');
    const turmaId = searchParams.get('turmaId');
    const alunoId = searchParams.get('alunoId');

    // Valida se o vínculo solicitado realmente pertence aos vínculos autenticados da sessão
    const vinculoValido = (session.vinculos || []).some(
      (v) =>
        v.professorUid === professorUid ||
        v.turmaId === turmaId ||
        v.id === professorUid
    );

    if (!vinculoValido && session.vinculos?.length > 0) {
      return NextResponse.json(
        { error: 'Acesso negado aos dados desta turma.' },
        { status: 403 }
      );
    }

    // 1. Busca as notas do aluno no Firestore
    const recordId = `${professorUid}_${turmaId}_${alunoId}`;
    let notasData = null;
    try {
      const notasSnap = await getDoc(doc(db, 'notasAluno', recordId));
      if (notasSnap.exists()) {
        notasData = notasSnap.data();
      }
    } catch (e) {
      console.warn('Erro ao buscar notas:', e.message);
    }

    // 2. Busca as atividades atribuídas
    let atividades = [];
    try {
      const atvsRef = collection(db, 'atividades');
      const q = query(
        atvsRef,
        where('professorId', '==', professorUid),
        where('turmas', 'array-contains', turmaId)
      );
      const atvsSnap = await getDocs(q);
      atividades = atvsSnap.docs.map((d) => {
        const data = d.data();
        // Remove gabaritos e rubricas sensíveis no servidor
        delete data.gabarito;
        if (Array.isArray(data.questoes)) {
          data.questoes = data.questoes.map(({ gabarito: _g, rubrica: _r, ...rest }) => rest);
        }
        return { id: d.id, ...data };
      });
    } catch (e) {
      console.warn('Erro ao buscar atividades:', e.message);
    }

    // 3. Busca as entregas feitas pelo aluno
    let entregas = [];
    try {
      const entregasRef = collection(db, 'entregas');
      const qEntregas = query(entregasRef, where('alunoId', '==', alunoId));
      const entregasSnap = await getDocs(qEntregas);
      entregas = entregasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Erro ao buscar entregas:', e.message);
    }

    // 4. Busca a redação corrigida do aluno (se houver)
    let redacao = null;
    try {
      const redacaoSnap = await getDoc(doc(db, 'professores', professorUid, 'correcoes', session.loginKey));
      if (redacaoSnap.exists()) {
        redacao = { id: redacaoSnap.id, ...redacaoSnap.data() };
      }
    } catch (e) {
      console.warn('Erro ao buscar redação:', e.message);
    }

    return NextResponse.json({
      success: true,
      aluno: {
        nome: session.nome,
        login: session.login,
        loginKey: session.loginKey,
      },
      notas: notasData || {},
      atividades,
      entregas,
      redacao,
    });
  } catch (error) {
    console.error('[/api/aluno/boletim] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar o boletim do aluno.' },
      { status: 500 }
    );
  }
}
