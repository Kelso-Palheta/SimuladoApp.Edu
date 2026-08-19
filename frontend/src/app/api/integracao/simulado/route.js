import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    // 1. Validar Token de Segurança da Variável de Ambiente
    const validTokens = [
      process.env.DIARIO_INTEGRATION_TOKEN,
      process.env.SHARED_INTEGRATION_KEY,
      'simulado_app_edu_secret_key_2026'
    ].filter(Boolean);

    if (!token || !validTokens.includes(token)) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const data = await request.json();

    // Extrai os campos suportando tanto o formato aninhado do Django quanto o formato plano
    const alunoNome = data.aluno?.nome || data.aluno_nome;
    const alunoEmail = data.aluno?.email || data.aluno_email;
    const alunoMatricula = data.aluno?.matricula || data.aluno_matricula;

    const professorEmail = data.professor?.email || data.professor_email;
    const rawProfessorUid = data.professor_uid || data.professor?.uid || data.professor?.id;
    
    const pontuacaoPorcentagem = data.desempenho?.pontuacao ?? data.pontuacao_porcentagem ?? 0;
    
    // Mapeamento do bimestre
    let bimestre = data.bimestre;
    if (!bimestre && data.desempenho?.tipo_prova) {
      const parsed = parseInt(data.desempenho.tipo_prova, 10);
      if (!isNaN(parsed) && parsed > 0) {
        bimestre = parsed;
      }
    }
    if (!bimestre) {
      bimestre = 1;
    }

    if (!alunoNome) {
      return NextResponse.json({ error: 'Nome do aluno é obrigatório.' }, { status: 400 });
    }

    let professorUid = rawProfessorUid ? String(rawProfessorUid) : null;
    let snapSub = null;
    let refSub = null;

    // 2. Localizar o Diário do Professor no Firestore
    // Primeiro tenta pelo UID se fornecido
    if (professorUid) {
      refSub = doc(db, 'professores', professorUid, 'turmas', 'data');
      snapSub = await getDoc(refSub);
    }

    // Se não encontrou pelo UID ou se o UID não era um ID do Firebase, busca por e-mail do professor
    if ((!snapSub || !snapSub.exists()) && professorEmail) {
      const qProf = query(collection(db, 'professores'), where('email', '==', professorEmail));
      const queryProfSnap = await getDocs(qProf);

      if (!queryProfSnap.empty) {
        const profDoc = queryProfSnap.docs[0];
        professorUid = profDoc.id;
        refSub = doc(db, 'professores', professorUid, 'turmas', 'data');
        snapSub = await getDoc(refSub);
      }
    }

    if (!snapSub || !snapSub.exists()) {
      return NextResponse.json({ 
        error: 'Professor ou diário pedagógico não localizado no sistema.' 
      }, { status: 404 });
    }

    const turmasData = snapSub.data().turmas || [];
    let turmaAlvo = null;
    let alunoAlvo = null;

    // Helper para normalização de nomes
    const cleanStr = (s) => String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    const targetNome = cleanStr(alunoNome);
    const targetEmail = alunoEmail ? cleanStr(alunoEmail) : null;
    const targetMatricula = alunoMatricula ? String(alunoMatricula).trim() : null;

    // Se o Django especificou turmas no payload (ex: [{"id": 3, "nome": "3º Ano A"}]), tentar priorizar turmas correspondentes
    const turmasFiltro = Array.isArray(data.turmas) && data.turmas.length > 0 
      ? data.turmas.map(t => cleanStr(t.nome))
      : null;

    for (const t of turmasData) {
      if (turmasFiltro && turmasFiltro.length > 0) {
        const nomeTurmaClean = cleanStr(t.nome);
        const bateuTurma = turmasFiltro.some(tf => nomeTurmaClean.includes(tf) || tf.includes(nomeTurmaClean));
        if (!bateuTurma) continue;
      }

      const found = t.alunos?.find(al => {
        if (targetMatricula && String(al.matricula || '').trim() === targetMatricula) return true;
        if (targetEmail && cleanStr(al.email) === targetEmail) return true;
        return cleanStr(al.nome) === targetNome;
      });

      if (found) {
        turmaAlvo = t;
        alunoAlvo = found;
        break;
      }
    }

    // Se não encontrou filtrando por turma, faz a busca global por todas as turmas do professor
    if (!turmaAlvo || !alunoAlvo) {
      for (const t of turmasData) {
        const found = t.alunos?.find(al => {
          if (targetMatricula && String(al.matricula || '').trim() === targetMatricula) return true;
          if (targetEmail && cleanStr(al.email) === targetEmail) return true;
          return cleanStr(al.nome) === targetNome;
        });

        if (found) {
          turmaAlvo = t;
          alunoAlvo = found;
          break;
        }
      }
    }

    if (!turmaAlvo || !alunoAlvo) {
      return NextResponse.json({ 
        error: `Aluno "${alunoNome}" não foi localizado nas turmas do professor.` 
      }, { status: 404 });
    }

    // 4. Calcular Nota Proporcional (Ex: se simuladoMaxLanca = 5.0, pontuacao = 85.0% -> 4.25)
    const bKey = String(bimestre || 1);
    const configBimestre = turmaAlvo.bimestres?.[bKey]?.config || {};
    const maxSimulado = Number(configBimestre.simuladoMaxLanca) || 5.0; // Default de 5.0 pts
    const notaCalculada = Math.round(((pontuacaoPorcentagem / 100) * maxSimulado) * 100) / 100;

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
                simulado: notaCalculada
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
    const recordId = `${professorUid}_${turmaAlvo.id}_${alunoAlvo.id}`;
    const notaRef = doc(db, 'notasAluno', recordId);
    
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

    return NextResponse.json({ 
      success: true, 
      nota_lancada: notaCalculada, 
      max_simulado: maxSimulado,
      pontuacao_porcentagem: pontuacaoPorcentagem,
      turma: turmaAlvo.nome,
      aluno: alunoAlvo.nome
    });

  } catch (err) {
    return NextResponse.json({ error: 'Erro interno: ' + err.message }, { status: 500 });
  }
}

