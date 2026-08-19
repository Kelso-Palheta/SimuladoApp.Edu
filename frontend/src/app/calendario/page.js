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
import { useCalendarioPedagogico } from '@/hooks/calendario/useCalendarioPedagogico';

export default function CalendarioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [dataAtual, setDataAtual] = useState(new Date());
  
  const [gradeHoraria, setGradeHoraria] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [planejamento, setPlanejamento] = useState(null);
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const {
    loading: calLoading,
    carregarGradeHoraria,
    configurarGradeHoraria,
    carregarAulasAgendadas,
    carregarPlanejamento,
    salvarPlanejamento,
    associarTopicoAula,
    desassociarTopicoAula
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
        const [grade, aulasAgendadas, plan] = await Promise.all([
          carregarGradeHoraria(turmaSelecionada.id),
          carregarAulasAgendadas(turmaSelecionada.id),
          carregarPlanejamento(turmaSelecionada.id)
        ]);

        setGradeHoraria(grade);
        setAulas(aulasAgendadas);
        setPlanejamento(plan);
        
        if (!grade) {
          setIsConfigOpen(true);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };
    loadData();
  }, [turmaSelecionada, carregarGradeHoraria, carregarAulasAgendadas, carregarPlanejamento]);

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
      // Recarregar aulas
      const aulasAgendadas = await carregarAulasAgendadas(turmaSelecionada.id);
      setAulas(aulasAgendadas);
    } catch (err) {
      alert("Erro ao associar tópico: " + err.message);
    }
  };

  const handleRemoveTopico = async (aulaId, topicoId) => {
    try {
      await desassociarTopicoAula(aulaId, topicoId);
      // Recarregar aulas
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

  if (authLoading || !user) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Carregando...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
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
        <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {turmaSelecionada ? `Calendário: ${turmaSelecionada.nome}` : 'Selecione uma turma'}
            </h1>
            <p className="text-sm text-gray-500">
              Gerencie a grade horária e o planejamento anual da disciplina.
            </p>
          </div>
          
          {turmaSelecionada && (
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Configurar Grade Semanal
            </button>
          )}
        </header>

        <div className="flex-1 p-6 overflow-hidden">
          {turmaSelecionada ? (
            calLoading && !aulas.length ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                Carregando calendário...
              </div>
            ) : gradeHoraria || aulas.length > 0 ? (
              <CalendarioView 
                aulas={aulas} 
                dataAtual={dataAtual}
                setDataAtual={setDataAtual}
                onDropTopico={handleDropTopico}
                onRemoveTopico={handleRemoveTopico}
              />
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="mb-4">Nenhuma grade horária configurada para esta turma.</p>
                <button 
                  onClick={() => setIsConfigOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow-sm hover:bg-indigo-700"
                >
                  Configurar Agora
                </button>
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
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

      <ImportPlanejamentoModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        turmaSelecionada={{ id: turmaSelecionada?.id, nome: turmaSelecionada?.nome, disciplina: gradeHoraria?.disciplina }}
        onImportSuccess={(novoPlan) => setPlanejamento({ topicos: novoPlan })}
      />
    </div>
  );
}
