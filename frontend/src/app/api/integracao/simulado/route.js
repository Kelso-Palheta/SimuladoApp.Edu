import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    // 1. Validar Token de Segurança da Variável de Ambiente
    const expectedKey = process.env.SHARED_INTEGRATION_KEY || 'simulado_app_edu_secret_key_2026';
    if (!token || token !== expectedKey) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const data = await request.json();
    const {
      aluno_nome,
      bimestre,
      pontuacao_porcentagem,
      professor_uid
    } = data;

    if (!aluno_nome || !professor_uid) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes.' }, { status: 400 });
    }

    // 2. Localizar o Diário do Professor
    const refSub = doc(db, 'professores', professor_uid, 'turmas', 'data');
    const snapSub = await getDoc(refSub);
    
    if (!snapSub.exists()) {
      return NextResponse.json({ error: 'Professor ou diário não encontrado.' }, { status: 404 });
    }

    const turmasData = snapSub.data().turmas || [];
    let turmaAlvo = null;
    let alunoAlvo = null;

    // 3. Mapear Aluno por Comparação de Nome
    const cleanStr = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    const targetNome = cleanStr(aluno_nome);

    for (const t of turmasData) {
      const found = t.alunos?.find(al => cleanStr(al.nome) === targetNome);
      if (found) {
        turmaAlvo = t;
        alunoAlvo = found;
        break;
      }
    }

    if (!turmaAlvo || !alunoAlvo) {
      return NextResponse.json({ error: `Aluno ${aluno_nome} não localizado nas turmas do professor.` }, { status: 404 });
    }

    // 4. Calcular Nota Proporcional (Ex: se simuladoMaxLanca = 5.0, nota = 80% -> 4.0)
    const bKey = String(bimestre || 1);
    const configBimestre = turmaAlvo.bimestres?.[bKey]?.config || {};
    const maxSimulado = Number(configBimestre.simuladoMaxLanca) || 5.0; // Default de 5.0 pts
    const notaCalculada = Math.round(((pontuacao_porcentagem / 100) * maxSimulado) * 100) / 100;

    // 5. Atualizar Estrutura Local das Turmas
    const novasTurmas = turmasData.map(t => {
      if (t.id !== turmaAlvo.id) return t;
      const bData = t.bimestres?.[bKey] || { atividades: [], notas: {} };
      const notasAnteriores = bData.notas || {};
      
      return {
        ...t,
        bimestres: {
          ...t.bimestres,
          [bKey]: {
            ...bData,
            notas: {
              ...notasAnteriores,
              [alunoAlvo.id]: {
                ...(notasAnteriores[alunoAlvo.id] || {}),
                simulado: notaCalculada // Grava a nota no campo 'simulado'
              }
            }
          }
        }
      };
    });

    const nowTime = Date.now();
    // 6. Gravar de Volta no Firestore do Professor (Diário)
    await setDoc(refSub, { turmas: novasTurmas, lastUpdated: nowTime }, { merge: true });

    // 7. Gravar Notas do Aluno de Forma Isolada (Sincronização do Portal do Aluno)
    const recordId = `${professor_uid}_${turmaAlvo.id}_${alunoAlvo.id}`;
    const notaRef = doc(db, 'notasAluno', recordId);
    
    // Recupera nota anterior para fazer o merge completo das bimestrais
    const notaSnap = await getDoc(notaRef);
    const notasExistentes = notaSnap.exists() ? notaSnap.data().bimestres || {} : {};
    
    const novasNotasBimestre = {
      ...notasExistentes,
      [bKey]: {
        ...(notasExistentes[bKey] || {}),
        notas: {
          ...(notasExistentes[bKey]?.notas || {}),
          [alunoAlvo.id]: {
            ...(notasExistentes[bKey]?.notas?.[alunoAlvo.id] || {}),
            simulado: notaCalculada
          }
        }
      }
    };

    await setDoc(notaRef, {
      nome: alunoAlvo.nome,
      bimestres: novasNotasBimestre,
      atualizadoEm: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ success: true, nota_lancada: notaCalculada, turma: turmaAlvo.nome });
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno: ' + err.message }, { status: 500 });
  }
}
