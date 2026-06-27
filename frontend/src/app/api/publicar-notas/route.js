import { NextResponse } from 'next/server';
import { gerarLoginAluno, gerarLoginKey } from '@/utils/diario/loginAluno';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dashboard-gestao-notas';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function firestorePatch(path, fields, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${FIRESTORE_BASE}/${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json();
}

function toFirestoreValue(v) {
  if (v === null || v === undefined) return { nullValue: 'NULL_VALUE' };
  if (typeof v === 'number') return { doubleValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(toFirestoreValue) } };
  }
  if (typeof v === 'object') {
    const fields = {};
    for (const [k, val] of Object.entries(v)) {
      if (val !== undefined) fields[k] = toFirestoreValue(val);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

export async function POST(request) {
  try {
    // Extrai o token de autenticação do header
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const { userId, nomeProfessor, turmas } = await request.json();

    if (!userId || !turmas?.length) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    let total = 0;
    let erros = 0;
    let errosDetails = [];

    for (const turma of turmas) {
      for (const aluno of (turma.alunos || [])) {
        if (!aluno.dataNascimento) continue;

        try {
          const loginStr = gerarLoginAluno(aluno.nome, aluno.dataNascimento);
          const loginKey = await gerarLoginKey(loginStr);
          const now = new Date().toISOString();

          // 1. Base aluno
          await firestorePatch(`alunoLogin/${loginKey}`, {
            nome: { stringValue: aluno.nome },
            login: { stringValue: loginStr }
          }, token);

          // 2. Vínculo professor-aluno
          await firestorePatch(`alunoLogin/${loginKey}/vinculos/${userId}`, {
            professorUid: { stringValue: userId },
            turmaId: { stringValue: turma.id },
            turmaNome: { stringValue: turma.nome },
            alunoId: { stringValue: aluno.id },
            modulo: { stringValue: 'diario' },
            nomeProfessor: { stringValue: nomeProfessor || 'Professor' },
            atualizadoEm: { stringValue: now }
          }, token);

          // 3. Notas
          const recordId = `${userId}_${turma.id}_${aluno.id}`;
          const notaFields = toFirestoreValue({
            nome: aluno.nome,
            bimestres: turma.bimestres || {},
            atualizadoEm: now
          }).mapValue.fields;

          await firestorePatch(`notasAluno/${recordId}`, notaFields, token);

          total++;
        } catch (e) {
          console.error(`Erro aluno ${aluno.nome}:`, e.message);
          erros++;
          errosDetails.push(e.message);
          if (erros === 1) {
            try {
              await firestorePatch(`professores/${userId}/debug`, {
                lastError: { stringValue: e.message }
              }, token);
            } catch (ignore) {}
          }
        }
      }
    }

    if (erros > 0 && errosDetails.length > 0) {
      return NextResponse.json({ error: `Falha no Firestore: ${errosDetails[0]}` }, { status: 500 });
    }

    return NextResponse.json({ total, erros, errosDetails });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
