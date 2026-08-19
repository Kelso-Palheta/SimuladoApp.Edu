import React, { useMemo } from 'react';
import { CardAula } from './CardAula';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          {meses[dataAtual.getMonth()]} de {dataAtual.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button onClick={() => mudarMes(-1)} className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-600">
            &larr; Anterior
          </button>
          <button onClick={() => setDataAtual(new Date())} className="p-2 hover:bg-gray-200 rounded-md transition-colors font-medium text-gray-600">
            Hoje
          </button>
          <button onClick={() => mudarMes(1)} className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-600">
            Próximo &rarr;
          </button>
        </div>
      </div>

      {/* Grid de Dias da Semana */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-100 text-sm font-medium text-gray-500 text-center">
        {diasSemanaNomes.map(d => (
          <div key={d} className="py-2 border-r last:border-r-0 border-gray-200">{d}</div>
        ))}
      </div>

      {/* Grid de Dias do Mês */}
      <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(120px,auto)] bg-gray-200 gap-[1px] overflow-y-auto">
        {/* Espaços vazios no início do mês */}
        {diasVaziosAntes.map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50 min-h-[120px]"></div>
        ))}

        {/* Dias do Mês */}
        {diasDoMes.map(dia => {
          const dataStr = format(dia, 'yyyy-MM-dd');
          const aulasDoDia = aulasPorData.get(dataStr) || [];
          const hoje = isToday(dia);

          return (
            <div key={dataStr} className={`bg-white min-h-[120px] p-2 transition-colors hover:bg-gray-50 relative ${hoje ? 'ring-2 ring-inset ring-indigo-500' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold flex items-center justify-center w-7 h-7 rounded-full ${hoje ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                  {format(dia, 'd')}
                </span>
                {aulasDoDia.length > 0 && (
                  <span className="text-[10px] text-gray-500 font-medium">
                    {aulasDoDia.length} aula(s)
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
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
