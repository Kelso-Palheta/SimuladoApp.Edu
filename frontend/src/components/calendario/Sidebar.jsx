'use client';

import React from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogOut,
  Layers,
  Calendar as CalendarIcon,
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
  onCopiarPlanejamento,
  planejamento,
  aulas = [],
  user,
}) {
  const router = useRouter();

  const topicos = planejamento?.topicos || [];
  const totalTopicos = topicos.length;

  // Cálculo de Progresso Curricular
  const topicosAssociadosNaTurma = new Set();
  aulas.forEach((aula) => {
    if (aula.topicosAssociados) {
      aula.topicosAssociados.forEach((t) => {
        const id = t.id || t.topicoId || t.topicoOrdem?.toString() || t.ordem?.toString();
        if (id) topicosAssociadosNaTurma.add(id);
      });
    } else if (aula.topicoId) {
      topicosAssociadosNaTurma.add(aula.topicoId);
    }
  });

  const concluidosCount = aulas.filter(
    (a) => a.status === 'CONCLUIDA' && ((a.topicosAssociados && a.topicosAssociados.length > 0) || a.topicoTitulo)
  ).length;

  const agendadosCount = aulas.filter(
    (a) => (a.status === 'AGENDADA' || !a.status) && ((a.topicosAssociados && a.topicosAssociados.length > 0) || a.topicoTitulo)
  ).length;

  const alocadosCount = topicos.filter((t) => {
    const targetId = t.id || t.ordem?.toString();
    return topicosAssociadosNaTurma.has(targetId);
  }).length;

  const pendentesCount = Math.max(0, totalTopicos - alocadosCount);

  const percConcluido = totalTopicos > 0 ? Math.round((concluidosCount / totalTopicos) * 100) : 0;
  const percAgendado = totalTopicos > 0 ? Math.round((agendadosCount / totalTopicos) * 100) : 0;
  const percPendente = Math.max(0, 100 - percConcluido - percAgendado);

  const outrasTurmas = (turmas || []).filter((t) => t.id !== turmaSelecionada?.id);

  return (
    <aside className="w-80 bg-white border-r border-[#dce0f0] flex flex-col h-full z-20 shrink-0 font-sans shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#dce0f0] flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#fff2f6] border border-[#fde4ec] flex items-center justify-center text-[#f60c49] shadow-2xs shrink-0">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-head font-extrabold text-[#101942] text-sm leading-tight">Calendário</h2>
          <p className="text-[10px] text-[#6070a0] font-semibold">Planejamento Letivo</p>
        </div>
      </div>

      {/* Seletor de Turmas */}
      <div className="p-4 border-b border-[#dce0f0]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-[10px] uppercase tracking-wider text-[#6070a0]">
            Suas Turmas
          </span>
        </div>

        <div className="space-y-1">
          {turmas.map((turma) => {
            const isSelected = turmaSelecionada?.id === turma.id;
            return (
              <div
                key={turma.id}
                onClick={() => onSelectTurma(turma)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#fff2f6] text-[#f60c49] shadow-2xs'
                    : 'text-[#101942] hover:bg-[#f7f8fc]'
                }`}
              >
                <span>{turma.nome}</span>
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenConfig();
                    }}
                    className="p-1 text-[#f60c49] hover:bg-white rounded-lg transition-colors"
                    title="Configurar Grade Semanal"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Meio: Planejamento / Tópicos da Turma */}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        {turmaSelecionada ? (
          <>
            {/* Barra de Progresso Curricular */}
            {totalTopicos > 0 && (
              <div className="p-3 bg-[#f7f8fc] border border-[#dce0f0] rounded-2xl mb-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#101942]">
                  <span>Progresso da Ementa</span>
                  <span className="text-[#f60c49] font-mono">{percConcluido}%</span>
                </div>

                {/* Barra Segmentada */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                  <div
                    style={{ width: `${percConcluido}%` }}
                    className="h-full bg-emerald-500 transition-all duration-500"
                    title={`Concluído: ${percConcluido}%`}
                  />
                  <div
                    style={{ width: `${percAgendado}%` }}
                    className="h-full bg-blue-500 transition-all duration-500"
                    title={`Agendado: ${percAgendado}%`}
                  />
                  <div
                    style={{ width: `${percPendente}%` }}
                    className="h-full bg-slate-300 transition-all duration-500"
                    title={`Pendente: ${percPendente}%`}
                  />
                </div>

                {/* Legendas */}
                <div className="flex items-center justify-between text-[10px] font-bold">
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

            {/* Cabeçalho de Tópicos e Botões */}
            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#6070a0]">
                  Tópicos de Aula ({pendentesCount} livres)
                </span>
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
                <div className="p-4 rounded-xl border border-dashed border-[#dce0f0] bg-white text-xs text-[#9098c0] text-center space-y-2.5">
                  <p>Nenhum plano cadastrado.</p>
                  <div className="flex flex-col gap-1.5 pt-1">
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

                  {outrasTurmas.length > 0 && onCopiarPlanejamento && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[10px] text-slate-400 mb-1 font-medium">Ou clonar de outra turma:</p>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            onCopiarPlanejamento(e.target.value);
                          }
                        }}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 outline-none cursor-pointer hover:border-blue-400"
                      >
                        <option value="" disabled>
                          📋 Copiar ementa de...
                        </option>
                        {outrasTurmas.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-4 text-[#6070a0] text-xs font-semibold">
            Selecione uma turma para gerenciar o plano.
          </div>
        )}
      </div>

      {/* Footer da Sidebar */}
      <div className="p-3 border-t border-[#dce0f0] bg-[#f7f8fc]">
        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-[#dce0f0] text-[#101942] text-xs font-bold transition-all shadow-2xs"
        >
          <LogOut size={13} className="text-slate-400" />
          <span>Voltar ao Hub</span>
        </button>
      </div>
    </aside>
  );
}
