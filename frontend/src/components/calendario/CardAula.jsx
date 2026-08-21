import React from 'react';
import { X, Clock } from 'lucide-react';

export function CardAula({ aula, onDropTopico, onRemoveTopico }) {
  // Cores baseadas no status alinhadas ao SimuladoApp
  const coresStatus = {
    'AGENDADA': 'bg-white border-[#dce0f0] text-[#101942] hover:border-[#f60c49]/40',
    'CONCLUIDA': 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]',
    'PARCIAL': 'bg-[#fff7ed] border-[#fed7aa] text-[#9a3412]',
    'NAO_REALIZADA': 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
  };

  const cor = coresStatus[aula.status] || coresStatus['AGENDADA'];

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
    e.preventDefault(); // Necessário para permitir o drop
  };
  
  // Pegar os tópicos novos (array) ou o fallback do modelo antigo
  let topicos = aula.topicosAssociados || [];
  if (topicos.length === 0 && aula.topicoTitulo) {
    topicos = [{ topicoId: aula.topicoId, topicoTitulo: aula.topicoTitulo }];
  }

  return (
    <div 
      className={`p-2.5 border rounded-2xl shadow-2xs text-xs mb-2 transition-all hover:shadow-md ${cor}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-bold text-[10px] uppercase tracking-wider text-[#6070a0] flex items-center gap-1">
          <Clock size={10} className="text-[#f60c49]" />
          {aula.horarioInicio} - {aula.horarioFim}
        </span>
        <span className="font-extrabold text-[10px] bg-[#fff2f6] text-[#d40840] border border-[#fde4ec] px-1.5 py-0.5 rounded-full">
          {aula.duracaoAlocadaAulas} {aula.duracaoAlocadaAulas > 1 ? 'Aulas' : 'Aula'}
        </span>
      </div>
      
      {topicos.length > 0 ? (
        <div className="space-y-1.5 mt-2">
          {topicos.map(t => (
            <div key={t.topicoId} className="flex items-start justify-between bg-[#f7f8fc] border border-[#dce0f0] p-2 rounded-xl group">
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
            Arraste um tópico aqui
          </span>
        </div>
      )}
    </div>
  );
}
