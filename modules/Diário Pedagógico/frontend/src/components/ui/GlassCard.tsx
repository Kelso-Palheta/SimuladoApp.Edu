"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  glow?: boolean;
  className?: string;
}

export function GlassCard({ children, glow, className = "", ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
      className={`glass p-6 lg:p-8 ${glow ? "glow-accent-subtle" : ""} ${className}`}
      whileHover={{
        y: -2,
        boxShadow: "var(--shadow-m)",
        transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
