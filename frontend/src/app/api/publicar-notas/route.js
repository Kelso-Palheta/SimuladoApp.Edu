import { NextResponse } from 'next/server';
import { gerarLoginAluno, gerarLoginKey } from '@/utils/diario/loginAluno';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dashboard-gestao-notas';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function firestorePatch(path, fields) {
  const res = await fetch(`${FIRESTORE_BASE}/${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json();
}

function toFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) fields[k] = { nullValue: null };
    else if (typeof v === 'number') fields[k] = { doubleValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (typeof v === 'object' && !Array.isArray(v)) {
      const nested = {};
      for (const [nk, nv] of Object.entries(v)) {
        if (typeof nv === 'number') nested[nk] = { doubleValue: nv };
        else if (nv !== undefined) nested[nk] = { stringValue: String(nv) };
      }
      fields[k] = { mapValue: { fields: nested } };
    } else {
      fields[k] = { stringValue: String(v) };
    }
  }
  return fields;
}

function toMapValue(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'number') fields[k] = { doubleValue: v };
    else if (typeof v === 'object' && !Array.isArray(v)) {
      const nested = {};
      for (const [nk, nv] of Object.entries(v)) {
        if (typeof nv === 'number') nested[nk] = { doubleValue: nv };
        else if (nv !== undefined) nested[nk] = { stringValue: String(nv) };
      }
      fields[k] = { mapValue: { fields: nested } };
    } else {
      fields[k] = { stringValue: String(v) };
    }
  }
  return { mapValue: { fields } };
}

export async function POST(request) {
  try {
    const { userId, nomeProfessor, turmas } = await request.json();

    if (!userId || !turmas?.length) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    let total = 0;
    let erros = 0;

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
          });

          // 2. Vínculo professor-aluno
          await firestorePatch(`alunoLogin/${loginKey}/vinculos/${userId}`, {
            professorUid: { stringValue: userId },
            turmaId: { stringValue: turma.id },
            turmaNome: { stringValue: turma.nome },
            alunoId: { stringValue: aluno.id },
            modulo: { stringValue: 'diario' },
            nomeProfessor: { stringValue: nomeProfessor || 'Professor' },
            atualizadoEm: { stringValue: now }
          });

          // 3. Notas
          const recordId = `${userId}_${turma.id}_${aluno.id}`;
          await firestorePatch(`notasAluno/${recordId}`, {
            nome: { stringValue: aluno.nome },
            bimestres: toMapValue(turma.bimestres || {}),
            atualizadoEm: { stringValue: now }
          });

          total++;
        } catch (e) {
          console.error(`Erro aluno ${aluno.nome}:`, e.message);
          erros++;
        }
      }
    }

    return NextResponse.json({ total, erros });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
