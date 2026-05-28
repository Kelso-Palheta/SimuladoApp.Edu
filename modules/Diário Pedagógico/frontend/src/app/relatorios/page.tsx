"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

// ── Mock data ──
const mockStats = {
  aulasTotais: 50,
  aulasCompletas: 42,
  aulasParciais: 5,
  aulasNaoRealizadas: 3,
  taxaExecucao: 84,
  conteudosCobertos: 18,
  conteudosTotais: 22,
  engajamentoMedio: "alto" as const,
};

const engajamentos = [
  { nivel: "Alto", count: 28, color: "bg-success" },
  { nivel: "Médio", count: 15, color: "bg-warning" },
  { nivel: "Baixo", count: 7, color: "bg-danger" },
];

export default function RelatoriosPage() {
  const [selectedBimestre, setSelectedBimestre] = useState<number | null>(null);

  return (
    <Shell>
      <div className="space-y-12 px-8 py-12">
        {/* Header */}
        <AnimatedSection>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">Relatórios</p>
            <h2 className="text-[var(--step-4)] font-medium tracking-[-0.03em]">
              Acompanhe seus <span className="gradient-text">Resultados</span>
            </h2>
            <p className="max-w-prose text-fg-muted">
              Métricas de execução, cobertura de conteúdos e engajamento dos alunos.
            </p>
          </div>
        </AnimatedSection>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-5">
          {[
            { label: "Taxa Execução", value: 84, suffix: "%", color: "text-success" },
            { label: "Aulas Completas", value: 42, suffix: "", color: "text-fg" },
            { label: "Aulas Parciais", value: 5, suffix: "", color: "text-warning" },
            { label: "Não Realizadas", value: 3, suffix: "", color: "text-danger" },
            { label: "Cobertura", value: 82, suffix: "%", color: "text-fg" },
          ].map((s, i) => (
            <GlassCard key={s.label} className="!p-5 text-center">
              <div className={`text-[var(--step-3)] font-semibold tracking-[-0.02em] ${s.color}`}>
                <AnimatedCounter to={s.value} suffix={s.suffix} duration={1.5 + i * 0.3} />
              </div>
              <p className="mt-1 text-xs text-fg-muted">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Execution Bar Chart */}
          <AnimatedSection delay={0.1}>
            <GlassCard>
              <h3 className="text-[var(--step-1)] font-medium tracking-[-0.02em]">Execução por Status</h3>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Completas", value: mockStats.aulasCompletas, total: mockStats.aulasTotais, color: "bg-success" },
                  { label: "Parciais", value: mockStats.aulasParciais, total: mockStats.aulasTotais, color: "bg-warning" },
                  { label: "Não Realizadas", value: mockStats.aulasNaoRealizadas, total: mockStats.aulasTotais, color: "bg-danger" },
                ].map((bar) => (
                  <div key={bar.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-fg-muted">{bar.label}</span>
                      <span className="font-mono">{bar.value}</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-bg-soft">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(bar.value / bar.total) * 100}%` }}
                        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
                        className={`h-full rounded-full ${bar.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Engagement */}
          <AnimatedSection delay={0.15}>
            <GlassCard>
              <h3 className="text-[var(--step-1)] font-medium tracking-[-0.02em]">Engajamento Percebido</h3>
              <div className="mt-6 space-y-4">
                {engajamentos.map((e) => (
                  <div key={e.nivel} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-fg-muted">{e.nivel}</span>
                      <span className="font-mono">{e.count} aulas</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-bg-soft">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(e.count / mockStats.aulasTotais) * 100}%` }}
                        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
                        className={`h-full rounded-full ${e.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-m bg-bg-soft p-4">
                <p className="text-xs text-fg-muted">Engajamento médio</p>
                <p className="mt-1 text-lg font-semibold text-success">Alto</p>
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Content Coverage */}
          <AnimatedSection delay={0.2}>
            <GlassCard>
              <h3 className="text-[var(--step-1)] font-medium tracking-[-0.02em]">Cobertura de Conteúdos</h3>
              <div className="mt-6 flex items-center justify-center">
                <div className="relative flex h-40 w-40 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-soft)" strokeWidth="12" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none" stroke="var(--c-accent-400)" strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - mockStats.conteudosCobertos / mockStats.conteudosTotais) }}
                      transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                    />
                  </svg>
                  <div className="text-center">
                    <p className="text-[var(--step-3)] font-semibold text-accent-400">
                      {Math.round((mockStats.conteudosCobertos / mockStats.conteudosTotais) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-sm text-fg-muted">
                {mockStats.conteudosCobertos} de {mockStats.conteudosTotais} conteúdos cobertos
              </p>
            </GlassCard>
          </AnimatedSection>

          {/* Quick Observations Summary */}
          <AnimatedSection delay={0.25}>
            <GlassCard>
              <h3 className="text-[var(--step-1)] font-medium tracking-[-0.02em]">Observações Recentes</h3>
              <div className="mt-5 space-y-3">
                {[
                  { texto: "Turma engajada, atividade em grupo funcionou bem", data: "15/03" },
                  { texto: "Dificuldade com análise sintática — revisitar próximo bimestre", data: "10/03" },
                  { texto: "Faltou tempo para exercícios — ajustar cronograma", data: "05/03" },
                ].map((o, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="rounded-m bg-bg-soft p-3"
                  >
                    <p className="text-sm">{o.texto}</p>
                    <p className="mt-1 text-xs text-fg-muted">{o.data}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </div>
    </Shell>
  );
}
