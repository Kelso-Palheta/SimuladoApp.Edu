import { useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { ScheduleGeneratorEngine } from '@/lib/engines/ScheduleGeneratorEngine';
import { useAuth } from '@/lib/auth-context';

export function useCalendarioPedagogico() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carrega a grade horária configurada de uma turma.
   */
  const carregarGradeHoraria = useCallback(async (turmaId) => {
    if (!user || !turmaId) return null;
    setLoading(true);
    try {
      // Usando estrutura: professores/{uid}/turmas_grade_horaria/{turmaId}
      // Ou turmas/{turmaId}/grade_horaria (caso turmas sejam globais)
      // Como o SimuladoApp.Edu armazena turmas no professor (doc(professores, uid, turmas, data)),
      // vamos seguir a abordagem isolada por professor.
      const ref = doc(db, 'professores', user.uid, 'grades_horarias', turmaId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (err) {
      console.error("Erro ao carregar grade:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Salva a configuração da grade horária e já gera/regera os slots de aula agendada.
   */
  const configurarGradeHoraria = useCallback(async (turmaId, gradeData) => {
    if (!user || !turmaId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Salvar a Grade Horária
      const gradeRef = doc(db, 'professores', user.uid, 'grades_horarias', turmaId);
      await setDoc(gradeRef, {
        ...gradeData,
        turmaId,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });

      // 2. Gerar os slots usando o Engine
      const slots = ScheduleGeneratorEngine.gerarSlotsCalendario(
        { ...gradeData, turmaId },
        gradeData.dataInicioPeriodo,
        gradeData.dataFimPeriodo
      );

      // 3. Deletar os slots antigos dessa turma para não acumular "lixo"
      const aulasRef = collection(db, 'professores', user.uid, 'aulas_agendadas');
      const q = query(aulasRef, where("turmaId", "==", turmaId));
      const oldSlotsSnap = await getDocs(q);
      
      const batch = writeBatch(db);
      
      // Apaga os slots antigos
      oldSlotsSnap.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      
      // 4. Persistir os novos slots no Firestore usando Batch Write
      slots.forEach(slot => {
        // Usa o id gerado pelo engine (baseado na data e horario)
        const docRef = doc(aulasRef, slot.id);
        batch.set(docRef, slot, { merge: true });
      });

      await batch.commit();

      return slots;
    } catch (err) {
      console.error("Erro ao configurar grade:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Carrega os slots de aula gerados de uma turma (para exibir no calendário)
   */
  const carregarAulasAgendadas = useCallback(async (turmaId) => {
    if (!user || !turmaId) return [];
    setLoading(true);
    try {
      const aulasRef = collection(db, 'professores', user.uid, 'aulas_agendadas');
      const q = query(aulasRef, where("turmaId", "==", turmaId));
      const querySnapshot = await getDocs(q);
      
      const aulas = [];
      querySnapshot.forEach((docSnap) => {
        aulas.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      // Ordena pelas datas
      return aulas.sort((a, b) => new Date(a.dataAgendada) - new Date(b.dataAgendada));
    } catch (err) {
      console.error("Erro ao carregar aulas:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Salva o planejamento anual (lista de tópicos) da turma.
   */
  const salvarPlanejamento = useCallback(async (turmaId, topicos) => {
    if (!user || !turmaId) return;
    setLoading(true);
    try {
      const planRef = doc(db, 'professores', user.uid, 'planejamentos', turmaId);
      await setDoc(planRef, {
        turmaId,
        topicos,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Erro ao salvar planejamento:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Carrega o planejamento anual da turma.
   */
  const carregarPlanejamento = useCallback(async (turmaId) => {
    if (!user || !turmaId) return null;
    setLoading(true);
    try {
      const planRef = doc(db, 'professores', user.uid, 'planejamentos', turmaId);
      const snap = await getDoc(planRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (err) {
      console.error("Erro ao carregar planejamento:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Associa um tópico arrastado a uma aula agendada específica (suporta múltiplos).
   */
  const associarTopicoAula = useCallback(async (aulaId, topico) => {
    if (!user || !aulaId) return;
    setLoading(true);
    try {
      const aulaRef = doc(db, 'professores', user.uid, 'aulas_agendadas', aulaId);
      const snap = await getDoc(aulaRef);
      const currentAula = snap.data() || {};
      
      // Migração suave do modelo antigo para o novo (array)
      let atuais = currentAula.topicosAssociados || [];
      if (currentAula.topicoId && atuais.length === 0) {
        atuais.push({
          topicoId: currentAula.topicoId,
          topicoOrdem: currentAula.topicoOrdem,
          topicoTitulo: currentAula.topicoTitulo,
          duracaoAlocadaAulas: currentAula.duracaoAlocadaAulas || 1
        });
      }

      const novoId = topico.id || topico.ordem.toString();
      // Evita duplicatas
      if (atuais.some(t => t.topicoId === novoId)) {
        setLoading(false);
        return;
      }

      const novos = [...atuais, {
        topicoId: novoId,
        topicoOrdem: topico.ordem,
        topicoTitulo: topico.titulo,
        duracaoAlocadaAulas: topico.duracaoEstimadaAulas || 1,
      }];

      await setDoc(aulaRef, {
        topicosAssociados: novos,
        // Limpar o velho para evitar confusão futura
        topicoId: null,
        topicoOrdem: null,
        topicoTitulo: null
      }, { merge: true });
    } catch (err) {
      console.error("Erro ao associar tópico:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Remove a associação de um tópico específico de uma aula agendada.
   */
  const desassociarTopicoAula = useCallback(async (aulaId, topicoIdParaRemover) => {
    if (!user || !aulaId) return;
    setLoading(true);
    try {
      const aulaRef = doc(db, 'professores', user.uid, 'aulas_agendadas', aulaId);
      const snap = await getDoc(aulaRef);
      const currentAula = snap.data() || {};
      
      let atuais = currentAula.topicosAssociados || [];

      // Filtra por topicoId, id ou ordem
      const novos = topicoIdParaRemover
        ? atuais.filter((t) => {
            const matchId = t.id === topicoIdParaRemover || t.topicoId === topicoIdParaRemover;
            const matchOrdem =
              String(t.ordem) === String(topicoIdParaRemover) ||
              String(t.topicoOrdem) === String(topicoIdParaRemover);
            return !matchId && !matchOrdem;
          })
        : [];

      await setDoc(
        aulaRef,
        {
          topicosAssociados: novos,
          topicoId: null,
          topicoOrdem: null,
          topicoTitulo: null,
          atualizadoEm: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Erro ao remover associação do tópico:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Exclui um slot de aula específico do calendário no Firestore.
   */
  const excluirAula = useCallback(async (aulaId) => {
    if (!user || !aulaId) return;
    setLoading(true);
    try {
      const aulaRef = doc(db, 'professores', user.uid, 'aulas_agendadas', aulaId);
      await deleteDoc(aulaRef);
    } catch (err) {
      console.error("Erro ao excluir aula:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Atualiza o status de uma aula agendada (ex: CONCLUIDA, PARCIAL, NAO_REALIZADA, AGENDADA).
   */
  const atualizarStatusAula = useCallback(async (aulaId, novoStatus) => {
    if (!user || !aulaId) return;
    setLoading(true);
    try {
      const aulaRef = doc(db, 'professores', user.uid, 'aulas_agendadas', aulaId);
      await setDoc(aulaRef, {
        status: novoStatus,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Erro ao atualizar status da aula:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Cancela uma aula (NAO_REALIZADA) e remaneja os tópicos em cascata (Smart Shift) no Firestore.
   */
  const cancelarAulaComRemanejamento = useCallback(async (turmaId, aulaId, todasAulas) => {
    if (!user || !turmaId || !aulaId || !todasAulas) return;
    setLoading(true);
    try {
      const aulasRemanejadas = ScheduleGeneratorEngine.remanejarAulasEmCascata(todasAulas, aulaId);
      
      const batch = writeBatch(db);
      const aulasRef = collection(db, 'professores', user.uid, 'aulas_agendadas');

      aulasRemanejadas.forEach(aula => {
        const docRef = doc(aulasRef, aula.id);
        batch.set(docRef, {
          status: aula.status,
          topicosAssociados: aula.topicosAssociados,
          atualizadoEm: new Date().toISOString()
        }, { merge: true });
      });

      await batch.commit();
      return aulasRemanejadas;
    } catch (err) {
      console.error("Erro ao remanejar aulas em cascata:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Salva a lista de feriados e recessos da turma.
   */
  const salvarFeriados = useCallback(async (turmaId, feriados) => {
    if (!user || !turmaId) return;
    setLoading(true);
    try {
      const feriadosRef = doc(db, 'professores', user.uid, 'feriados_turmas', turmaId);
      await setDoc(feriadosRef, {
        turmaId,
        feriados,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Erro ao salvar feriados:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Carrega a lista de feriados e recessos da turma.
   */
  const carregarFeriados = useCallback(async (turmaId) => {
    if (!user || !turmaId) return [];
    setLoading(true);
    try {
      const feriadosRef = doc(db, 'professores', user.uid, 'feriados_turmas', turmaId);
      const snap = await getDoc(feriadosRef);
      if (snap.exists()) {
        return snap.data().feriados || [];
      }
      return [];
    } catch (err) {
      console.error("Erro ao carregar feriados:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Distribui automaticamente os tópicos de planejamento nas aulas a partir de uma data inicial.
   */
  const autoDistribuirTopicos = useCallback(async (turmaId, todasAulas, topicos, options = {}) => {
    if (!user || !turmaId || !todasAulas || !topicos) return [];
    setLoading(true);
    try {
      const aulasAtualizadas = ScheduleGeneratorEngine.autoDistribuirTopicos(todasAulas, topicos, options);

      const batch = writeBatch(db);
      const aulasRef = collection(db, 'professores', user.uid, 'aulas_agendadas');

      aulasAtualizadas.forEach((aula) => {
        const docRef = doc(aulasRef, aula.id);
        batch.set(
          docRef,
          {
            topicosAssociados: aula.topicosAssociados,
            atualizadoEm: new Date().toISOString(),
          },
          { merge: true }
        );
      });

      await batch.commit();
      return aulasAtualizadas;
    } catch (err) {
      console.error('Erro ao auto-distribuir tópicos:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Atualiza status da aula com suporte à decisão interativa de remanejamento vs pular conteúdo.
   */
  const atualizarStatusComDecisao = useCallback(async (turmaId, aulaId, todasAulas, novoStatus, decisao = 'pular') => {
    if (!user || !turmaId || !aulaId || !todasAulas) return [];
    setLoading(true);
    try {
      const aulasAtualizadas = ScheduleGeneratorEngine.atualizarStatusComDecisao(
        todasAulas,
        aulaId,
        novoStatus,
        decisao
      );

      const batch = writeBatch(db);
      const aulasRef = collection(db, 'professores', user.uid, 'aulas_agendadas');

      aulasAtualizadas.forEach((aula) => {
        const docRef = doc(aulasRef, aula.id);
        batch.set(
          docRef,
          {
            status: aula.status,
            topicosAssociados: aula.topicosAssociados,
            atualizadoEm: new Date().toISOString(),
          },
          { merge: true }
        );
      });

      await batch.commit();
      return aulasAtualizadas;
    } catch (err) {
      console.error('Erro ao atualizar status com decisão:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Adiciona um novo tópico manualmente ao planejamento da turma.
   */
  const adicionarTopicoManual = useCallback(async (turmaId, novoTopico, planejamentoAtual) => {
    if (!user || !turmaId || !novoTopico) return null;
    setLoading(true);
    try {
      const topicosAntigos = planejamentoAtual?.topicos || [];
      const novaOrdem = topicosAntigos.length + 1;
      const topicoCriado = {
        id: novoTopico.id || `topico_${Date.now()}`,
        ordem: novoTopico.ordem || novaOrdem,
        titulo: novoTopico.titulo.trim(),
        descricao: novoTopico.descricao ? novoTopico.descricao.trim() : '',
        duracaoEstimadaAulas: Number(novoTopico.duracaoEstimadaAulas) || 1,
      };

      const topicosAtualizados = [...topicosAntigos, topicoCriado];
      await salvarPlanejamento(turmaId, topicosAtualizados);

      return {
        ...planejamentoAtual,
        topicos: topicosAtualizados,
      };
    } catch (err) {
      console.error('Erro ao adicionar tópico manual:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, salvarPlanejamento]);

  /**
   * Edita os dados de um tópico existente no planejamento e sincroniza com as aulas agendadas.
   */
  const editarTopico = useCallback(async (turmaId, topicoId, novosDados, planejamentoAtual, todasAulas = []) => {
    if (!user || !turmaId || !topicoId || !novosDados) return null;
    setLoading(true);
    try {
      const topicosAntigos = planejamentoAtual?.topicos || [];
      const topicosAtualizados = topicosAntigos.map((t) => {
        if (t.id !== topicoId) return t;
        return {
          ...t,
          titulo: novosDados.titulo ? novosDados.titulo.trim() : t.titulo,
          descricao: novosDados.descricao !== undefined ? novosDados.descricao.trim() : t.descricao,
          duracaoEstimadaAulas: Number(novosDados.duracaoEstimadaAulas) || t.duracaoEstimadaAulas || 1,
        };
      });

      await salvarPlanejamento(turmaId, topicosAtualizados);

      // Sincroniza o título atualizado nas aulas que possuem este tópico associado
      if (todasAulas.length > 0) {
        const batch = writeBatch(db);
        const aulasRef = collection(db, 'professores', user.uid, 'aulas_agendadas');
        let houveAlteracaoEmAula = false;

        todasAulas.forEach((aula) => {
          if (aula.topicosAssociados && aula.topicosAssociados.some((ta) => ta.id === topicoId)) {
            houveAlteracaoEmAula = true;
            const topicosDaAula = aula.topicosAssociados.map((ta) => {
              if (ta.id !== topicoId) return ta;
              return { ...ta, ...novosDados };
            });
            const docRef = doc(aulasRef, aula.id);
            batch.set(docRef, { topicosAssociados: topicosDaAula }, { merge: true });
          }
        });

        if (houveAlteracaoEmAula) {
          await batch.commit();
        }
      }

      return {
        ...planejamentoAtual,
        topicos: topicosAtualizados,
      };
    } catch (err) {
      console.error('Erro ao editar tópico:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, salvarPlanejamento]);

  /**
   * Exclui um tópico do planejamento e desassocia de qualquer aula que o contenha.
   */
  const excluirTopico = useCallback(async (turmaId, topicoId, planejamentoAtual, todasAulas = []) => {
    if (!user || !turmaId || !topicoId) return null;
    setLoading(true);
    try {
      const topicosAntigos = planejamentoAtual?.topicos || [];
      const topicosAtualizados = topicosAntigos.filter((t) => t.id !== topicoId);

      await salvarPlanejamento(turmaId, topicosAtualizados);

      // Remove de qualquer aula agendada
      if (todasAulas.length > 0) {
        const batch = writeBatch(db);
        const aulasRef = collection(db, 'professores', user.uid, 'aulas_agendadas');
        let houveAlteracaoEmAula = false;

        todasAulas.forEach((aula) => {
          if (aula.topicosAssociados && aula.topicosAssociados.some((ta) => ta.id === topicoId)) {
            houveAlteracaoEmAula = true;
            const topicosDaAula = aula.topicosAssociados.filter((ta) => ta.id !== topicoId);
            const docRef = doc(aulasRef, aula.id);
            batch.set(docRef, { topicosAssociados: topicosDaAula }, { merge: true });
          }
        });

        if (houveAlteracaoEmAula) {
          await batch.commit();
        }
      }

      return {
        ...planejamentoAtual,
        topicos: topicosAtualizados,
      };
    } catch (err) {
      console.error('Erro ao excluir tópico:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, salvarPlanejamento]);

  return {
    loading,
    error,
    carregarGradeHoraria,
    configurarGradeHoraria,
    carregarAulasAgendadas,
    salvarPlanejamento,
    carregarPlanejamento,
    associarTopicoAula,
    desassociarTopicoAula,
    atualizarStatusAula,
    atualizarStatusComDecisao,
    cancelarAulaComRemanejamento,
    autoDistribuirTopicos,
    adicionarTopicoManual,
    editarTopico,
    excluirTopico,
    excluirAula,
    salvarFeriados,
    carregarFeriados
  };
}
