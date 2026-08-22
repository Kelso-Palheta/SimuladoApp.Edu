"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, writeBatch } from 'firebase/firestore';

import { Sidebar } from '@/components/calendario/Sidebar';
import { CalendarioView } from '@/components/calendario/CalendarioView';
import { ConfigGradeModal } from '@/components/calendario/ConfigGradeModal';
import { ImportPlanejamentoModal } from '@/components/calendario/ImportPlanejamentoModal';
import { FeriadosModal } from '@/components/calendario/FeriadosModal';
import { AutoDistribuirModal } from '@/components/calendario/AutoDistribuirModal';
import { DecisaoStatusModal } from '@/components/calendario/DecisaoStatusModal';
import { TopicoModal } from '@/components/calendario/TopicoModal';
import { DetalhesAulaModal } from '@/components/calendario/DetalhesAulaModal';
import { useCalendarioPedagogico } from '@/hooks/calendario/useCalendarioPedagogico';
import { generateCalendarioPDF } from '@/lib/calendario/pdf-generator';
import { ScheduleGeneratorEngine } from '@/lib/engines/ScheduleGeneratorEngine';
import { ArrowLeft, Download, CalendarOff, Sparkles, RotateCcw } from 'lucide-react';

export default function CalendarioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [dataAtual, setDataAtual] = useState(new Date());

  const [gradeHoraria, setGradeHoraria] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [planejamento, setPlanejamento] = useState(null);
  const [feriados, setFeriados] = useState([]);

  // Modais de Controle
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isFeriadosOpen, setIsFeriadosOpen] = useState(false);
  const [isAutoDistribuirOpen, setIsAutoDistribuirOpen] = useState(false);
  const [isTopicoModalOpen, setIsTopicoModalOpen] = useState(false);
  const [topicoEmEdicao, setTopicoEmEdicao] = useState(null);
  const [aulaDetalhesModal, setAulaDetalhesModal] = useState(null);

  // Modal de Decisão de Status (Smart Shift vs Pular)
  const [decisaoModalData, setDecisaoModalData] = useState({
    isOpen: false,
    aula: null,
    novoStatus: null,
  });

  const {
    loading: calLoading,
    carregarGradeHoraria,
    configurarGradeHoraria,
    carregarAulasAgendadas,
    carregarPlanejamento,
    salvarPlanejamento,
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
    carregarFeriados,
  } = useCalendarioPedagogico();

  // 1. Carrega as turmas do professor logado
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }

    const fetchTurmas = async () => {
      try {
        const ref = doc(db, 'professores', user.uid, 'turmas', 'data');
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().turmas) {
          const turmasCarregadas = snap.data().turmas;
          setTurmas(turmasCarregadas);
          if (turmasCarregadas.length > 0) {
            setTurmaSelecionada(turmasCarregadas[0]);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar turmas:', err);
      }
    };

    fetchTurmas();
  }, [user, authLoading, router]);

  // 2. Quando seleciona a turma, carrega a Grade Horária e os Slots Agendados
  useEffect(() => {
    if (!turmaSelecionada) return;

    const loadData = async () => {
      try {
        const [grade, aulasAgendadas, plan, feriadosCarregados] = await Promise.all([
          carregarGradeHoraria(turmaSelecionada.id),
          carregarAulasAgendadas(turmaSelecionada.id),
          carregarPlanejamento(turmaSelecionada.id),
          carregarFeriados(turmaSelecionada.id),
        ]);

        setGradeHoraria(grade);
        setAulas(aulasAgendadas || []);
        setPlanejamento(plan);
        setFeriados(feriadosCarregados || []);

        if (!grade) {
          setIsConfigOpen(true);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do calendário:', err);
      }
    };

    loadData();
  }, [
    turmaSelecionada,
    carregarGradeHoraria,
    carregarAulasAgendadas,
    carregarPlanejamento,
    carregarFeriados,
  ]);

  const handleSaveGrade = async (gradeData) => {
    try {
      const novosSlots = await configurarGradeHoraria(turmaSelecionada.id, gradeData);
      setGradeHoraria(gradeData);
      setAulas(novosSlots);
      setIsConfigOpen(false);
    } catch (err) {
      alert('Erro ao salvar grade horária: ' + err.message);
    }
  };

  const handleDropTopico = async (aulaId, topico) => {
    try {
      await associarTopicoAula(aulaId, topico);
      const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(aulasAgendadas);
    } catch (err) {
      alert('Erro ao associar tópico: ' + err.message);
    }
  };

  const handleRemoveTopico = async (aulaId, topicoId) => {
    try {
      // Atualização otimista imediata na UI
      setAulas((prev) =>
        prev.map((a) => {
          if (a.id !== aulaId) return a;
          const novosTopicos = (a.topicosAssociados || []).filter((t) => {
            const matchId = t.id === topicoId || t.topicoId === topicoId;
            const matchOrdem =
              String(t.ordem) === String(topicoId) || String(t.topicoOrdem) === String(topicoId);
            return !matchId && !matchOrdem;
          });
          return {
            ...a,
            topicosAssociados: novosTopicos,
            topicoId: null,
            topicoOrdem: null,
            topicoTitulo: null,
          };
        })
      );

      await desassociarTopicoAula(aulaId, topicoId);
      const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(aulasAgendadas);
    } catch (err) {
      alert('Erro ao remover tópico: ' + err.message);
    }
  };

  const handleExcluirAula = async (aulaId) => {
    try {
      // Atualização otimista imediata na UI
      setAulas((prev) => prev.filter((a) => a.id !== aulaId));
      await excluirAula(aulaId);
      const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(aulasAgendadas);
    } catch (err) {
      alert('Erro ao excluir aula: ' + err.message);
    }
  };

  const handleClearPlanejamento = async () => {
    if (confirm('Tem certeza que deseja limpar todo o planejamento importado para esta turma?')) {
      try {
        await salvarPlanejamento(turmaSelecionada.id, null);
        setPlanejamento(null);
      } catch (err) {
        alert('Erro ao limpar planejamento: ' + err.message);
      }
    }
  };

  const handleUpdateStatus = async (aulaId, novoStatus, aulaObj = null) => {
    const aula = aulaObj || aulas.find((a) => a.id === aulaId);
    const temTopicos = (aula?.topicosAssociados?.length > 0) || Boolean(aula?.topicoTitulo);

    // Se tiver tópicos e for cancelada ou parcial, abre diálogo de decisão
    if (temTopicos && (novoStatus === 'NAO_REALIZADA' || novoStatus === 'PARCIAL')) {
      setDecisaoModalData({
        isOpen: true,
        aula,
        novoStatus,
      });
      return;
    }

    try {
      await atualizarStatusAula(aulaId, novoStatus);
      const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(aulasAgendadas);
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const handleConfirmarDecisaoStatus = async (decisao) => {
    const { aula, novoStatus } = decisaoModalData;
    if (!aula || !novoStatus) return;

    try {
      const aulasAtualizadas = await atualizarStatusComDecisao(
        turmaSelecionada.id,
        aula.id,
        aulas,
        novoStatus,
        decisao
      );
      if (aulasAtualizadas) {
        setAulas(aulasAtualizadas);
      }
      setDecisaoModalData({ isOpen: false, aula: null, novoStatus: null });
    } catch (err) {
      alert('Erro ao aplicar decisão de status: ' + err.message);
    }
  };

  const handleSmartShift = async (aulaId) => {
    try {
      const aulasAtualizadas = await cancelarAulaComRemanejamento(
        turmaSelecionada.id,
        aulaId,
        aulas
      );
      if (aulasAtualizadas) {
        setAulas(aulasAtualizadas);
      } else {
        const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
        setAulas(aulasAgendadas);
      }
    } catch (err) {
      alert('Erro ao executar Smart Shift: ' + err.message);
    }
  };

  // Auto-distribuição em 1 clique
  const handleConfirmarAutoDistribuir = async (options) => {
    const topicos = planejamento?.topicos || [];
    if (topicos.length === 0) {
      alert('Nenhum tópico disponível no planejamento para distribuir.');
      return;
    }

    try {
      const aulasAtualizadas = await autoDistribuirTopicos(
        turmaSelecionada.id,
        aulas,
        topicos,
        {
          ...options,
          feriados,
        }
      );
      if (aulasAtualizadas) {
        setAulas(aulasAtualizadas);
      }
      alert('Tópicos distribuídos com sucesso no calendário!');
    } catch (err) {
      alert('Erro ao auto-distribuir tópicos: ' + err.message);
    }
  };

  // Gestão de tópicos manuais (adicionar e editar)
  const handleSalvarTopico = async (dadosTopico) => {
    try {
      if (dadosTopico.id && topicoEmEdicao) {
        // Edição
        const planAtualizado = await editarTopico(
          turmaSelecionada.id,
          dadosTopico.id,
          dadosTopico,
          planejamento,
          aulas
        );
        setPlanejamento(planAtualizado);
        const recarregadas = await carregarAulasAgendadas(turmaSelecionada.id);
        setAulas(recarregadas);
      } else {
        // Adicionar novo
        const planAtualizado = await adicionarTopicoManual(
          turmaSelecionada.id,
          dadosTopico,
          planejamento
        );
        setPlanejamento(planAtualizado);
      }
      setIsTopicoModalOpen(false);
      setTopicoEmEdicao(null);
    } catch (err) {
      alert('Erro ao salvar tópico: ' + err.message);
    }
  };

  const handleExcluirTopico = async (topicoId) => {
    try {
      const planAtualizado = await excluirTopico(
        turmaSelecionada.id,
        topicoId,
        planejamento,
        aulas
      );
      setPlanejamento(planAtualizado);
      const recarregadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(recarregadas);
    } catch (err) {
      alert('Erro ao excluir tópico: ' + err.message);
    }
  };

  const handleAddFeriado = async (novoFeriado) => {
    try {
      const novosFeriados = [
        ...feriados.filter((f) => f.data !== novoFeriado.data),
        novoFeriado,
      ];
      await salvarFeriados(turmaSelecionada.id, novosFeriados);
      setFeriados(novosFeriados);

      // Aplica o feriado no calendário e executa Smart Shift nas aulas da data
      let aulasAtualizadas = ScheduleGeneratorEngine.aplicarFeriadoNoCalendario(
        aulas,
        novoFeriado.data,
        novoFeriado.nome
      );
      setAulas(aulasAtualizadas);

      // Persiste no Firestore
      const aulasComFeriado = aulas.filter((a) => a.dataAgendada === novoFeriado.data);
      for (const a of aulasComFeriado) {
        await cancelarAulaComRemanejamento(turmaSelecionada.id, a.id, aulas);
      }

      const recarregadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(recarregadas);
    } catch (err) {
      alert('Erro ao adicionar feriado: ' + err.message);
    }
  };

  const handleRemoveFeriado = async (dataFeriado) => {
    try {
      const novosFeriados = feriados.filter((f) => f.data !== dataFeriado);
      await salvarFeriados(turmaSelecionada.id, novosFeriados);
      setFeriados(novosFeriados);
    } catch (err) {
      alert('Erro ao remover feriado: ' + err.message);
    }
  };

  const handleImportarFeriadosNacionais = async () => {
    try {
      const anoAtual = dataAtual.getFullYear();
      const padroes = ScheduleGeneratorEngine.obterFeriadosNacionais(anoAtual);

      const unicos = [...feriados];
      padroes.forEach((p) => {
        if (!unicos.some((f) => f.data === p.data)) {
          unicos.push(p);
        }
      });

      await salvarFeriados(turmaSelecionada.id, unicos);
      setFeriados(unicos);

      let aulasAtualizadas = [...aulas];
      padroes.forEach((p) => {
        aulasAtualizadas = ScheduleGeneratorEngine.aplicarFeriadoNoCalendario(
          aulasAtualizadas,
          p.data,
          p.nome
        );
      });
      setAulas(aulasAtualizadas);

      const aulasComFeriado = aulas.filter((a) =>
        padroes.some((p) => p.data === a.dataAgendada)
      );
      for (const a of aulasComFeriado) {
        await cancelarAulaComRemanejamento(turmaSelecionada.id, a.id, aulas);
      }

      const recarregadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(recarregadas);
      alert(`${padroes.length} feriados nacionais importados com sucesso!`);
    } catch (err) {
      alert('Erro ao importar feriados nacionais: ' + err.message);
    }
  };

  const handleLimparTodosAgendamentos = async () => {
    if (!turmaSelecionada || aulas.length === 0) return;
    if (
      window.confirm(
        `Tem certeza que deseja desassociar todos os tópicos das aulas da turma "${turmaSelecionada.nome}"?\nOs tópicos continuarão salvos na barra lateral para você redistribuir quando quiser.`
      )
    ) {
      try {
        const aulasLimpass = aulas.map((a) => ({
          ...a,
          topicosAssociados: [],
          status: a.status === 'NAO_REALIZADA' ? 'NAO_REALIZADA' : 'AGENDADA',
        }));

        const batch = writeBatch(db);
        const aulasRef = collection(db, 'professores', user.uid, 'aulas_agendadas');

        aulasLimpass.forEach((aula) => {
          const docRef = doc(aulasRef, aula.id);
          batch.set(
            docRef,
            {
              topicosAssociados: [],
              status: aula.status,
              atualizadoEm: new Date().toISOString(),
            },
            { merge: true }
          );
        });

        await batch.commit();
        setAulas(aulasLimpass);
        alert('Todas as aulas foram desassociadas com sucesso! Você pode redistribuir agora.');
      } catch (err) {
        alert('Erro ao limpar agendamentos: ' + err.message);
      }
    }
  };

  // Tópicos ainda disponíveis (não associados a nenhuma aula)
  const topicosLivres = (planejamento?.topicos || []).filter((topico) => {
    const targetId = topico.id || topico.ordem?.toString();
    return !aulas.some(
      (a) =>
        a.topicoId === targetId ||
        (a.topicosAssociados &&
          a.topicosAssociados.some(
            (ta) => ta.id === targetId || ta.topicoId === targetId || ta.topicoOrdem === topico.ordem
          ))
    );
  });

  const temAulasComTopicos = aulas.some(
    (a) => (a.topicosAssociados && a.topicosAssociados.length > 0) || a.topicoTitulo
  );

  return (
    <div className="flex h-screen bg-[#f7f8fc] overflow-hidden">
      {/* Barra Lateral do Calendário */}
      <Sidebar
        turmas={turmas}
        turmaSelecionada={turmaSelecionada}
        onSelectTurma={setTurmaSelecionada}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAutoDistribuir={() => setIsAutoDistribuirOpen(true)}
        onOpenNovoTopico={() => {
          setTopicoEmEdicao(null);
          setIsTopicoModalOpen(true);
        }}
        onOpenEditarTopico={(topico) => {
          setTopicoEmEdicao(topico);
          setIsTopicoModalOpen(true);
        }}
        onExcluirTopico={handleExcluirTopico}
        onClearPlanejamento={handleClearPlanejamento}
        planejamento={planejamento}
        aulas={aulas}
        user={user}
      />

      {/* Área Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-[#dce0f0] flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl text-[#6070a0] hover:text-[#101942] hover:bg-[#f7f8fc] transition-colors"
              title="Voltar ao Hub"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-head font-extrabold text-[#101942] text-base leading-none">
                {turmaSelecionada ? turmaSelecionada.nome : 'Selecione uma turma'}
              </h1>
              <p className="text-xs text-[#6070a0] font-medium mt-0.5">
                {turmaSelecionada?.disciplina ? `${turmaSelecionada.disciplina} • ` : ''}
                Grade Horária e Cronograma de Aulas
              </p>
            </div>
          </div>

          {turmaSelecionada && (
            <div className="flex items-center gap-2">
              {temAulasComTopicos && (
                <button
                  onClick={handleLimparTodosAgendamentos}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                  title="Desassociar todos os tópicos das aulas para recomeçar ou redistribuir"
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline">Desassociar Aulas</span>
                </button>
              )}

              <button
                onClick={() => setIsFeriadosOpen(true)}
                className="btn-brand-secondary px-3.5 py-2 text-xs sm:text-sm flex items-center gap-1.5 shadow-xs"
                title="Gerenciar Feriados e Recessos"
              >
                <CalendarOff size={14} className="text-[#f60c49]" />
                <span className="hidden sm:inline">Feriados ({feriados.length})</span>
              </button>

              <button
                onClick={() => {
                  generateCalendarioPDF({
                    turma: turmaSelecionada,
                    grade: gradeHoraria,
                    aulas,
                    feriados,
                    professorNome: user?.displayName || user?.email,
                  });
                }}
                disabled={!aulas.length}
                className="btn-brand-secondary px-3.5 py-2 text-xs sm:text-sm flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                title="Exportar Calendário em PDF"
              >
                <Download size={14} className="text-[#f60c49]" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              <button
                onClick={() => setIsConfigOpen(true)}
                className="btn-brand-primary px-3.5 py-2 text-xs sm:text-sm flex items-center gap-1.5 shadow-sm"
              >
                ⚙ <span className="hidden sm:inline">Grade Semanal</span>
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
          {turmaSelecionada ? (
            calLoading && !aulas.length ? (
              <div className="flex h-full items-center justify-center text-[#6070a0] font-semibold text-sm">
                Carregando calendário...
              </div>
            ) : gradeHoraria || aulas.length > 0 ? (
              <CalendarioView
                aulas={aulas}
                dataAtual={dataAtual}
                setDataAtual={setDataAtual}
                feriados={feriados}
                onDropTopico={handleDropTopico}
                onRemoveTopico={handleRemoveTopico}
                onUpdateStatus={handleUpdateStatus}
                onSmartShift={handleSmartShift}
                onOpenDetalhes={(aula) => setAulaDetalhesModal(aula)}
              />
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-[#6070a0] bg-white rounded-3xl border border-dashed border-[#dce0f0] p-8 text-center">
                <p className="mb-4 font-medium text-sm">
                  Nenhuma grade horária configurada para esta turma.
                </p>
                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="btn-brand-primary px-6 py-3 text-sm font-bold shadow-md"
                >
                  Configurar Grade Agora
                </button>
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-[#6070a0] bg-white rounded-3xl border border-dashed border-[#dce0f0]">
              Selecione uma turma na barra lateral para ver o calendário.
            </div>
          )}
        </div>
      </main>

      {/* Modais */}
      {isConfigOpen && (
        <ConfigGradeModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onSave={handleSaveGrade}
          turmaSelecionada={{ id: turmaSelecionada?.id, name: turmaSelecionada?.nome }}
          initialGrade={gradeHoraria}
        />
      )}

      {isImportOpen && (
        <ImportPlanejamentoModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportSuccess={async (topicosImportados) => {
            const plan = await carregarPlanejamento(turmaSelecionada.id);
            setPlanejamento(plan || { topicos: topicosImportados });
            // Abre o modal para o professor distribuir nos slots das aulas
            setIsAutoDistribuirOpen(true);
          }}
          turmaSelecionada={{ id: turmaSelecionada?.id, name: turmaSelecionada?.nome, disciplina: turmaSelecionada?.disciplina }}
        />
      )}

      {isAutoDistribuirOpen && (
        <AutoDistribuirModal
          isOpen={isAutoDistribuirOpen}
          onClose={() => setIsAutoDistribuirOpen(false)}
          topicos={planejamento?.topicos || []}
          aulas={aulas}
          onConfirmar={handleConfirmarAutoDistribuir}
        />
      )}

      {isTopicoModalOpen && (
        <TopicoModal
          isOpen={isTopicoModalOpen}
          onClose={() => {
            setIsTopicoModalOpen(false);
            setTopicoEmEdicao(null);
          }}
          topicoEmEdicao={topicoEmEdicao}
          onSalvar={handleSalvarTopico}
          onExcluir={handleExcluirTopico}
        />
      )}

      {aulaDetalhesModal && (
        <DetalhesAulaModal
          isOpen={Boolean(aulaDetalhesModal)}
          onClose={() => setAulaDetalhesModal(null)}
          aula={aulaDetalhesModal}
          topicosDisponiveis={topicosLivres}
          onUpdateStatus={handleUpdateStatus}
          onRemoveTopico={handleRemoveTopico}
          onAddTopico={handleDropTopico}
          onExcluirAula={handleExcluirAula}
        />
      )}

      {decisaoModalData.isOpen && (
        <DecisaoStatusModal
          isOpen={decisaoModalData.isOpen}
          onClose={() => setDecisaoModalData({ isOpen: false, aula: null, novoStatus: null })}
          aula={decisaoModalData.aula}
          novoStatus={decisaoModalData.novoStatus}
          onConfirmar={handleConfirmarDecisaoStatus}
        />
      )}

      {isFeriadosOpen && (
        <FeriadosModal
          isOpen={isFeriadosOpen}
          onClose={() => setIsFeriadosOpen(false)}
          feriados={feriados}
          onAddFeriado={handleAddFeriado}
          onRemoveFeriado={handleRemoveFeriado}
          onImportarFeriadosNacionais={handleImportarFeriadosNacionais}
        />
      )}
    </div>
  );
}
