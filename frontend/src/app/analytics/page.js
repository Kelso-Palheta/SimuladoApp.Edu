'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  GraduationCap,
  TrendingUp,
  Award,
  AlertTriangle,
  Users,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  calcularMetricasTurma,
  calcularMetricasGlobais,
  calcularEvolucaoBimestral,
  calcularDistribuicaoNotas,
  obterAlunosEmRisco,
} from '@/utils/analytics/metricas';
import { MetricCard } from '@/components/analytics/MetricCard';
import { EvolucaoChart } from '@/components/analytics/EvolucaoChart';
import { DistribuicaoChart } from '@/components/analytics/DistribuicaoChart';
import { ComparativoTurmasChart } from '@/components/analytics/ComparativoTurmasChart';
import { AlunosRiscoTable } from '@/components/analytics/AlunosRiscoTable';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { generateAnalyticsPDF } from '@/lib/analytics/pdf-generator';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'diario_turmas';

export default function AnalyticsPage() {
  const { user, perfil, loading } = useAuth();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const [turmas, setTurmas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState(null); // null = todas
  const [bimestreSelecionado, setBimestreSelecionado] = useState('1');
  const [exportingPDF, setExportingPDF] = useState(false);

  // Carrega turmas do LocalStorage e Firestore
  useEffect(() => {
    let mounted = true;

    const carregarTurmas = async () => {
      let turmasLocais = [];
      if (typeof window !== 'undefined') {
        try {
          const raw = sessionStorage.getItem(STORAGE_KEY);
          if (raw) turmasLocais = JSON.parse(raw);
        } catch {}
      }

      if (mounted && turmasLocais.length > 0) {
        setTurmas(turmasLocais);
        setLoadingData(false);
      }

      if (user && db) {
        try {
          const ref = doc(db, 'diario_turmas', user.uid);
          const snap = await getDoc(ref);
          if (snap.exists() && mounted) {
            const data = snap.data();
            if (Array.isArray(data.turmas) && data.turmas.length > 0) {
              setTurmas(data.turmas);
            }
          }
        } catch (e) {
          console.warn('[Analytics] Erro ao sincronizar do Firestore:', e);
        } finally {
          if (mounted) setLoadingData(false);
        }
      } else {
        if (mounted) setLoadingData(false);
      }
    };

    carregarTurmas();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Turma ativa (ou null para consolidado)
  const turmaAtiva = useMemo(() => {
    if (!turmaSelecionadaId) return null;
    return turmas.find((t) => t.id === turmaSelecionadaId) || null;
  }, [turmas, turmaSelecionadaId]);

  // Cálculos de métricas derivados
  const metricas = useMemo(() => {
    if (turmaAtiva) {
      const mt = calcularMetricasTurma(turmaAtiva, bimestreSelecionado);
      return {
        totalTurmas: 1,
        totalAlunos: mt.totalAlunos,
        totalAvaliados: mt.totalAvaliados,
        mediaGeral: mt.mediaTurma,
        taxaAprovacao: mt.taxaAprovacao,
        taxaRisco: mt.taxaRisco,
        turmasMetricas: [mt],
      };
    }
    return calcularMetricasGlobais(turmas, bimestreSelecionado);
  }, [turmas, turmaAtiva, bimestreSelecionado]);

  // Evolução bimestral
  const evolucaoData = useMemo(() => {
    return calcularEvolucaoBimestral(turmaAtiva || turmas);
  }, [turmas, turmaAtiva]);

  // Distribuição de notas
  const distribuicaoData = useMemo(() => {
    return calcularDistribuicaoNotas(turmaAtiva || turmas, bimestreSelecionado);
  }, [turmas, turmaAtiva, bimestreSelecionado]);

  // Alunos em risco
  const alunosEmRisco = useMemo(() => {
    return obterAlunosEmRisco(turmaAtiva ? [turmaAtiva] : turmas, bimestreSelecionado);
  }, [turmas, turmaAtiva, bimestreSelecionado]);

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      showToast('Gerando Relatório Executivo em PDF...', 'info');

      const turmaNome = turmaSelecionadaId
        ? turmas.find((t) => t.id === turmaSelecionadaId)?.nome || 'Turma Selecionada'
        : 'Todas as Turmas';

      await generateAnalyticsPDF({
        turmas: turmaAtiva ? [turmaAtiva] : turmas,
        metricas: {
          totalAlunos: metricas.totalAlunos,
          mediaGeral: metricas.mediaGeral || 0,
          taxaAprovacao: metricas.taxaAprovacao || 0,
          taxaRecuperacao: metricas.taxaRisco || 0,
        },
        alunosEmRisco,
        turmaSelecionadaNome: turmaNome,
        bimestre: bimestreSelecionado,
        professorNome: perfil?.nome || user?.displayName || user?.email?.split('@')[0] || 'Professor(a)',
      });

      showToast('Relatório baixado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao gerar PDF do Analytics:', err);
      showToast('Erro ao gerar relatório: ' + err.message, 'error');
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#101942] to-[#2563eb] animate-pulse shadow-lg" />
          <p className="text-sm font-semibold text-slate-500">Carregando painel analítico...</p>
        </div>
      </div>
    );
  }

  const temTurmas = turmas.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative">
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Cabeçalho e Filtros */}
        <AnalyticsHeader
          turmas={turmas}
          turmaSelecionadaId={turmaSelecionadaId}
          onSelectTurma={setTurmaSelecionadaId}
          bimestreSelecionado={bimestreSelecionado}
          onSelectBimestre={setBimestreSelecionado}
          onExportPDF={handleExportPDF}
          exportingPDF={exportingPDF}
        />

        {!temTurmas ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto space-y-4 my-12">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <BookOpen size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#101942]">Nenhuma turma cadastrada</h3>
            <p className="text-xs text-slate-500">
              Cadastre suas turmas e lance as notas no Diário Pedagógico para visualizar relatórios e gráficos analíticos completos.
            </p>
            <Link
              href="/diario"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101942] text-white text-xs font-bold shadow-md hover:bg-[#101942]/90 transition-colors"
            >
              Ir para o Diário Pedagógico
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            {/* Grid de KPIs Superiores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Média Geral"
                value={
                  metricas.mediaGeral !== null
                    ? `${metricas.mediaGeral.toFixed(2).replace('.', ',')}`
                    : '—'
                }
                subtitle={
                  metricas.mediaGeral !== null
                    ? metricas.mediaGeral >= 6.0
                      ? 'Desempenho acima da média'
                      : 'Rendimento requer atenção'
                    : 'Sem notas lançadas'
                }
                icon={GraduationCap}
                color={
                  metricas.mediaGeral === null
                    ? 'blue'
                    : metricas.mediaGeral >= 7.0
                    ? 'emerald'
                    : metricas.mediaGeral >= 5.0
                    ? 'blue'
                    : 'rose'
                }
                delay={0.05}
              />

              <MetricCard
                title="Taxa de Aprovação"
                value={`${metricas.taxaAprovacao}%`}
                subtitle={`${metricas.totalAvaliados} avaliados no ${bimestreSelecionado}º Bim`}
                icon={Award}
                color="emerald"
                delay={0.1}
              />

              <MetricCard
                title="Alunos em Alerta"
                value={alunosEmRisco.length}
                subtitle={`${metricas.taxaRisco}% em risco/recuperação`}
                icon={AlertTriangle}
                color={alunosEmRisco.length > 0 ? 'rose' : 'emerald'}
                delay={0.15}
              />

              <MetricCard
                title="Total de Estudantes"
                value={metricas.totalAlunos}
                subtitle={
                  turmaAtiva
                    ? `Turma: ${turmaAtiva.nome}`
                    : `${turmas.length} turmas cadastradas`
                }
                icon={Users}
                color="purple"
                delay={0.2}
              />
            </div>

            {/* Grid de Gráficos Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico 1: Evolução Histórica nos 4 Bimestres */}
              <EvolucaoChart
                data={evolucaoData}
                titulo={
                  turmaAtiva
                    ? `Evolução — ${turmaAtiva.nome}`
                    : 'Evolução Global (Todas as Turmas)'
                }
              />

              {/* Gráfico 2: Distribuição por Faixas de Nota */}
              <DistribuicaoChart distribuicao={distribuicaoData} />
            </div>

            {/* Gráfico 3: Comparativo entre Turmas (quando visão consolidada) */}
            {!turmaAtiva && turmas.length > 1 && (
              <ComparativoTurmasChart turmasMetricas={metricas.turmasMetricas} />
            )}

            {/* Radar de Alunos em Situação de Risco */}
            <AlunosRiscoTable alunos={alunosEmRisco} />
          </>
        )}
      </main>
    </div>
  );
}
