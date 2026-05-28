"use client";

import { motion } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";
import { useRef, useState } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}

export function MagneticButton({
  children,
  className = "",
  onClick,
  variant = "primary",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const variants = {
    primary:
      "bg-accent-400 text-white shadow-glow",
    secondary:
      "bg-bg-card text-fg border border-border",
    ghost:
      "text-fg-muted hover:text-fg",
  };

  function handleMouseMove(e: MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.3, y: y * 0.3 });
  }

  function handleMouseLeave() {
    setPos({ x: 0, y: 0 });
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={disabled ? undefined : handleMouseMove}
      onMouseLeave={disabled ? undefined : handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      animate={disabled ? { x: 0, y: 0 } : { x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center gap-2 rounded-l px-6 py-3 text-sm font-medium transition-colors duration-200 ${
        disabled ? "opacity-50 cursor-not-allowed" : variants[variant]
      } ${className}`}
    >
      <motion.span
        animate={disabled ? { x: 0, y: 0 } : { x: pos.x * 0.5, y: pos.y * 0.5 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
