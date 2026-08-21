import React, { useState, useRef, useEffect } from 'react';
import { X, Clock, CheckCircle2, AlertCircle, XCircle, Calendar, MoreVertical, FastForward } from 'lucide-react';

export function CardAula({ aula, onDropTopico, onRemoveTopico, onUpdateStatus, onSmartShift }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowStatusMenu(false);
      }
    }
    if (showStatusMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusMenu]);

  // Configuração visual de cada status
  const statusConfig = {
    'AGENDADA': {
      label: 'Agendada',
      icon: Calendar,
      classes: 'bg-white border-[#dce0f0] text-[#101942] hover:border-[#f60c49]/40',
      badge: 'bg-[#eef0f8] text-[#101942] border-[#dce0f0]'
    },
    'CONCLUIDA': {
      label: 'Concluída',
      icon: CheckCircle2,
      classes: 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]',
      badge: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]'
    },
    'PARCIAL': {
      label: 'Parcial',
      icon: AlertCircle,
      classes: 'bg-[#fff7ed] border-[#fed7aa] text-[#9a3412]',
      badge: 'bg-[#ffedd5] text-[#9a3412] border-[#fed7aa]'
    },
    'NAO_REALIZADA': {
      label: 'Não Realizada',
      icon: XCircle,
      classes: 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]',
      badge: 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]'
    }
  };

  const statusAtual = statusConfig[aula.status] || statusConfig['AGENDADA'];
  const StatusIcon = statusAtual.icon;

  const handleDrop = (e) => {
    e.preventDefault();
    const topicoData = e.dataTransfer.getData('application/json');
    if (topicoData && onDropTopico) {
      try {
        const topico = JSON.parse(topicoData);
        onDropTopico(aula.id, topico);
      } catch (err) {
        console.error("Erro ao fazer parse do tópico arrastado", err);
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

  const handleSelectStatus = (novoStatus) => {
    setShowStatusMenu(false);
    if (novoStatus === 'NAO_REALIZADA' && topicos.length > 0 && onSmartShift) {
      if (window.confirm("Deseja cancelar esta aula e empurrar automaticamente seus tópicos para a próxima aula vaga (Smart Shift)?")) {
        onSmartShift(aula.id);
        return;
      }
    }
    if (onUpdateStatus) {
      onUpdateStatus(aula.id, novoStatus);
    }
  };

  return (
    <div 
      className={`p-2.5 border rounded-2xl shadow-2xs text-xs mb-2 transition-all hover:shadow-md relative ${statusAtual.classes}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-bold text-[10px] uppercase tracking-wider text-[#6070a0] flex items-center gap-1">
          <Clock size={10} className="text-[#f60c49]" />
          {aula.horarioInicio} - {aula.horarioFim}
        </span>
        
        <div className="flex items-center gap-1">
          {/* Badge de Status Clicável */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 transition-transform active:scale-95 ${statusAtual.badge}`}
              title="Alterar status da aula"
            >
              <StatusIcon size={9} />
              <span>{statusAtual.label}</span>
            </button>

            {/* Menu Popover de Status */}
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-[#dce0f0] py-1 z-50 text-left">
                <div className="px-3 py-1 text-[10px] font-bold text-[#6070a0] uppercase border-b border-[#dce0f0]">
                  Status da Aula
                </div>
                <button
                  onClick={() => handleSelectStatus('CONCLUIDA')}
                  className="w-full px-3 py-1.5 text-xs text-[#166534] hover:bg-[#f0fdf4] font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 size={13} className="text-[#166534]" /> Concluída
                </button>
                <button
                  onClick={() => handleSelectStatus('PARCIAL')}
                  className="w-full px-3 py-1.5 text-xs text-[#9a3412] hover:bg-[#fff7ed] font-semibold flex items-center gap-2"
                >
                  <AlertCircle size={13} className="text-[#9a3412]" /> Parcial
                </button>
                <button
                  onClick={() => handleSelectStatus('AGENDADA')}
                  className="w-full px-3 py-1.5 text-xs text-[#101942] hover:bg-[#f7f8fc] font-semibold flex items-center gap-2"
                >
                  <Calendar size={13} className="text-[#101942]" /> Agendada
                </button>
                <div className="border-t border-[#dce0f0]" />
                <button
                  onClick={() => handleSelectStatus('NAO_REALIZADA')}
                  className="w-full px-3 py-1.5 text-xs text-[#991b1b] hover:bg-[#fef2f2] font-semibold flex items-center gap-2"
                >
                  <FastForward size={13} className="text-[#991b1b]" /> Cancelar + Shift
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tópicos da Aula */}
      {topicos.length > 0 ? (
        <div className="space-y-1.5 mt-2">
          {topicos.map(t => (
            <div key={t.topicoId} className="flex items-start justify-between bg-white/80 border border-[#dce0f0] p-2 rounded-xl group shadow-2xs">
              <span className="font-semibold line-clamp-2 text-[#101942] flex-1 leading-snug text-xs" title={t.topicoTitulo}>
                {t.topicoTitulo}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTopico(aula.id, t.topicoId);
                }}
                className="opacity-0 group-hover:opacity-100 text-[#d40840] hover:bg-[#fff2f6] rounded-lg ml-1 p-1 transition-all"
                title="Remover Tópico"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 py-2 px-1 rounded-xl border border-dashed border-[#dce0f0] bg-[#f7f8fc]/60 text-center">
          <span className="text-[#9098c0] text-[11px] font-medium">
            {aula.status === 'NAO_REALIZADA' ? 'Aula Cancelada' : 'Arraste um tópico aqui'}
          </span>
        </div>
      )}
    </div>
  );
}
