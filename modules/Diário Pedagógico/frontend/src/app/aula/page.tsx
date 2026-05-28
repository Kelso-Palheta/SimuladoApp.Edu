"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { StatusBadge } from "@/components/ui/StatusBadge";

// ── Mock data ──
const aulaMock = {
  id: "a1",
  titulo: "Classes Gramaticais — Revisão",
  objetivo: "Revisar as 10 classes gramaticais com foco em substantivo, verbo e adjetivo",
  data: "2026-03-15",
  duracao: 50,
  status: "pendente" as const,
  disciplina: "Língua Portuguesa",
  serie: "3º Ano EM",
  conteudo: "Gramática normativa aplicada à interpretação textual",
  observacoes: [
    { id: "o1", texto: "Turma engajada, atividade em grupo funcionou bem", engajamento: "alto", data: "2026-03-08" },
  ],
};

type ConfirmStatus = "pendente" | "completa" | "parcial" | "nao_realizada";

export default function AulaDetalhePage() {
  const [status, setStatus] = useState<ConfirmStatus>(aulaMock.status);
  const [showConfirm, setShowConfirm] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [engajamento, setEngajamento] = useState("medio");
  const [saved, setSaved] = useState(false);

  function handleConfirm(s: ConfirmStatus) {
    setStatus(s);
    setShowConfirm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Shell>
      <div className="space-y-10 px-8 py-12">
        {/* Header */}
        <AnimatedSection>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-muted">
                Detalhe da Aula · {aulaMock.data}
              </p>
              <h2 className="text-[var(--step-4)] font-medium tracking-[-0.03em]">
                {aulaMock.titulo}
              </h2>
              <div className="flex items-center gap-4 text-sm text-fg-muted">
                <span>{aulaMock.disciplina}</span>
                <span>·</span>
                <span>{aulaMock.serie}</span>
                <span>·</span>
                <span>{aulaMock.duracao}min</span>
                <span>·</span>
                <StatusBadge status={status} />
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-success text-xs"
                  >
                    ✓ Salvo
                  </motion.span>
                )}
              </div>
            </div>
            <MagneticButton onClick={() => setShowConfirm(true)}>
              {status === "pendente" ? "✓ Confirmar Aula" : "Atualizar Status"}
            </MagneticButton>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-3 gap-8">
          {/* Main content */}
          <div className="col-span-2 space-y-8">
            {/* Objetivo + Conteúdo */}
            <AnimatedSection delay={0.1}>
              <GlassCard>
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Conteúdo Programático</h3>
                <p className="mt-3 text-sm leading-relaxed">{aulaMock.objetivo}</p>
                <div className="mt-4 rounded-m bg-bg-soft p-4">
                  <p className="text-xs text-fg-muted">Ementa</p>
                  <p className="mt-1 text-sm">{aulaMock.conteudo}</p>
                </div>
              </GlassCard>
            </AnimatedSection>

            {/* Sequência Didática (placeholder link) */}
            <AnimatedSection delay={0.15}>
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Sequência Didática</h3>
                    <p className="mt-1 text-sm text-fg-muted">Plano detalhado da aula com etapas, recursos e avaliação</p>
                  </div>
                  <MagneticButton variant="secondary">
                    ▦ Ver Sequência
                  </MagneticButton>
                </div>
              </GlassCard>
            </AnimatedSection>

            {/* Observações */}
            <AnimatedSection delay={0.2}>
              <GlassCard>
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-400">Observações</h3>
                <div className="mt-4 space-y-3">
                  {aulaMock.observacoes.map((obs) => (
                    <div key={obs.id} className="rounded-m bg-bg-soft p-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${
                          obs.engajamento === "alto" ? "text-success" : obs.engajamento === "baixo" ? "text-danger" : "text-warning"
                        }`}>
                          Engajamento: {obs.engajamento}
                        </span>
                        <span className="text-xs text-fg-muted">{obs.data}</span>
                      </div>
                      <p className="mt-2 text-sm">{obs.texto}</p>
                    </div>
                  ))}
                </div>

                {/* Nova observação */}
                <div className="mt-5 space-y-4 border-t border-border pt-5">
                  <textarea
                    className="w-full rounded-m border border-border bg-bg-soft px-3.5 py-3 text-sm outline-none transition-colors focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20"
                    rows={3}
                    placeholder="Registre observações sobre esta aula..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                  <div className="flex items-center gap-3">
                    <select
                      className="rounded-m border border-border bg-bg-soft px-3 py-2 text-xs outline-none"
                      value={engajamento}
                      onChange={(e) => setEngajamento(e.target.value)}
                    >
                      <option value="baixo">Baixo engajamento</option>
                      <option value="medio">Médio engajamento</option>
                      <option value="alto">Alto engajamento</option>
                    </select>
                    <MagneticButton variant="secondary" onClick={() => {}}>
                      Salvar Observação
                    </MagneticButton>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>
          </div>

          {/* Sidebar — Status */}
          <div className="space-y-6">
            <AnimatedSection delay={0.1}>
              <GlassCard>
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-fg-muted">Status da Aula</h3>
                <div className="mt-4 space-y-2">
                  {(["pendente", "completa", "parcial", "nao_realizada"] as ConfirmStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleConfirm(s)}
                      className={`w-full rounded-m border px-4 py-3 text-left text-sm transition-all ${
                        status === s
                          ? "border-accent-400 bg-accent-400/10 text-fg"
                          : "border-border text-fg-muted hover:border-accent-400/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {s === "completa" ? "✅" : s === "parcial" ? "⚠️" : s === "nao_realizada" ? "❌" : "○"}
                        </span>
                        <span>
                          {s === "completa" ? "Completa" : s === "parcial" ? "Parcial" : s === "nao_realizada" ? "Não Realizada" : "Pendente"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </AnimatedSection>

            {/* Reagendamento trigger */}
            {status === "nao_realizada" && (
              <AnimatedSection delay={0.2}>
                <GlassCard glow>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-warning">Reagendar</h3>
                  <p className="mt-2 text-sm text-fg-muted">
                    Conteúdo não coberto. Reagende para uma data futura automaticamente.
                  </p>
                  <div className="mt-4">
                    <MagneticButton variant="secondary">
                      Propor Reagendamento
                    </MagneticButton>
                  </div>
                </GlassCard>
              </AnimatedSection>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="glass-xl mx-4 max-w-sm p-8 text-center shadow-l"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-[var(--step-2)] font-medium">Confirmar Aula</h3>
                <p className="mt-2 text-sm text-fg-muted">Como foi a execução desta aula?</p>
                <div className="mt-6 flex justify-center gap-4">
                  {[
                    { s: "completa" as ConfirmStatus, emoji: "✅", label: "Completa" },
                    { s: "parcial" as ConfirmStatus, emoji: "⚠️", label: "Parcial" },
                    { s: "nao_realizada" as ConfirmStatus, emoji: "❌", label: "Não realizada" },
                  ].map(({ s, emoji, label }) => (
                    <motion.button
                      key={s}
                      whileHover={{ scale: 1.15, y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleConfirm(s)}
                      className="flex flex-col items-center gap-2 rounded-xl bg-bg-soft p-4 transition-colors hover:bg-bg-card"
                    >
                      <span className="text-3xl">{emoji}</span>
                      <span className="text-xs font-medium">{label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Shell>
  );
}
