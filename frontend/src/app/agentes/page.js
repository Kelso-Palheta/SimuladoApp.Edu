'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Bot } from 'lucide-react';
import { AGENTES_CONFIG } from '@/data/agentes/agentesConfig';
import AgentCard from '@/components/agentes/AgentCard';
import ChatWindow from '@/components/agentes/ChatWindow';

export default function AgentesPage() {
  const { user, perfil, loading } = useAuth();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(null);

  const selectedAgente = AGENTES_CONFIG.find((a) => a.id === selectedId) || null;

  // Loading state
  if (loading || (!perfil && user)) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-soft)' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '1rem',
          background: 'var(--pink)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </div>
    );
  }

  if (!user) { router.replace('/'); return null; }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #101942 0%, #1a2560 45%, #0d1535 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ─── Navbar ─────────────────────────────────── */}
      <div style={{
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <ArrowLeft size={14} />
          Hub
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={18} color="rgba(255,255,255,0.7)" />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>
            Agentes Pedagógicos
          </span>
        </div>
      </div>

      {/* ─── Conteúdo Principal ─────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Painel esquerdo — seleção de agentes */}
        <div
          style={{
            width: selectedAgente ? 300 : '100%',
            maxWidth: selectedAgente ? 300 : 640,
            margin: selectedAgente ? '0' : '0 auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto',
            transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {/* Header do painel */}
          {!selectedAgente && (
            <div style={{ textAlign: 'center', padding: '2rem 0 1rem' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '1.25rem',
                background: 'rgba(246,12,73,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <Bot size={32} color="#f60c49" />
              </div>
              <h1 style={{
                fontFamily: 'var(--font-head)',
                fontWeight: 800,
                fontSize: '1.75rem',
                color: 'white',
                letterSpacing: '-0.03em',
                margin: '0 0 0.5rem',
              }}>
                Agentes Pedagógicos
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Selecione o assistente de IA para o seu segmento escolar.
              </p>
            </div>
          )}

          {/* Cards dos agentes */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            {AGENTES_CONFIG.map((agente, i) => (
              <div
                key={agente.id}
                style={{
                  animation: `agtCardIn 400ms cubic-bezier(0.19,1,0.22,1) ${i * 80}ms both`,
                }}
              >
                <AgentCard
                  agente={agente}
                  selected={selectedId}
                  onClick={(id) => setSelectedId(id === selectedId ? null : id)}
                />
              </div>
            ))}
          </div>

          {/* Badge do modelo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            marginTop: '0.5rem',
            padding: '0.5rem 0.875rem',
            borderRadius: '100px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            alignSelf: 'center',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              Powered by sabiazinho-4 · Maritalk
            </span>
          </div>
        </div>

        {/* Painel direito — chat */}
        {selectedAgente && (
          <div style={{
            flex: 1,
            padding: '1.25rem 1.5rem 1.25rem 0',
            display: 'flex',
            flexDirection: 'column',
            animation: 'agtSlideRight 0.35s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <ChatWindow agente={selectedAgente} />
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes agtCardIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes agtSlideRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
