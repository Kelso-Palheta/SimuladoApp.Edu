'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FastForward,
  Trash2,
  X,
  BookOpen,
  Plus,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DetalhesAulaModal({
  isOpen,
  onClose,
  aula,
  topicosDisponiveis = [],
  onUpdateStatus,
  onRemoveTopico,
  onAddTopico,
}) {
  if (!isOpen || !aula) return null;

  const dataFormatada = aula.dataAgendada
    ? format(parseISO(aula.dataAgendada), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : '';

  const topicos = aula.topicosAssociados || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header da Aula */}
        <div className="bg-[#101942] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#f60c49]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f60c49] bg-[#f60c49]/10 px-2.5 py-0.5 rounded-full border border-[#f60c49]/20">
                Gerenciar Aula
              </span>
              <h3 className="text-base font-bold text-white capitalize mt-1">
                {dataFormatada}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5 font-medium">
                <Clock size={12} className="text-amber-400" />
                {aula.horarioInicio} às {aula.horarioFim}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Seção 1: Status da Aula */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Status da Aula (Clique para alterar)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(aula.id, 'CONCLUIDA', aula);
                  onClose();
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                  aula.status === 'CONCLUIDA'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Concluída</div>
                  <div className="text-[10px] text-slate-400">Aula lecionada</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(aula.id, 'AGENDADA', aula);
                  onClose();
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                  aula.status === 'AGENDADA' || !aula.status
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-xs font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Calendar size={18} className="text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Agendada</div>
                  <div className="text-[10px] text-slate-400">No cronograma</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(aula.id, 'PARCIAL', aula);
                  onClose();
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                  aula.status === 'PARCIAL'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <AlertCircle size={18} className="text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Parcial</div>
                  <div className="text-[10px] text-slate-400">Conteúdo incompleto</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(aula.id, 'NAO_REALIZADA', aula);
                  onClose();
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                  aula.status === 'NAO_REALIZADA'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-xs font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <XCircle size={18} className="text-rose-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Não Realizada</div>
                  <div className="text-[10px] text-slate-400">Cancelada / Feriado</div>
                </div>
              </button>
            </div>
          </div>

          {/* Seção 2: Conteúdo / Tópicos Associados a esta Aula */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Conteúdo Programado ({topicos.length})
              </label>
            </div>

            {topicos.length > 0 ? (
              <div className="space-y-2">
                {topicos.map((t, idx) => {
                  const titulo = t.topicoTitulo || t.titulo || `Aula ${t.topicoOrdem || t.ordem || idx + 1}`;
                  const topicoId = t.topicoId || t.id || t.ordem || idx;
                  return (
                    <div
                      key={topicoId}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#101942] leading-snug">
                            {titulo}
                          </p>
                          {t.descricao && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {t.descricao}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onRemoveTopico(aula.id, topicoId);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition-colors shrink-0"
                        title="Remover este tópico da aula"
                      >
                        <Trash2 size={13} />
                        <span>Desassociar</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-2">
                <BookOpen size={24} className="text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-500">
                  Nenhum conteúdo vinculado a esta aula.
                </p>
                <p className="text-[11px] text-slate-400">
                  Arraste um tópico da barra lateral ou selecione abaixo para vincular.
                </p>
              </div>
            )}

            {/* Seletor Rápido de Tópico do Plano */}
            {topicosDisponiveis.length > 0 && (
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Vincular Tópico Disponível:
                </label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const topico = topicosDisponiveis.find((tp) => tp.id === e.target.value);
                    if (topico) {
                      onAddTopico(aula.id, topico);
                      onClose();
                    }
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="" disabled>
                    + Selecionar um tópico da ementa para esta aula...
                  </option>
                  {topicosDisponiveis.map((tp) => (
                    <option key={tp.id} value={tp.id}>
                      Aula {tp.ordem}: {tp.titulo}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#101942] text-white text-xs font-bold hover:bg-[#101942]/90 transition-colors shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
