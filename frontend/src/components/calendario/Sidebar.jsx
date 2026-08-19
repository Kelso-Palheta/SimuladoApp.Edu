import React from 'react';
import { Calendar, Settings, ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Sidebar({ 
  turmas, 
  turmaSelecionada, 
  onSelectTurma, 
  onOpenConfig,
  onOpenImport,
  onClearPlanejamento,
  planejamento,
  aulas,
  user
}) {
  const router = useRouter();

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300 border-r border-slate-800 shrink-0 select-none">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-400" />
            Calendário
          </h1>
          <p className="text-xs text-slate-500 mt-1">Planejamento Pedagógico</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Suas Turmas</h2>
        </div>
        
        <ul className="space-y-1">
          {turmas.map(t => (
            <li key={t.id} className="px-2">
              <button
                onClick={() => onSelectTurma(t)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group
                  ${turmaSelecionada?.id === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <span className="truncate flex-1 font-medium">{t.nome}</span>
                {turmaSelecionada?.id === t.id && (
                  <Settings 
                    className="w-4 h-4 opacity-70 hover:opacity-100 cursor-pointer" 
                    onClick={(e) => { e.stopPropagation(); onOpenConfig(); }}
                    title="Configurar Grade"
                  />
                )}
              </button>
            </li>
          ))}
          {turmas.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500 italic">
              Nenhuma turma encontrada.
            </div>
          )}
        </ul>
      </div>

      {turmaSelecionada && (
        <div className="flex-1 overflow-y-auto py-4 border-t border-slate-800">
          <div className="px-4 mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Planejamento</h2>
            <div className="flex gap-3">
              {planejamento?.topicos?.length > 0 && (
                <button onClick={onClearPlanejamento} className="text-xs text-red-400 hover:text-red-300 transition-colors" title="Limpar tudo">
                  Limpar
                </button>
              )}
              <button onClick={onOpenImport} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                + Importar
              </button>
            </div>
          </div>

          <ul className="space-y-2 px-2 mt-4">
            {!planejamento?.topicos?.length ? (
              <div className="px-2 py-3 text-sm text-slate-500 italic text-center">
                Nenhum plano importado.
              </div>
            ) : (
              planejamento.topicos.map(topico => {
                const targetId = topico.id || topico.ordem?.toString();
                const isAssociado = aulas?.some(aula => 
                  aula.topicoId === targetId || 
                  (aula.topicosAssociados && aula.topicosAssociados.some(t => t.topicoId === targetId))
                );
                if (isAssociado) return null; // Esconde os já associados

                return (
                  <li 
                    key={topico.id} 
                    draggable 
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(topico));
                    }}
                    className="p-3 bg-slate-800 rounded-lg cursor-grab hover:bg-slate-700 active:cursor-grabbing border border-slate-700 shadow-sm"
                  >
                    <div className="text-xs font-bold text-indigo-400 mb-1">Aula {topico.ordem}</div>
                    <div className="text-sm text-slate-200 font-medium line-clamp-2" title={topico.titulo}>{topico.titulo}</div>
                    <div className="text-xs text-slate-400 mt-1">{topico.duracaoEstimadaAulas} aula(s) estimadas</div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-1 truncate">Professor logado:</p>
          <p className="text-sm text-slate-300 font-medium truncate" title={user?.email}>
            {user?.email || '...'}
          </p>
        </div>
        
        <button 
          onClick={() => router.push('/')}
          className="flex items-center text-sm text-slate-400 hover:text-white transition-colors w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Hub
        </button>
      </div>
    </div>
  );
}
