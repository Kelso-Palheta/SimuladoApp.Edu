"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedSectionProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedSection({ children, delay = 0, className = "", ...props }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.19, 1, 0.22, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
