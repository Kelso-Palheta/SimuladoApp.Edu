"use client";

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function AgenteLinguagensPage() {
  const { user, perfil, loading } = useAuth();
  const router = useRouter();

  if (loading || (!perfil && user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
      </div>
    );
  }

  if (!user) { router.replace('/'); return null; }

  if (!perfil?.modulos_permitidos?.includes('agente-linguagens')) {
    router.replace('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col"
      style={{
        background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 40%, #2563eb 100%)",
      }}>
      <div className="px-6 py-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <ArrowLeft size={16} />
          Hub
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-10 text-center space-y-5"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            <MessageSquare size={32} color="white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            Agente ENEM: Linguagens
          </h1>
          <p className="text-sm" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            Assistente especializado em questões de Linguagens do ENEM.
          </p>
          <div
            className="px-4 py-3 rounded-xl text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "var(--foreground)",
            }}
          >
            Módulo em construção. Disponível em breve.
          </div>
        </div>
      </div>
    </div>
  );
}
