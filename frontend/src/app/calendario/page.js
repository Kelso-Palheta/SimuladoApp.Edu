"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

import { Sidebar } from '@/components/calendario/Sidebar';
import { CalendarioView } from '@/components/calendario/CalendarioView';
import { ConfigGradeModal } from '@/components/calendario/ConfigGradeModal';
import { ImportPlanejamentoModal } from '@/components/calendario/ImportPlanejamentoModal';
import { FeriadosModal } from '@/components/calendario/FeriadosModal';
import { useCalendarioPedagogico } from '@/hooks/calendario/useCalendarioPedagogico';
import { generateCalendarioPDF } from '@/lib/calendario/pdf-generator';
import { ScheduleGeneratorEngine } from '@/lib/engines/ScheduleGeneratorEngine';
import { ArrowLeft, Download, CalendarOff } from 'lucide-react';

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
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isFeriadosOpen, setIsFeriadosOpen] = useState(false);

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
    cancelarAulaComRemanejamento,
    salvarFeriados,
    carregarFeriados
  } = useCalendarioPedagogico();

  // 1. Carrega as turmas do professor logado (aproveitando a mesma estrutura do Diário)
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
        console.error("Erro ao carregar turmas:", err);
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
          carregarFeriados(turmaSelecionada.id)
        ]);

        setGradeHoraria(grade);
        setAulas(aulasAgendadas);
        setPlanejamento(plan);
        setFeriados(feriadosCarregados || []);
        
        if (!grade) {
          setIsConfigOpen(true);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };
    loadData();
  }, [turmaSelecionada, carregarGradeHoraria, carregarAulasAgendadas, carregarPlanejamento, carregarFeriados]);

  const handleSaveGrade = async (gradeData) => {
    try {
      await configurarGradeHoraria(turmaSelecionada.id, gradeData);
      setGradeHoraria(gradeData);
      
      const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(aulasAgendadas);
      
      setIsConfigOpen(false);
      alert("Grade horária configurada e aulas geradas com sucesso!");
    } catch (err) {
      alert("Erro ao configurar grade: " + err.message);
    }
  };

  const handleDropTopico = async (aulaId, topico) => {
    try {
      await associarTopicoAula(aulaId, topico);
      const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(aulasAgendadas);
    } catch (err) {
      alert("Erro ao associar tópico: " + err.message);
    }
  };

  const handleRemoveTopico = async (aulaId, topicoId) => {
    try {
      await desassociarTopicoAula(aulaId, topicoId);
      const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(aulasAgendadas);
    } catch (err) {
      alert("Erro ao remover tópico: " + err.message);
    }
  };

  const handleClearPlanejamento = async () => {
    if (confirm("Tem certeza que deseja limpar todo o planejamento importado para esta turma?")) {
      try {
        await salvarPlanejamento(turmaSelecionada.id, null);
        setPlanejamento(null);
      } catch (err) {
        alert("Erro ao limpar planejamento: " + err.message);
      }
    }
  };

  const handleUpdateStatus = async (aulaId, novoStatus) => {
    try {
      await atualizarStatusAula(aulaId, novoStatus);
      const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(aulasAgendadas);
    } catch (err) {
      alert("Erro ao atualizar status: " + err.message);
    }
  };

  const handleSmartShift = async (aulaId) => {
    try {
      const aulasAtualizadas = await cancelarAulaComRemanejamento(turmaSelecionada.id, aulaId, aulas);
      if (aulasAtualizadas) {
        setAulas(aulasAtualizadas);
      } else {
        const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
        setAulas(aulasAgendadas);
      }
    } catch (err) {
      alert("Erro ao executar Smart Shift: " + err.message);
    }
  };

  const handleAddFeriado = async (novoFeriado) => {
    try {
      const novosFeriados = [...feriados.filter(f => f.data !== novoFeriado.data), novoFeriado];
      await salvarFeriados(turmaSelecionada.id, novosFeriados);
      setFeriados(novosFeriados);

      // Aplica o feriado no calendário e executa Smart Shift nas aulas da data
      let aulasAtualizadas = ScheduleGeneratorEngine.aplicarFeriadoNoCalendario(aulas, novoFeriado.data, novoFeriado.nome);
      setAulas(aulasAtualizadas);

      // Persiste no Firestore
      const aulasComFeriado = aulas.filter(a => a.dataAgendada === novoFeriado.data);
      for (const a of aulasComFeriado) {
        await cancelarAulaComRemanejamento(turmaSelecionada.id, a.id, aulas);
      }

      const recarregadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(recarregadas);
    } catch (err) {
      alert("Erro ao adicionar feriado: " + err.message);
    }
  };

  const handleRemoveFeriado = async (dataFeriado) => {
    try {
      const novosFeriados = feriados.filter(f => f.data !== dataFeriado);
      await salvarFeriados(turmaSelecionada.id, novosFeriados);
      setFeriados(novosFeriados);
    } catch (err) {
      alert("Erro ao remover feriado: " + err.message);
    }
  };

  const handleImportarFeriadosNacionais = async () => {
    try {
      const anoAtual = dataAtual.getFullYear();
      const padroes = ScheduleGeneratorEngine.obterFeriadosNacionais(anoAtual);
      
      const unicos = [...feriados];
      padroes.forEach(p => {
        if (!unicos.some(f => f.data === p.data)) {
          unicos.push(p);
        }
      });

      await salvarFeriados(turmaSelecionada.id, unicos);
      setFeriados(unicos);

      // Aplica feriados nas aulas existentes
      let aulasTemp = [...aulas];
      for (const p of padroes) {
        const temAula = aulasTemp.some(a => a.dataAgendada === p.data && a.status === 'AGENDADA');
        if (temAula) {
          aulasTemp = ScheduleGeneratorEngine.aplicarFeriadoNoCalendario(aulasTemp, p.data, p.nome);
          const aulaDia = aulas.find(a => a.dataAgendada === p.data);
          if (aulaDia) {
            await cancelarAulaComRemanejamento(turmaSelecionada.id, aulaDia.id, aulas);
          }
        }
      }

      const recarregadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(recarregadas);
      alert(`${padroes.length} feriados nacionais importados com sucesso!`);
    } catch (err) {
      alert("Erro ao importar feriados nacionais: " + err.message);
    }
  };

  if (authLoading || !user) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Carregando...</div>;
  }

  return (
    <div className="flex h-screen bg-[#f7f8fc] overflow-hidden font-sans selection:bg-[#f60c49] selection:text-white">
      <Sidebar 
        turmas={turmas}
        turmaSelecionada={turmaSelecionada}
        onSelectTurma={setTurmaSelecionada}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onClearPlanejamento={handleClearPlanejamento}
        planejamento={planejamento}
        aulas={aulas}
        user={user}
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="bg-white border-b border-[#dce0f0] px-6 sm:px-8 py-3.5 shrink-0 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#101942] hover:bg-[#090f28] text-white shadow-xs transition-all"
            >
              <ArrowLeft size={14} />
              <span>Hub</span>
            </button>
            <div>
              <h1 className="font-head text-lg sm:text-xl font-extrabold text-[#101942]">
                {turmaSelecionada ? `Calendário: ${turmaSelecionada.nome}` : 'Selecione uma turma'}
              </h1>
              <p className="text-xs text-[#6070a0]">
                Grade horária e remanejamento automático de aulas
              </p>
            </div>
          </div>
          
          {turmaSelecionada && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFeriadosOpen(true)}
                className="btn-brand-ghost px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5"
                title="Gerenciar feriados e recessos escolares"
              >
                <CalendarOff size={14} className="text-[#f60c49]" />
                <span className="hidden sm:inline">Feriados</span>
              </button>
              <button
                onClick={() => generateCalendarioPDF(aulas, turmaSelecionada.nome, user?.email)}
                disabled={aulas.length === 0}
                className="btn-brand-ghost px-3 py-2 text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-40"
                title="Exportar cronograma de aulas em PDF"
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
              />
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-[#6070a0] bg-white rounded-3xl border border-dashed border-[#dce0f0] p-8 text-center">
                <p className="mb-4 font-medium text-sm">Nenhuma grade horária configurada para esta turma.</p>
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
          onImportSuccess={async () => {
            const plan = await carregarPlanejamento(turmaSelecionada.id);
            setPlanejamento(plan);
          }}
          turmaSelecionada={{ id: turmaSelecionada?.id, name: turmaSelecionada?.nome }}
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
