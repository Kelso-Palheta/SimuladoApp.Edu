'use client';

import React, { useState } from 'react';
import { Sparkles, Calendar, X, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function AutoDistribuirModal({
  isOpen,
  onClose,
  topicos = [],
  aulas = [],
  dataInicioPadrao,
  onConfirmar,
}) {
  const [tipoInicio, setTipoInicio] = useState('hoje'); // 'hoje' | 'inicio_ano' | 'custom'
  const [dataCustom, setDataCustom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [modo, setModo] = useState('substituir'); // 'substituir' | 'apenas_vagas'

  if (!isOpen) return null;

  const hojeStr = format(new Date(), 'yyyy-MM-dd');
  const primeiraAulaData = aulas.length > 0 ? aulas[0].dataAgendada : hojeStr;

  const getDataInicioEfetiva = () => {
    if (tipoInicio === 'hoje') return hojeStr;
    if (tipoInicio === 'inicio_ano') return primeiraAulaData;
    return dataCustom;
  };

  const dataEfetiva = getDataInicioEfetiva();

  // Calcula quantos slots elegíveis existem a partir da dataEfetiva
  const slotsElegiveis = aulas.filter(
    (a) => a.dataAgendada >= dataEfetiva && a.status !== 'NAO_REALIZADA' && a.status !== 'CONCLUIDA'
  );

  const totalTopicos = topicos.length;
  const vagasDisponiveis = slotsElegiveis.length;

  const handleConfirmar = () => {
    onConfirmar({
      dataInicio: dataEfetiva,
      modo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="bg-[#101942] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#f60c49]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-[#f60c49] flex items-center justify-center text-white shadow-lg">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Distribuição Automática</h3>
                <p className="text-xs text-slate-300">Alocar tópicos de planejamento em 1 clique</p>
              </div>
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
        <div className="p-6 space-y-6">
          {/* Seletor de Ponto de Partida */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              A partir de qual data começar a distribuir?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipoInicio('hoje')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  tipoInicio === 'hoje'
                    ? 'border-[#2563eb] bg-blue-50/50 text-[#101942] shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-xs font-extrabold">A partir de Hoje</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {format(new Date(), 'dd/MM/yyyy')}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTipoInicio('inicio_ano')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  tipoInicio === 'inicio_ano'
                    ? 'border-[#2563eb] bg-blue-50/50 text-[#101942] shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-xs font-extrabold">Início do Ano</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  1ª aula da turma
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTipoInicio('custom')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  tipoInicio === 'custom'
                    ? 'border-[#2563eb] bg-blue-50/50 text-[#101942] shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-xs font-extrabold">Personalizada</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Escolher data
                </div>
              </button>
            </div>

            {tipoInicio === 'custom' && (
              <div className="pt-2">
                <input
                  type="date"
                  value={dataCustom}
                  onChange={(e) => setDataCustom(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#101942] outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Resumo da Distribuição */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Total de tópicos no plano:</span>
              <span className="font-extrabold text-[#101942]">{totalTopicos}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Aulas disponíveis a partir de {format(new Date(dataEfetiva + 'T12:00:00'), 'dd/MM/yyyy')}:</span>
              <span className="font-extrabold text-blue-600">{vagasDisponiveis}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-slate-500 text-[11px]">
              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
              <span>Aulas passadas e concluídas são rigorosamente preservadas.</span>
            </div>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={totalTopicos === 0 || vagasDisponiveis === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f60c49] hover:bg-[#d40840] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            <Play size={14} />
            Distribuir Agora ({Math.min(totalTopicos, vagasDisponiveis)} aulas)
          </button>
        </div>
      </div>
    </div>
  );
}
