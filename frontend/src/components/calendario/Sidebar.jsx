import React from 'react';
import { Calendar, Settings, ArrowLeft, Plus, Trash2 } from 'lucide-react';
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
    <div className="w-64 bg-white h-screen flex flex-col text-[#101942] border-r border-[#dce0f0] shrink-0 select-none font-sans">
      {/* Header da Sidebar */}
      <div className="px-5 pt-6 pb-4 border-b border-[#dce0f0]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#f60c49] flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-head font-extrabold text-[#101942] tracking-tight text-sm block leading-none">
              Calendário
            </h2>
            <p className="text-[10px] text-[#6070a0] font-medium mt-0.5">Planejamento Letivo</p>
          </div>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p className="text-[10px] text-[#6070a0] uppercase tracking-wider mb-2.5 px-1 font-bold font-head">Suas Turmas</p>
        
        <ul className="space-y-1">
          {turmas.map(t => {
            const ativa = turmaSelecionada?.id === t.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => onSelectTurma(t)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group border
                    ${ativa
                      ? 'bg-[#fff2f6] border-[#fde4ec] text-[#d40840] font-bold shadow-2xs'
                      : 'hover:bg-[#f7f8fc] text-[#101942] border-transparent font-medium'}`}
                >
                  <span className="truncate flex-1">{t.nome}</span>
                  {ativa && (
                    <Settings 
                      className="w-4 h-4 text-[#f60c49] opacity-80 hover:opacity-100 cursor-pointer" 
                      onClick={(e) => { e.stopPropagation(); onOpenConfig(); }}
                      title="Configurar Grade"
                    />
                  )}
                </button>
              </li>
            );
          })}
          {turmas.length === 0 && (
            <div className="px-3 py-3 text-xs text-[#9098c0] italic text-center">
              Nenhuma turma encontrada.
            </div>
          )}
        </ul>
      </div>

      {/* Tópicos do Planejamento Anual (Drag and Drop) */}
      {turmaSelecionada && (
        <div className="flex-1 overflow-y-auto py-4 px-3 border-t border-[#dce0f0] bg-[#f7f8fc]/50">
          <div className="px-1 mb-3 flex items-center justify-between">
            <h3 className="text-[10px] text-[#6070a0] uppercase tracking-wider font-bold font-head">Tópicos do Plano</h3>
            <div className="flex items-center gap-2">
              {planejamento?.topicos?.length > 0 && (
                <button
                  onClick={onClearPlanejamento}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-0.5"
                  title="Limpar planejamento importado"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpar
                </button>
              )}
              <button
                onClick={onOpenImport}
                className="text-[11px] font-bold text-[#f60c49] hover:underline transition-colors flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                Importar
              </button>
            </div>
          </div>

          <ul className="space-y-2">
            {!planejamento?.topicos?.length ? (
              <div className="p-4 rounded-xl border border-dashed border-[#dce0f0] bg-white text-xs text-[#9098c0] text-center space-y-2">
                <p>Nenhum plano importado para esta turma.</p>
                <button
                  onClick={onOpenImport}
                  className="text-xs font-bold text-[#f60c49] hover:underline"
                >
                  + Importar com IA
                </button>
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
                    className="p-3 bg-white rounded-xl cursor-grab hover:shadow-md active:cursor-grabbing border border-[#dce0f0] shadow-2xs hover:border-[#f60c49]/40 transition-all group"
                  >
                    <div className="text-[10px] font-extrabold text-[#f60c49] uppercase tracking-wider mb-0.5">
                      Aula {topico.ordem}
                    </div>
                    <div className="text-xs text-[#101942] font-semibold line-clamp-2 leading-snug" title={topico.titulo}>
                      {topico.titulo}
                    </div>
                    <div className="text-[10px] text-[#9098c0] font-medium mt-1">
                      {topico.duracaoEstimadaAulas} aula(s) estimadas
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Footer da Sidebar */}
      <div className="p-4 border-t border-[#dce0f0] bg-[#f7f8fc]">
        <div className="mb-3">
          <p className="text-[10px] text-[#6070a0] truncate font-medium">Professor:</p>
          <p className="text-xs text-[#101942] font-bold truncate" title={user?.email}>
            {user?.email || '...'}
          </p>
        </div>
        
        <button 
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-[#dce0f0] text-xs font-bold text-[#101942] hover:bg-[#fff2f6] hover:text-[#d40840] hover:border-[#fde4ec] transition-all w-full shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Hub
        </button>
      </div>
    </div>
  );
}
