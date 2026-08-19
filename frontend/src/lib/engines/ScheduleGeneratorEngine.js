import { 
  addDays, 
  eachDayOfInterval, 
  getDay, 
  parseISO, 
  format,
  isBefore,
  isAfter
} from 'date-fns';

/**
 * Motor para geração de slots de aulas recorrentes a partir de uma grade horária.
 */
export class ScheduleGeneratorEngine {
  /**
   * Gera todos os slots de aula agendada para uma turma em um período.
   * 
   * @param {Object} grade - Configuração da grade (id, turmaId, diasSemana, etc)
   * @param {String} dataInicio - "YYYY-MM-DD"
   * @param {String} dataFim - "YYYY-MM-DD"
   * @returns {Array} Lista de AulaAgendada (sem os tópicos do plano, apenas os slots)
   */
  static gerarSlotsCalendario(grade, dataInicio, dataFim) {
    if (!grade || !grade.diasSemana || grade.diasSemana.length === 0) {
      return [];
    }

    const start = parseISO(dataInicio);
    const end = parseISO(dataFim);

    // Lista de todos os dias do período
    const todosDias = eachDayOfInterval({ start, end });

    let aulasGeradas = [];
    let ordemSequencial = 1;

    // Mapa para facilitar busca do dia da semana O(1)
    // d.diaSemana no JS (0 = Domingo, 1 = Seg, 2 = Ter...)
    const configPorDia = new Map();
    grade.diasSemana.forEach(d => {
      configPorDia.set(d.diaSemana, d);
    });

    todosDias.forEach(diaAtual => {
      const diaSemanaJs = getDay(diaAtual);
      
      if (configPorDia.has(diaSemanaJs)) {
        const configDia = configPorDia.get(diaSemanaJs);
        
        // Se a configuração diz que há N aulas nesse dia, gera N slots?
        // Sim, se forem geminadas (ex: 2 aulas), podemos gerar 1 card longo "Aula dupla" 
        // ou 2 cards distintos. Na modelagem, 'duracaoAlocadaAulas' vai indicar isso.
        
        const aulaSlot = {
          id: `slot_${grade.turmaId}_${format(diaAtual, 'yyyy-MM-dd')}_${configDia.horarioInicio.replace(':','')}`,
          turmaId: grade.turmaId,
          dataAgendada: format(diaAtual, 'yyyy-MM-dd'),
          diaSemana: diaSemanaJs,
          horarioInicio: configDia.horarioInicio,
          horarioFim: configDia.horarioFim,
          duracaoAlocadaAulas: configDia.quantidadeAulas,
          
          status: 'AGENDADA', // Padrão
          ordemSequencialIndex: ordemSequencial,
          
          // Campos a serem preenchidos no encadeamento de plano de aula (Fase 2)
          topicoOrdem: null,
          topicoTitulo: "A Definir (Sem Plano Associado)",
          planejamentoId: null
        };
        
        aulasGeradas.push(aulaSlot);
        ordemSequencial++;
      }
    });

    return aulasGeradas;
  }
}
