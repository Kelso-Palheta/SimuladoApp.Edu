"use client";

import { Shell } from "@/components/layout/Shell";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { motion } from "framer-motion";

const stats = [
  { label: "Planejamentos Ativos", value: 3, suffix: "", color: "text-accent-400" },
  { label: "Aulas Planejadas", value: 142, suffix: "", color: "text-fg" },
  { label: "Taxa de Execução", value: 84, suffix: "%", color: "text-success" },
  { label: "Horas Planejadas", value: 118, suffix: "h", color: "text-fg" },
];

const recentActions = [
  { action: "Planejamento anual gerado", detail: "Português — 3º EM", time: "2h atrás" },
  { action: "Sequência didática criada", detail: "Gramática — Aula 12", time: "5h atrás" },
  { action: "Aula confirmada ✓", detail: "Literatura — 08/03", time: "1d atrás" },
  { action: "Calendário sincronizado", detail: "Google Calendar", time: "2d atrás" },
];

export default function Dashboard() {
  return (
    <Shell>
      <div className="space-y-12 px-8 py-12">
        {/* Header */}
        <AnimatedSection>
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">
                Dashboard
              </p>
              <h2 className="text-[var(--step-4)] font-medium tracking-[-0.03em]">
                Bom dia, <span className="gradient-text">Professor</span>
              </h2>
              <p className="max-w-prose text-fg-muted">
                Gerencie seus planejamentos, acompanhe a execução das aulas e sincronize com seu calendário.
              </p>
            </div>
            <MagneticButton onClick={() => (window.location.href = "/planejamento/novo")}>
              + Novo Planejamento
            </MagneticButton>
          </div>
        </AnimatedSection>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <GlassCard key={s.label} className="!p-5" glow={s.color === "text-accent-400"}>
              <p className="text-xs uppercase tracking-[0.1em] text-fg-muted">{s.label}</p>
              <p className={`mt-2 text-[var(--step-3)] font-semibold tracking-[-0.02em] ${s.color}`}>
                <AnimatedCounter to={s.value} suffix={s.suffix} />
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Recent Activity + Quick Actions */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Activity */}
          <AnimatedSection className="col-span-2" delay={0.1}>
            <GlassCard>
              <h3 className="text-[var(--step-1)] font-medium tracking-[-0.02em]">Atividade Recente</h3>
              <div className="mt-5 divide-y divide-border">
                {recentActions.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-fg-muted">{item.detail}</p>
                    </div>
                    <span className="text-xs text-fg-muted">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Quick Actions */}
          <AnimatedSection delay={0.15}>
            <GlassCard className="flex h-full flex-col justify-between">
              <div>
                <h3 className="text-[var(--step-1)] font-medium tracking-[-0.02em]">Ações Rápidas</h3>
                <div className="mt-5 flex flex-col gap-2">
                  {[
                    { label: "Gerar Sequência", icon: "▦", href: "/planejamento" },
                    { label: "Sincronizar Calendário", icon: "◷", href: "/calendario" },
                    { label: "Ver Relatórios", icon: "▤", href: "/relatorios" },
                  ].map((a) => (
                    <motion.a
                      key={a.label}
                      href={a.href}
                      whileHover={{ x: 4, backgroundColor: "var(--bg-card)" }}
                      className="flex items-center gap-3 rounded-m px-3 py-2.5 text-sm transition-colors"
                    >
                      <span className="text-lg">{a.icon}</span>
                      {a.label}
                    </motion.a>
                  ))}
                </div>
              </div>
              <div className="mt-6 rounded-l bg-accent-400/5 p-4 border border-accent-400/10">
                <p className="text-xs text-fg-muted">Dica: comece gerando um planejamento anual e depois sincronize com seu Google Calendar.</p>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </div>
    </Shell>
  );
}
