"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { PageTransition } from "@/components/ui/PageTransition";

const navItems = [
  { href: "/", label: "Dashboard", icon: "◈" },
  { href: "/planejamento", label: "Planejamento", icon: "▤" },
  { href: "/calendario", label: "Calendário", icon: "◷" },
  { href: "/relatorios", label: "Relatórios", icon: "▦" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-border bg-bg-soft/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="text-2xl">🎓</span>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Aula Gamificada</h1>
            <p className="text-xs text-fg-muted">Planejamento</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="relative">
                <motion.div
                  className={`flex items-center gap-3 rounded-l px-3 py-2.5 text-sm transition-colors ${
                    isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                  }`}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-l bg-accent-400/10 border-l-2 border-accent-400"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 text-base">{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-6 py-4">
          <p className="text-xs text-fg-muted">MVP1 — v0.1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
