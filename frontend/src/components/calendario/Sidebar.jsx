'use client';

import React from 'react';
import {
  Calendar,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Sidebar({
  turmas = [],
  turmaSelecionada,
  onSelectTurma,
  onOpenConfig,
  onOpenImport,
  onOpenAutoDistribuir,
  onOpenNovoTopico,
  onOpenEditarTopico,
  onExcluirTopico,
  onClearPlanejamento,
  planejamento,
  aulas = [],
  user,
}) {
  const router = useRouter();

  // Cálculo do progresso curricular
  const topicos = planejamento?.topicos || [];
  const totalTopicos = topicos.length;

  const topicosStatus = topicos.map((topico) => {
    const targetId = topico.id || topico.ordem?.toString();
    const aulaAssociada = aulas?.find(
      (aula) =>
        aula.topicoId === targetId ||
        (aula.topicosAssociados && aula.topicosAssociados.some((t) => t.id === targetId || t.topicoId === targetId))
    );

    if (!aulaAssociada) return 'pendente';
    if (aulaAssociada.status === 'CONCLUIDA') return 'concluida';
    if (aulaAssociada.status === 'NAO_REALIZADA') return 'pendente';
    return 'agendada';
  });

  const concluidosCount = topicosStatus.filter((s) => s === 'concluida').length;
  const agendadosCount = topicosStatus.filter((s) => s === 'agendada').length;
  const pendentesCount = topicosStatus.filter((s) => s === 'pendente').length;

  const pctConcluido = totalTopicos > 0 ? Math.round((concluidosCount / totalTopicos) * 100) : 0;
  const pctAgendado = totalTopicos > 0 ? Math.round((agendadosCount / totalTopicos) * 100) : 0;

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
      <div className="py-3 px-3 border-b border-[#dce0f0] max-h-40 overflow-y-auto">
        <p className="text-[10px] text-[#6070a0] uppercase tracking-wider mb-2 px-1 font-bold font-head">
          Suas Turmas
        </p>

        <ul className="space-y-1">
          {turmas.map((t) => {
            const ativa = turmaSelecionada?.id === t.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => onSelectTurma(t)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between group border ${
                    ativa
                      ? 'bg-[#fff2f6] border-[#fde4ec] text-[#d40840] font-bold shadow-2xs'
                      : 'hover:bg-[#f7f8fc] text-[#101942] border-transparent font-medium'
                  }`}
                >
                  <span className="truncate flex-1">{t.nome}</span>
                  {ativa && (
                    <Settings
                      className="w-3.5 h-3.5 text-[#f60c49] opacity-80 hover:opacity-100 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenConfig();
                      }}
                      title="Configurar Grade"
                    />
                  )}
                </button>
              </li>
            );
          })}
          {turmas.length === 0 && (
            <div className="px-3 py-2 text-xs text-[#9098c0] italic text-center">
              Nenhuma turma encontrada.
            </div>
          )}
        </ul>
      </div>

      {/* Tópicos do Planejamento e Ações */}
      {turmaSelecionada && (
        <div className="flex-1 overflow-y-auto py-3 px-3 flex flex-col bg-[#f7f8fc]/40">
          {/* Progresso Curricular */}
          {totalTopicos > 0 && (
            <div className="mb-3 p-3 bg-white rounded-2xl border border-[#dce0f0] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#101942]">
                  Progresso do Plano
                </span>
                <span className="text-xs font-black text-[#2563eb]">
                  {pctConcluido + pctAgendado}%
                </span>
              </div>

              {/* Barra de Progresso Segmentada */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${pctConcluido}%` }}
                  title={`${concluidosCount} concluídos (${pctConcluido}%)`}
                />
                <div
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${pctAgendado}%` }}
                  title={`${agendadosCount} agendados (${pctAgendado}%)`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-0.5">
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 size={11} className="text-emerald-500" /> {concluidosCount} conc.
                </span>
                <span className="flex items-center gap-1 text-blue-700">
                  <Clock size={11} className="text-blue-500" /> {agendadosCount} agend.
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <AlertCircle size={11} className="text-slate-400" /> {pendentesCount} pend.
                </span>
              </div>
            </div>
          )}

          {/* Cabeçalho de Tópicos e Botão Auto-Distribuir */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] text-[#6070a0] uppercase tracking-wider font-bold font-head">
                Tópicos de Aula ({pendentesCount} livres)
              </h3>
              <div className="flex items-center gap-1">
                {totalTopicos > 0 && (
                  <button
                    onClick={onClearPlanejamento}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Limpar todos os tópicos"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={onOpenNovoTopico}
                  className="text-[11px] font-bold text-[#2563eb] hover:underline flex items-center gap-0.5"
                  title="Adicionar tópico manualmente"
                >
                  <Plus className="w-3 h-3" />
                  Novo
                </button>
                <button
                  onClick={onOpenImport}
                  className="text-[11px] font-bold text-[#f60c49] hover:underline flex items-center gap-0.5 ml-1"
                  title="Importar ementa com IA"
                >
                  Importar
                </button>
              </div>
            </div>

            {/* Botão de Distribuição Automática */}
            {totalTopicos > 0 && pendentesCount > 0 && (
              <button
                type="button"
                onClick={onOpenAutoDistribuir}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Sparkles size={13} className="text-amber-300" />
                <span>Distribuir Tópicos</span>
              </button>
            )}
          </div>

          {/* Lista de Tópicos com Drag & Drop e Ações */}
          <ul className="space-y-2 flex-1 overflow-y-auto pr-0.5">
            {!totalTopicos ? (
              <div className="p-4 rounded-xl border border-dashed border-[#dce0f0] bg-white text-xs text-[#9098c0] text-center space-y-2">
                <p>Nenhum plano cadastrado.</p>
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={onOpenImport}
                    className="text-xs font-bold text-[#f60c49] hover:underline"
                  >
                    + Importar com IA
                  </button>
                  <button
                    onClick={onOpenNovoTopico}
                    className="text-xs font-bold text-[#2563eb] hover:underline"
                  >
                    + Criar Manualmente
                  </button>
                </div>
              </div>
            ) : (
              topicos.map((topico) => {
                const targetId = topico.id || topico.ordem?.toString();
                const isAssociado = aulas?.some(
                  (aula) =>
                    aula.topicoId === targetId ||
                    (aula.topicosAssociados &&
                      aula.topicosAssociados.some(
                        (t) => t.id === targetId || t.topicoId === targetId
                      ))
                );

                if (isAssociado) return null; // Mostra apenas os pendentes de agendamento

                return (
                  <li
                    key={topico.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(topico));
                    }}
                    className="p-2.5 bg-white rounded-xl cursor-grab hover:shadow-md active:cursor-grabbing border border-[#dce0f0] shadow-2xs hover:border-[#f60c49]/40 transition-all group relative"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-extrabold text-[#f60c49] uppercase tracking-wider">
                        Aula {topico.ordem}
                      </span>
                      {/* Botões de Ação do Tópico (Editar / Excluir) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEditarTopico(topico);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Editar Tópico"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Excluir o tópico "${topico.titulo}"?`)) {
                              onExcluirTopico(topico.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Excluir Tópico"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <div
                      className="text-xs text-[#101942] font-semibold line-clamp-2 leading-snug"
                      title={topico.titulo}
                    >
                      {topico.titulo}
                    </div>

                    <div className="text-[10px] text-[#9098c0] font-medium mt-1">
                      {topico.duracaoEstimadaAulas || 1} aula(s) estimadas
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Footer da Sidebar */}
      <div className="p-3 border-t border-[#dce0f0] bg-[#f7f8fc]">
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
