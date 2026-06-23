"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PLATFORM_MODULES } from "@/config/modules";
import {
  BookOpen,
  PenTool,
  MessageSquare,
  ClipboardList,
  Lock,
  LogOut,
  GraduationCap,
  X,
  User,
} from "lucide-react";
import { ProfileModal } from "@/components/diario/ProfileModal";

const ICON_MAP = {
  BookOpen,
  PenTool,
  MessageSquare,
  ClipboardList,
};

function Toast({ message, onClose }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce"
      style={{ animationDuration: "0.4s" }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium shadow-lg"
        style={{
          background: "var(--foreground)",
          color: "var(--background)",
        }}
      >
        <Lock size={16} />
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, perfil, logout } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const permitidos = perfil?.modulos_permitidos || [];

  const handleCardClick = (mod) => {
    if (permitidos.includes(mod.id)) {
      router.push(mod.path);
    } else {
      setToast(
        "Você não tem acesso a este módulo. Entre em contato com a coordenação."
      );
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8 flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, var(--primary) 0%, #7c3aed 40%, #2563eb 100%)",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <GraduationCap size={22} color="white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "white" }}>
              SimuladoApp.Edu
            </h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
              {perfil?.nome || "Professor"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <User size={16} />
            Perfil
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* Grid de Cards */}
      <main className="flex-1 max-w-5xl mx-auto w-full">
        <h2
          className="text-sm font-semibold mb-4 uppercase tracking-wider"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Módulos disponíveis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORM_MODULES.map((mod) => {
            const temAcesso = permitidos.includes(mod.id);
            const Icon = ICON_MAP[mod.icon] || BookOpen;

            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleCardClick(mod)}
                className="glass-panel p-6 text-left space-y-3 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] relative group"
                style={{
                  opacity: temAcesso ? 1 : 0.45,
                  cursor: temAcesso ? "pointer" : "not-allowed",
                  ...(temAcesso && {
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                  }),
                }}
              >
                {/* Lock badge */}
                {!temAcesso && (
                  <div className="absolute top-3 right-3">
                    <Lock size={16} style={{ color: "var(--foreground)" }} />
                  </div>
                )}

                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: temAcesso
                      ? "var(--primary)"
                      : "rgba(128,128,128,0.2)",
                  }}
                >
                  <Icon
                    size={22}
                    style={{
                      color: temAcesso
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                    }}
                  />
                </div>

                {/* Text */}
                <div>
                  <h3
                    className="font-semibold text-base"
                    style={{ color: "var(--foreground)" }}
                  >
                    {mod.nome}
                  </h3>
                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{ color: "var(--foreground)", opacity: 0.55 }}
                  >
                    {mod.descricao}
                  </p>
                </div>

                {/* Hover indicator for allowed cards */}
                {temAcesso && (
                  <div
                    className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--primary)" }}
                  >
                    Acessar →
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}

      {showProfile && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
