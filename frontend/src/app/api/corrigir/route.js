import { NextResponse } from 'next/server';
import { generateCorrection } from '@/lib/redacao/ai-provider';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { gerarLoginKey } from '@/utils/diario/loginAluno';
import { vincularAlunoProfessor } from '@/lib/firebase-aluno';

export const maxDuration = 60;

function extractScore(fullText) {
  try {
    const jsonMatch = fullText.match(/```json[\s\S]*?(\{[\s\S]*?\})[\s\S]*?```/) || fullText.match(/(\{[\s]*?"c1"[\s\S]*?\})/);
    if (jsonMatch && jsonMatch[1]) {
      const obj = JSON.parse(jsonMatch[1].trim());
      const c1 = Number(obj.c1) || 0;
      const c2 = Number(obj.c2) || 0;
      const c3 = Number(obj.c3) || 0;
      const c4 = Number(obj.c4) || 0;
      const c5 = Number(obj.c5) || 0;
      const total = Number(obj.total) || (c1 + c2 + c3 + c4 + c5);
      return {
        total,
        items: [
          { subject: 'C1', A: c1, fullMark: 200 },
          { subject: 'C2', A: c2, fullMark: 200 },
          { subject: 'C3', A: c3, fullMark: 200 },
          { subject: 'C4', A: c4, fullMark: 200 },
          { subject: 'C5', A: c5, fullMark: 200 },
        ]
      };
    }
  } catch (e) { /* ignora */ }
  return null;
}

export async function POST(request) {
  try {
    const {
      text, imageBase64, studentName, studentClass,
      essayTheme, depth, competencies, userId,
      loginAluno, loginKey, motivatorText
    } = await request.json();

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: 'Você precisa enviar um texto ou uma imagem da redação.' },
        { status: 400 }
      );
    }

    const result = await generateCorrection({
      text, imageBase64, studentName, studentClass,
      essayTheme, depth, competencies, motivatorText
    });

    const scores = result ? extractScore(result) : null;

    if (userId && db) {
      const corrData = {
        studentName: studentName || 'Estudante',
        studentClass: studentClass || 'N/A',
        essayTheme: essayTheme || 'Geral',
        motivatorText: motivatorText || '',
        result: result || '',
        scoreData: scores?.items || [],
        totalScore: scores?.total || 0,
        userId,
        createdAt: serverTimestamp()
      };

      // Determina o ID: loginKey (hash) ou aleatório
      let corrId;
      let storedLoginKey = null;

      if (loginAluno) {
        storedLoginKey = await gerarLoginKey(loginAluno);
        corrId = storedLoginKey;

        // Cria/atualiza vínculo do aluno com este professor (multi-professor)
        await vincularAlunoProfessor({
          login: loginAluno,
          nome: studentName || 'Estudante',
          professorUid: userId,
          turmaId: studentClass || 'N/A',
          modulo: 'redacao',
          nomeProfessor: nomeProfessor || ''
        });

        corrData.loginAluno = loginAluno;
      } else {
        const a = Math.random().toString(36).substring(2, 5).toUpperCase();
        const b = Math.random().toString(36).substring(2, 5).toUpperCase();
        corrId = `${a}-${b}`;
      }
      corrData.id = corrId;

      const ref = doc(db, 'professores', userId, 'correcoes', corrId);
      await setDoc(ref, corrData);
    }

    return NextResponse.json({ result, scores, login: loginAluno });
  } catch (error) {
    console.error('ERRO NA API DE CORREÇÃO:', error);
    return NextResponse.json(
      { error: `Não foi possível realizar a correção. ${error.message || ''}` },
      { status: 500 }
    );
  }
}
