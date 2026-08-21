'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Trash2, GraduationCap, BookOpen } from 'lucide-react';
import { useAgentChat } from '@/hooks/agentes/useAgentChat';
import PromptChips from './PromptChips';

const ICONS = {
  'ensino-medio': GraduationCap,
  'fundamental-2': BookOpen,
};

function TypingDots({ cor }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '0.625rem 0.875rem' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: cor,
            display: 'inline-block',
            animation: `agtPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg, agente }) {
  const isUser = msg.role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '0.75rem',
        animation: 'agtSlideIn 0.3s cubic-bezier(0.19,1,0.22,1) both',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: agente.cor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginRight: '0.5rem',
            alignSelf: 'flex-end',
          }}
        >
          {(() => { const Icon = ICONS[agente.id] || GraduationCap; return <Icon size={16} color="#fff" />; })()}
        </div>
      )}
      <div
        style={{
          maxWidth: '75%',
          padding: '0.75rem 1rem',
          borderRadius: isUser ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
          background: isUser
            ? 'var(--navy)'
            : 'rgba(255,255,255,0.95)',
          color: isUser ? '#ffffff' : 'var(--navy)',
          fontSize: '0.875rem',
          lineHeight: 1.65,
          boxShadow: isUser
            ? '0 4px 12px rgba(16,25,66,0.18)'
            : '0 2px 8px rgba(16,25,66,0.08)',
          border: isUser ? 'none' : '1px solid var(--border)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'var(--font-body)',
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

/**
 * Janela de chat conversacional com o Agente Pedagógico.
 */
export default function ChatWindow({ agente }) {
  const { messages, isLoading, error, sendMessage, clearHistory } = useAgentChat(agente?.id);
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Foca o input quando o agente muda
  useEffect(() => {
    inputRef.current?.focus();
  }, [agente?.id]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    await sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!agente) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        overflow: 'hidden',
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.7)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '0.75rem',
            background: agente.cor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {(() => { const Icon = ICONS[agente.id] || GraduationCap; return <Icon size={20} color="#fff" />; })()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy)', letterSpacing: '-0.01em' }}>
            {agente.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray)', fontWeight: 500 }}>
            {agente.segmento}
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            title="Limpar histórico"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '100px',
              border: '1.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--gray)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--gray)'; }}
          >
            <Trash2 size={13} />
            Limpar
          </button>
        )}
      </div>

      {/* Área de mensagens */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Estado vazio — exibe prompt chips */}
        {messages.length === 0 && !isLoading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center', padding: '2rem 1rem 1.5rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '1rem',
                background: `${agente.cor}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.875rem',
              }}>
                {(() => { const Icon = ICONS[agente.id] || GraduationCap; return <Icon size={28} color={agente.cor} />; })()}
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', marginBottom: '0.375rem' }}>
                Olá! Sou o {agente.name}.
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray)', lineHeight: 1.5 }}>
                {agente.descricao}
              </div>
            </div>
            <PromptChips agente={agente} onSelect={(chip) => { setInputText(chip); inputRef.current?.focus(); }} />
          </div>
        )}

        {/* Mensagens */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} agente={agente} />
        ))}

        {/* Indicador "digitando..." */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: agente.cor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginRight: '0.5rem', alignSelf: 'flex-end',
            }}>
              {(() => { const Icon = ICONS[agente.id] || GraduationCap; return <Icon size={16} color="#fff" />; })()}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid var(--border)',
              borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem',
              boxShadow: '0 2px 8px rgba(16,25,66,0.08)',
            }}>
              <TypingDots cor={agente.cor} />
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div style={{
            margin: '0.5rem 0',
            padding: '0.625rem 0.875rem',
            borderRadius: '0.75rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.78rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '0.875rem 1rem',
        borderTop: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.7)',
        display: 'flex',
        gap: '0.625rem',
        alignItems: 'flex-end',
      }}>
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Pergunte ao ${agente.name}…`}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: '1.5px solid var(--border)',
            borderRadius: '0.875rem',
            padding: '0.625rem 0.875rem',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-body)',
            color: 'var(--navy)',
            background: 'white',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            lineHeight: 1.5,
            maxHeight: 120,
            overflowY: 'auto',
          }}
          onFocus={(e) => { e.target.style.borderColor = agente.cor; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !inputText.trim()}
          style={{
            width: 42,
            height: 42,
            borderRadius: '0.875rem',
            background: inputText.trim() && !isLoading ? agente.cor : 'var(--border)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            boxShadow: inputText.trim() && !isLoading ? `0 4px 12px ${agente.cor}40` : 'none',
          }}
          aria-label="Enviar mensagem"
        >
          <Send size={17} color="white" />
        </button>
      </div>

      {/* Keyframes injetados */}
      <style>{`
        @keyframes agtPulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes agtSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
