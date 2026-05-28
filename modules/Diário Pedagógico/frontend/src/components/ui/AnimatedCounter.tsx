"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ from = 0, to, duration = 1.8, suffix = "", className = "" }: AnimatedCounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString("pt-BR"));

  useEffect(() => {
    const ctrl = animate(count, to, {
      duration,
      ease: [0.165, 0.84, 0.44, 1],
    });
    return () => ctrl.stop();
  }, [to]);

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
