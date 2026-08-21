import React, { useMemo, useState } from 'react';
import { CardAula } from './CardAula';
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  getDay, 
  isToday, 
  addWeeks, 
  subWeeks,
  addMonths,
  subMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, CalendarRange } from 'lucide-react';

export function CalendarioView({ 
  aulas, 
  dataAtual, 
  setDataAtual, 
  feriados = [],
  onDropTopico, 
  onRemoveTopico, 
  onUpdateStatus, 
  onSmartShift 
}) {
  const [modoVisualizacao, setModoVisualizacao] = useState('mes'); // 'mes' | 'semana'

  // Mapa de feriados por data "YYYY-MM-DD"
  const feriadosPorData = useMemo(() => {
    const mapa = new Map();
    feriados.forEach(f => {
      mapa.set(f.data, f.nome);
    });
    return mapa;
  }, [feriados]);

  // Configuração para a visão MENSAL
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

  // Configuração para a visão SEMANAL
  const diasDaSemanaAtual = useMemo(() => {
    const inicio = startOfWeek(dataAtual, { weekStartsOn: 0 }); // Domingo
    const fim = endOfWeek(dataAtual, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: inicio, end: fim });
  }, [dataAtual]);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const navegar = (delta) => {
    if (modoVisualizacao === 'mes') {
      setDataAtual(delta > 0 ? addMonths(dataAtual, delta) : subMonths(dataAtual, Math.abs(delta)));
    } else {
      setDataAtual(delta > 0 ? addWeeks(dataAtual, delta) : subWeeks(dataAtual, Math.abs(delta)));
    }
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
      <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-[#dce0f0] bg-[#f7f8fc] gap-3">
        {/* Título do Mês/Período */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#fff2f6] border border-[#fde4ec] text-[#f60c49] flex items-center justify-center shadow-2xs">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-head text-base sm:text-lg font-extrabold text-[#101942] leading-none">
              {meses[dataAtual.getMonth()]} de {dataAtual.getFullYear()}
            </h2>
            {modoVisualizacao === 'semana' && (
              <span className="text-[10px] text-[#6070a0] font-semibold mt-0.5 block">
                Semana de {format(diasDaSemanaAtual[0], "d 'de' MMM", { locale: ptBR })} a {format(diasDaSemanaAtual[6], "d 'de' MMM", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>

        {/* Controles: Alternador Mês/Semana e Navegação */}
        <div className="flex items-center gap-3">
          {/* Alternador de Modo */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#dce0f0] shadow-2xs">
            <button
              onClick={() => setModoVisualizacao('mes')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                modoVisualizacao === 'mes'
                  ? 'bg-[#101942] text-white shadow-2xs'
                  : 'text-[#6070a0] hover:text-[#101942]'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Mês</span>
            </button>
            <button
              onClick={() => setModoVisualizacao('semana')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                modoVisualizacao === 'semana'
                  ? 'bg-[#101942] text-white shadow-2xs'
                  : 'text-[#6070a0] hover:text-[#101942]'
              }`}
            >
              <CalendarRange size={13} />
              <span>Semana</span>
            </button>
          </div>

          {/* Navegação */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => navegar(-1)} 
              className="p-1.5 hover:bg-[#eef0f8] rounded-xl transition-all text-[#101942] border border-[#dce0f0] bg-white shadow-2xs"
              title="Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setDataAtual(new Date())} 
              className="px-3 py-1.5 hover:bg-[#eef0f8] rounded-xl transition-all font-bold text-xs text-[#101942] border border-[#dce0f0] bg-white shadow-2xs"
            >
              Hoje
            </button>
            <button 
              onClick={() => navegar(1)} 
              className="p-1.5 hover:bg-[#eef0f8] rounded-xl transition-all text-[#101942] border border-[#dce0f0] bg-white shadow-2xs"
              title="Próximo"
            >
              <ChevronRight size={16} />
            </button>
          </div>
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

      {/* Grade de Conteúdo: VISÃO MENSAL */}
      {modoVisualizacao === 'mes' && (
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] flex-1 overflow-y-auto divide-x divide-y divide-[#dce0f0] bg-white">
          {diasVaziosAntes.map((_, i) => (
            <div key={`vazio-${i}`} className="bg-[#f7f8fc]/40 min-h-[120px]" />
          ))}

          {diasDoMes.map(dia => {
            const dataStr = format(dia, 'yyyy-MM-dd');
            const aulasDoDia = aulasPorData.get(dataStr) || [];
            const feriadoNome = feriadosPorData.get(dataStr);
            const ehHoje = isToday(dia);

            return (
              <div 
                key={dataStr} 
                className={`p-2 flex flex-col min-h-[120px] transition-colors ${
                  feriadoNome 
                    ? 'bg-[#fff2f6]/50 border-t-2 border-t-[#f60c49]'
                    : ehHoje 
                    ? 'bg-[#fff2f6]/30' 
                    : 'hover:bg-[#f7f8fc]/60'
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
                  {feriadoNome ? (
                    <span className="text-[9px] font-bold text-[#d40840] bg-[#fff2f6] border border-[#fde4ec] px-1.5 py-0.5 rounded-full truncate max-w-[80px]" title={feriadoNome}>
                      {feriadoNome}
                    </span>
                  ) : aulasDoDia.length > 0 ? (
                    <span className="text-[10px] font-bold text-[#6070a0] font-mono">
                      {aulasDoDia.length} {aulasDoDia.length > 1 ? 'aulas' : 'aula'}
                    </span>
                  ) : null}
                </div>

                <div className="flex-1 space-y-1.5 overflow-y-auto">
                  {aulasDoDia.map(aula => (
                    <CardAula 
                      key={aula.id} 
                      aula={aula} 
                      onDropTopico={onDropTopico}
                      onRemoveTopico={onRemoveTopico}
                      onUpdateStatus={onUpdateStatus}
                      onSmartShift={onSmartShift}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grade de Conteúdo: VISÃO SEMANAL (Foco e Maior Altura) */}
      {modoVisualizacao === 'semana' && (
        <div className="grid grid-cols-7 flex-1 overflow-y-auto divide-x divide-[#dce0f0] bg-white">
          {diasDaSemanaAtual.map(dia => {
            const dataStr = format(dia, 'yyyy-MM-dd');
            const aulasDoDia = aulasPorData.get(dataStr) || [];
            const ehHoje = isToday(dia);

            return (
              <div 
                key={dataStr} 
                className={`p-3 flex flex-col h-full min-h-[400px] transition-colors ${
                  ehHoje ? 'bg-[#fff2f6]/20' : 'hover:bg-[#f7f8fc]/40'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-2 mb-3 border-b border-[#dce0f0] bg-[#f7f8fc] rounded-2xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6070a0]">
                    {format(dia, 'EEEE', { locale: ptBR }).split('-')[0]}
                  </span>
                  <span 
                    className={`text-sm font-extrabold w-8 h-8 flex items-center justify-center rounded-full mt-1 ${
                      ehHoje 
                        ? 'bg-[#f60c49] text-white shadow-xs' 
                        : 'text-[#101942]'
                    }`}
                  >
                    {format(dia, 'd')}
                  </span>
                  <span className="text-[10px] text-[#6070a0] font-mono mt-0.5">
                    {aulasDoDia.length} aula(s)
                  </span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {aulasDoDia.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-center p-3 border border-dashed border-[#dce0f0] rounded-2xl bg-[#f7f8fc]/40 text-[#9098c0] text-xs">
                      Sem aulas agendadas
                    </div>
                  ) : (
                    aulasDoDia.map(aula => (
                      <CardAula 
                        key={aula.id} 
                        aula={aula} 
                        onDropTopico={onDropTopico}
                        onRemoveTopico={onRemoveTopico}
                        onUpdateStatus={onUpdateStatus}
                        onSmartShift={onSmartShift}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
