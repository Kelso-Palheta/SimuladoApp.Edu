"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { corrigirAtividade, detectarRespostasSimilares } from '@/utils/atividades/correcaoIA';

export function useEntregas(activityId, onNotaChanged) {
  const [entregas, setEntregas] = useState([]);
  const [corrigindo, setCorrigindo] = useState(null);
  const penalizadosRef = useRef(new Set());

  useEffect(() => {
    if (!activityId) return;
    const q = query(collection(db, 'entregas'), where('activityId', '==', activityId));
    const unsub = onSnapshot(q, (snap) => {
      setEntregas(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, [activityId]);

  const overrideNota = useCallback(async (entregaId, novaNota, professorId) => {
    const entrega = entregas.find(e => e.id === entregaId);
    if (!entrega) return;
    await setDoc(doc(db, 'entregas', entregaId), {
      notaRevisada: Number(novaNota),
      notaAnteriorRevisao: entrega.notaRevisada ?? entrega.notaFinal ?? null,
      revisadaPorId: professorId,
      revisadaEm: serverTimestamp(),
      status: 'revisado'
    }, { merge: true });
  }, [entregas]);

  const corrigirEntrega = useCallback(async (entregaId, atividade, nivelCorrecao = 'normal') => {
    const entrega = entregas.find(e => e.id === entregaId);
    if (!entrega || !atividade) return;

    setCorrigindo(entregaId);
    try {
      let resultado;

      if (atividade.questoes?.length > 0) {
        resultado = await corrigirAtividade({
          questoes: atividade.questoes,
          respostas: entrega.respostas || {},
          materialTexto: atividade.materialApoio?.textoExtraido || '',
          nivelCorrecao
        });

        await setDoc(doc(db, 'entregas', entregaId), {
          resultados: resultado.resultados,
          notaOriginal: resultado.notaFinal,
          notaFinal: resultado.notaFinal,
          modeloIA: resultado.modelo,
          corrigidoEm: serverTimestamp(),
          status: 'corrigido'
        }, { merge: true });
      } else {
        resultado = await corrigirAtividade({
          enunciado: atividade.enunciado,
          gabarito: atividade.gabarito,
          respostaTexto: entrega.respostaTexto || '',
          notaMaxima: atividade.notaMaxima || 10,
          imagens: [],
          nivelCorrecao
        });

        await setDoc(doc(db, 'entregas', entregaId), {
          notaIA: resultado.notaIA,
          notaOriginal: resultado.notaFinal,
          notaFinal: resultado.notaFinal,
          feedback: resultado.feedback,
          criterios: resultado.criterios,
          modeloIA: resultado.modelo,
          corrigidoEm: serverTimestamp(),
          status: 'corrigido'
        }, { merge: true });
      }

      if (resultado && entrega) {
        const notaValor = resultado.notaFinal;
        onNotaChanged?.({
          turmaId: entrega.turmaId,
          bimestre: entrega.bimestre,
          alunoId: entrega.alunoId,
          notaFinal: notaValor
        });

        try {
          const atvSnap = await getDoc(doc(db, 'atividades', activityId));
          const atvData = atvSnap.exists() ? atvSnap.data() : null;
          const profId = atvData?.professorId;
          if (profId) {
            const turmaRef = doc(db, 'users', profId, 'turmas', 'data');
            const turmaSnap = await getDoc(turmaRef);
            if (turmaSnap.exists()) {
              const turmas = turmaSnap.data().turmas || [];
              const b = String(entrega.bimestre);
              const idx = turmas.findIndex(t => t.id === entrega.turmaId);
              if (idx >= 0) {
                const bData = turmas[idx].bimestres?.[b] || { atividades: [], notas: {} };
                const notasAtuais = bData.notas || {};
                const atvs = bData.atividades || [];
                const atvNoMapa = atvs.find(a => a.nome === atvData?.titulo)
                  || atvs.find(a => a.id === activityId);
                const atvId = atvNoMapa?.id || activityId;
                const alunoNotas = notasAtuais[entrega.alunoId] || {};
                alunoNotas[atvId] = notaValor;
                notasAtuais[entrega.alunoId] = alunoNotas;
                turmas[idx] = {
                  ...turmas[idx],
                  bimestres: { ...turmas[idx].bimestres, [b]: { ...bData, notas: notasAtuais } }
                };
                await setDoc(turmaRef, { turmas, updatedAt: serverTimestamp() }, { merge: true });
              }
            }
          }
        } catch (e) {
          console.error('Erro ao sincronizar nota no mapa bimestral:', e);
        }
      }

      return resultado;
    } catch (err) {
      console.error('Erro na correção por IA:', err);
      await setDoc(doc(db, 'entregas', entregaId), { status: 'erro_correcao' }, { merge: true });
      throw err;
    } finally {
      setCorrigindo(null);
    }
  }, [entregas, activityId, onNotaChanged]);

  // Detecção de plágio
  useEffect(() => {
    const corrigidas = entregas.filter(e =>
      (e.status === 'corrigido' || e.status === 'revisado') && !e.notaRevisada
    );
    if (corrigidas.length < 2) return;

    const { clusters, penalizados } = detectarRespostasSimilares(corrigidas);
    if (clusters.length === 0) return;

    const novosPenalizados = new Set([...penalizados].filter(id => !penalizadosRef.current.has(id)));
    if (novosPenalizados.size === 0) return;

    (async () => {
      for (const entrega of corrigidas) {
        if (novosPenalizados.has(entrega.alunoId)) {
          penalizadosRef.current.add(entrega.alunoId);
          const notaOriginal = entrega.notaOriginal ?? entrega.notaFinal ?? 0;
          const notaPenalizada = Math.round(notaOriginal * 0.5 * 100) / 100;
          await setDoc(doc(db, 'entregas', entrega.id), {
            notaOriginal,
            notaFinal: notaPenalizada,
            penalidadePlagio: true
          }, { merge: true });
          onNotaChanged?.({
            turmaId: entrega.turmaId,
            bimestre: entrega.bimestre,
            alunoId: entrega.alunoId,
            notaFinal: notaPenalizada
          });
        }
      }
      const infoClusters = clusters.map(g => ({
        alunos: g.map(e => e.alunoId),
        similaridade: 85
      }));
      await setDoc(doc(db, 'atividades', activityId), {
        similares: infoClusters,
        totalPenalizados: penalizadosRef.current.size
      }, { merge: true }).catch(() => {});
    })();
  }, [entregas, activityId, onNotaChanged]);

  return { entregas, corrigindo, overrideNota, corrigirEntrega };
}
