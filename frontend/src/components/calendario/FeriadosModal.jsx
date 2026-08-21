import React, { useState } from 'react';
import { X, Calendar, Plus, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScheduleGeneratorEngine } from '@/lib/engines/ScheduleGeneratorEngine';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function FeriadosModal({ 
  isOpen, 
  onClose, 
  feriados = [], 
  onAddFeriado, 
  onRemoveFeriado,
  onImportarFeriadosNacionais
}) {
  const [data, setData] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    setErro('');
    if (!data || !nome.trim()) {
      setErro('Preencha a data e a descrição do feriado/recesso.');
      return;
    }

    onAddFeriado({
      data,
      nome: nome.trim()
    });

    setData('');
    setNome('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#dce0f0] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header do Modal */}
        <div className="px-6 py-5 border-b border-[#dce0f0] bg-[#f7f8fc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fff2f6] border border-[#fde4ec] text-[#f60c49] flex items-center justify-center shadow-2xs">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="font-head text-base font-extrabold text-[#101942] leading-tight">
                Feriados e Recessos Escolares
              </h2>
              <p className="text-xs text-[#6070a0]">
                Bloqueia dias não letivos e remaneja as aulas automaticamente
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6070a0] hover:text-[#101942] hover:bg-[#eef0f8] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Botão de Ação Rápida: Importar Feriados Nacionais */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#fff2f6] to-[#f7f8fc] border border-[#fde4ec] flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#101942] block">
                Feriados Nacionais do Brasil
              </span>
              <span className="text-[11px] text-[#6070a0] block mt-0.5">
                Carregar datas oficiais (Tiradentes, 7 de Setembro, Finados...)
              </span>
            </div>
            <button
              onClick={onImportarFeriadosNacionais}
              className="btn-brand-primary px-3 py-1.5 text-xs font-bold shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>Importar</span>
            </button>
          </div>

          {/* Formulário de Adicionar Feriado Manual */}
          <form onSubmit={handleAdd} className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6070a0] block font-head">
              Adicionar Feriado / Recesso
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-[#dce0f0] bg-[#f7f8fc] text-[#101942] outline-none focus:bg-white focus:ring-2 focus:ring-[#f60c49]/30 focus:border-[#f60c49] transition-all"
                required
              />
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Feriado Municipal / Semana de Provas"
                className="sm:col-span-2 px-3 py-2 text-xs rounded-xl border border-[#dce0f0] bg-[#f7f8fc] text-[#101942] placeholder-[#9098c0] outline-none focus:bg-white focus:ring-2 focus:ring-[#f60c49]/30 focus:border-[#f60c49] transition-all"
                required
              />
            </div>

            {erro && <p className="text-xs text-[#d40840] font-semibold">{erro}</p>}

            <button
              type="submit"
              className="w-full py-2 bg-[#101942] hover:bg-[#090f28] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Plus size={14} />
              <span>Cadastrar e Remanejar Aulas</span>
            </button>
          </form>

          {/* Lista de Feriados Cadastrados */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6070a0] block font-head">
              Datas Registradas ({feriados.length})
            </span>

            {feriados.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#dce0f0] rounded-2xl text-xs text-[#9098c0]">
                Nenhum feriado ou recesso registrado nesta turma.
              </div>
            ) : (
              <div className="divide-y divide-[#dce0f0] border border-[#dce0f0] rounded-2xl overflow-hidden bg-white max-h-48 overflow-y-auto">
                {feriados.map((f, idx) => {
                  let dataFormatada = f.data;
                  try {
                    dataFormatada = format(parseISO(f.data), "dd/MM/yyyy (EEEE)", { locale: ptBR });
                  } catch {}

                  return (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-[#f7f8fc] transition-colors">
                      <div>
                        <span className="text-xs font-bold text-[#101942] block">
                          {f.nome}
                        </span>
                        <span className="text-[10px] text-[#6070a0] font-medium">
                          {dataFormatada}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveFeriado(f.data)}
                        className="p-1.5 text-[#9098c0] hover:text-[#d40840] hover:bg-[#fff2f6] rounded-lg transition-all"
                        title="Remover feriado"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="px-6 py-4 border-t border-[#dce0f0] bg-[#f7f8fc] flex justify-end">
          <button
            onClick={onClose}
            className="btn-brand-primary px-5 py-2 text-xs font-bold shadow-xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
