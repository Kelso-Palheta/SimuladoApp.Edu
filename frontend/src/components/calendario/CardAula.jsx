import React from 'react';
import { X } from 'lucide-react';

export function CardAula({ aula, onDropTopico, onRemoveTopico }) {
  // Cores baseadas no status
  const coresStatus = {
    'AGENDADA': 'bg-blue-50 border-blue-200 text-blue-800',
    'CONCLUIDA': 'bg-green-50 border-green-200 text-green-800',
    'PARCIAL': 'bg-yellow-50 border-yellow-200 text-yellow-800',
    'NAO_REALIZADA': 'bg-red-50 border-red-200 text-red-800'
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
      className={`p-2 border rounded-md shadow-sm text-xs mb-2 transition-all hover:scale-[1.02] ${cor}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold text-[10px] uppercase tracking-wider opacity-70">
          {aula.horarioInicio} - {aula.horarioFim}
        </span>
        <span className="font-bold text-[10px] bg-white bg-opacity-50 px-1 rounded">
          {aula.duracaoAlocadaAulas} Aula(s)
        </span>
      </div>
      
      {topicos.length > 0 ? (
        <div className="space-y-1 mt-2">
          {topicos.map(t => (
            <div key={t.topicoId} className="flex items-start justify-between bg-white bg-opacity-40 p-1 rounded group">
              <span className="font-medium line-clamp-2 text-gray-900 flex-1 leading-tight" title={t.topicoTitulo}>
                {t.topicoTitulo}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTopico(aula.id, t.topicoId);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-100 rounded ml-1 p-0.5 transition-all"
                title="Remover Tópico"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-medium mt-1">
          <span className="text-gray-400 italic font-normal">Arraste os temas para cá</span>
        </p>
      )}
    </div>
  );
}
