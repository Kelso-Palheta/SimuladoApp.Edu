"use client";

import { motion } from "framer-motion";

type Status = "pendente" | "completa" | "parcial" | "nao_realizada" | "ativo" | "carga_desalinhada";

const statusConfig: Record<Status, { label: string; emoji: string; color: string; glow: string }> = {
  pendente: { label: "Pendente", emoji: "○", color: "text-fg-muted", glow: "" },
  completa: { label: "Completa", emoji: "✓", color: "text-success", glow: "shadow-[0_0_8px_-2px_var(--c-success)]" },
  parcial: { label: "Parcial", emoji: "◐", color: "text-warning", glow: "shadow-[0_0_8px_-2px_var(--c-warning)]" },
  nao_realizada: { label: "Não realizada", emoji: "✗", color: "text-danger", glow: "shadow-[0_0_8px_-2px_var(--c-danger)]" },
  ativo: { label: "Ativo", emoji: "●", color: "text-success", glow: "shadow-[0_0_8px_-2px_var(--c-success)]" },
  carga_desalinhada: { label: "Carga Desalinhada", emoji: "⚠", color: "text-warning", glow: "shadow-[0_0_8px_-2px_var(--c-warning)]" },
};

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? statusConfig.pendente;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-xs ${cfg.color} ${cfg.glow}`}
    >
      <motion.span
        animate={status === "ativo" ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {cfg.emoji}
      </motion.span>
      {cfg.label}
    </motion.span>
  );
}
