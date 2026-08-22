'use client';

import { BarChart3, Users, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function AnalyticsHeader({
  turmas = [],
  turmaSelecionadaId,
  onSelectTurma,
  bimestreSelecionado,
  onSelectBimestre,
}) {
  return (
    <div className="bg-[#101942] text-white p-6 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
      {/* Background Glow Efeitos */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#f60c49]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors border border-white/10"
            >
              <ArrowLeft size={14} />
              Voltar ao Hub
            </Link>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#f60c49] bg-[#f60c49]/10 px-2.5 py-0.5 rounded-full border border-[#f60c49]/20">
              Módulo Analítico
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart3 size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-[family-name:var(--font-manrope)]">
                Dashboard Analytics Pedagógico
              </h1>
              <p className="text-sm text-slate-300 font-medium">
                Métricas, taxas de aprovação e diagnósticos de rendimento escolar
              </p>
            </div>
          </div>
        </div>

        {/* Filtros de Turma e Bimestre */}
        <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
          {/* Seletor de Turma */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10">
            <Users size={16} className="text-blue-400" />
            <select
              value={turmaSelecionadaId || 'todas'}
              onChange={(e) => onSelectTurma(e.target.value === 'todas' ? null : e.target.value)}
              className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer pr-2"
            >
              <option value="todas" className="bg-[#101942] text-white">
                Todas as Turmas ({turmas.length})
              </option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#101942] text-white">
                  {t.nome} {t.disciplina ? `(${t.disciplina})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Bimestre */}
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
            <div className="px-2 text-slate-300">
              <Calendar size={14} />
            </div>
            {['1', '2', '3', '4'].map((b) => (
              <button
                key={b}
                onClick={() => onSelectBimestre(b)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  bimestreSelecionado === b
                    ? 'bg-[#f60c49] text-white shadow-md shadow-[#f60c49]/30 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {b}º Bim
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
