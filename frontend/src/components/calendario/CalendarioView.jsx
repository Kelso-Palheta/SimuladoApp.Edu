import React, { useMemo } from 'react';
import { CardAula } from './CardAula';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export function CalendarioView({ aulas, dataAtual, setDataAtual, onDropTopico, onRemoveTopico }) {
  // Configuração básica do mês atual na view
  const { diasDoMes, diasVaziosAntes } = useMemo(() => {
    const inicio = startOfMonth(dataAtual);
    const fim = endOfMonth(dataAtual);
    const dias = eachDayOfInterval({ start: inicio, end: fim });
    const primeiroDiaSemana = getDay(inicio);
    
    return {
      diasDoMes: dias,
      diasVaziosAntes: Array.from({ length: primeiroDiaSemana })
    };
  }, [dataAtual]);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const mudarMes = (delta) => {
    const novaData = new Date(dataAtual);
    novaData.setMonth(novaData.getMonth() + delta);
    setDataAtual(novaData);
  };

  // Agrupa as aulas por data no formato YYYY-MM-DD
  const aulasPorData = useMemo(() => {
    const mapa = new Map();
    aulas.forEach(aula => {
      if (!mapa.has(aula.dataAgendada)) {
        mapa.set(aula.dataAgendada, []);
      }
      mapa.get(aula.dataAgendada).push(aula);
    });
    return mapa;
  }, [aulas]);

  const diasSemanaNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#dce0f0] overflow-hidden flex flex-col h-full font-sans">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#dce0f0] bg-[#f7f8fc]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#f60c49]" />
          <h2 className="font-head text-lg font-extrabold text-[#101942]">
            {meses[dataAtual.getMonth()]} de {dataAtual.getFullYear()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => mudarMes(-1)} 
            className="p-2 hover:bg-[#eef0f8] rounded-xl transition-all text-[#101942] border border-[#dce0f0] bg-white shadow-2xs"
            title="Mês Anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setDataAtual(new Date())} 
            className="px-3.5 py-1.5 hover:bg-[#eef0f8] rounded-xl transition-all font-bold text-xs text-[#101942] border border-[#dce0f0] bg-white shadow-2xs"
          >
            Hoje
          </button>
          <button 
            onClick={() => mudarMes(1)} 
            className="p-2 hover:bg-[#eef0f8] rounded-xl transition-all text-[#101942] border border-[#dce0f0] bg-white shadow-2xs"
            title="Próximo Mês"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Dias da Semana (Header) */}
      <div className="grid grid-cols-7 border-b border-[#dce0f0] bg-[#f7f8fc]/70 text-center font-bold text-xs text-[#6070a0] py-2.5 uppercase tracking-wider font-head">
        {diasSemanaNomes.map((dia, index) => (
          <div key={dia} className={index === 0 || index === 6 ? 'text-[#9098c0]' : ''}>
            {dia}
          </div>
        ))}
      </div>

      {/* Grade do Mês */}
      <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] flex-1 overflow-y-auto divide-x divide-y divide-[#dce0f0] bg-white">
        {/* Espaços vazios antes do dia 1 */}
        {diasVaziosAntes.map((_, i) => (
          <div key={`vazio-${i}`} className="bg-[#f7f8fc]/40 min-h-[120px]" />
        ))}

        {/* Dias do mês */}
        {diasDoMes.map(dia => {
          const dataStr = format(dia, 'yyyy-MM-dd');
          const aulasDoDia = aulasPorData.get(dataStr) || [];
          const ehHoje = isToday(dia);

          return (
            <div 
              key={dataStr} 
              className={`p-2 flex flex-col min-h-[120px] transition-colors ${
                ehHoje ? 'bg-[#fff2f6]/30' : 'hover:bg-[#f7f8fc]/60'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span 
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    ehHoje 
                      ? 'bg-[#f60c49] text-white shadow-xs' 
                      : 'text-[#101942]'
                  }`}
                >
                  {format(dia, 'd')}
                </span>
                {aulasDoDia.length > 0 && (
                  <span className="text-[10px] font-bold text-[#6070a0] font-mono">
                    {aulasDoDia.length} {aulasDoDia.length > 1 ? 'aulas' : 'aula'}
                  </span>
                )}
              </div>

              {/* Lista de Aulas */}
              <div className="flex-1 space-y-1.5 overflow-y-auto">
                {aulasDoDia.map(aula => (
                  <CardAula 
                    key={aula.id} 
                    aula={aula} 
                    onDropTopico={onDropTopico}
                    onRemoveTopico={onRemoveTopico}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
