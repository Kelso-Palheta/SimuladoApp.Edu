'use client';

import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Trash2,
  Maximize2,
} from 'lucide-react';

export function CardAula({
  aula,
  onDropTopico,
  onRemoveTopico,
  onUpdateStatus,
  onSmartShift,
  onOpenDetalhes,
}) {
  const statusConfig = {
    AGENDADA: {
      label: 'Agendada',
      icon: Calendar,
      classes: 'bg-white border-[#dce0f0] text-[#101942] hover:border-blue-400',
      badge: 'bg-[#eef0f8] text-[#101942] border-[#dce0f0]',
    },
    CONCLUIDA: {
      label: 'Concluída',
      icon: CheckCircle2,
      classes: 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534] hover:border-emerald-400',
      badge: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]',
    },
    PARCIAL: {
      label: 'Parcial',
      icon: AlertCircle,
      classes: 'bg-[#fff7ed] border-[#fed7aa] text-[#9a3412] hover:border-amber-400',
      badge: 'bg-[#ffedd5] text-[#9a3412] border-[#fed7aa]',
    },
    NAO_REALIZADA: {
      label: 'Não Realizada',
      icon: XCircle,
      classes: 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b] hover:border-rose-400',
      badge: 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]',
    },
  };

  const statusAtual = statusConfig[aula.status] || statusConfig.AGENDADA;
  const StatusIcon = statusAtual.icon;

  const handleDrop = (e) => {
    e.preventDefault();
    const topicoData = e.dataTransfer.getData('application/json');
    if (topicoData && onDropTopico) {
      try {
        const topico = JSON.parse(topicoData);
        onDropTopico(aula.id, topico);
      } catch (err) {
        console.error('Erro ao fazer parse do tópico arrastado', err);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  let topicos = aula.topicosAssociados || [];
  if (topicos.length === 0 && aula.topicoTitulo) {
    topicos = [{ topicoId: aula.topicoId, topicoTitulo: aula.topicoTitulo }];
  }

  return (
    <div
      onClick={() => {
        if (onOpenDetalhes) onOpenDetalhes(aula);
      }}
      className={`p-3 border rounded-2xl shadow-2xs text-xs mb-2.5 transition-all hover:shadow-md cursor-pointer relative group ${statusAtual.classes}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-bold text-[10px] uppercase tracking-wider text-[#6070a0] flex items-center gap-1">
          <Clock size={10} className="text-[#f60c49]" />
          {aula.horarioInicio} - {aula.horarioFim}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Badge de Status Clicável */}
          <span
            className={`font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusAtual.badge}`}
          >
            <StatusIcon size={10} />
            <span>{statusAtual.label}</span>
          </span>

          <Maximize2 size={11} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Tópicos da Aula */}
      {topicos.length > 0 ? (
        <div className="space-y-1.5 mt-2">
          {topicos.map((t, idx) => {
            const titulo = t.topicoTitulo || t.titulo || `Aula ${t.topicoOrdem || t.ordem || idx + 1}`;
            const topicoId = t.topicoId || t.id || t.ordem || idx;
            return (
              <div
                key={topicoId}
                className="flex items-start justify-between bg-white/95 border border-[#dce0f0] p-2 rounded-xl group/item shadow-2xs hover:border-slate-300 transition-colors"
                onClick={(e) => e.stopPropagation()} // Permite clicar dentro sem disparar o modal global se clicar no botão
              >
                <span
                  className="font-semibold line-clamp-2 text-[#101942] flex-1 leading-snug text-xs pr-1"
                  title={titulo}
                >
                  {titulo}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Desassociar "${titulo}" desta aula?`)) {
                      onRemoveTopico(aula.id, topicoId);
                    }
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0"
                  title="Desassociar tópico desta aula"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-2 py-2 px-1 rounded-xl border border-dashed border-[#dce0f0] bg-[#f7f8fc]/60 text-center">
          <span className="text-[#9098c0] text-[11px] font-medium">
            {aula.status === 'NAO_REALIZADA' ? 'Aula Cancelada' : 'Arraste um tópico aqui ou clique para editar'}
          </span>
        </div>
      )}
    </div>
  );
}
