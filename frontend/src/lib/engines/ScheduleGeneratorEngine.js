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

  /**
   * Executa o remanejamento em cascata (Smart Shift) quando uma aula é cancelada (NAO_REALIZADA).
   * Empurra os tópicos da aula cancelada e das aulas subsequentes para os próximos slots válidos.
   * 
   * @param {Array} aulas - Lista de todas as aulas agendadas da turma
   * @param {String} aulaIdCancelada - ID da aula que foi cancelada
   * @returns {Array} Nova lista de aulas com os tópicos remanejados em cascata
   */
  static remanejarAulasEmCascata(aulas, aulaIdCancelada) {
    if (!aulas || aulas.length === 0) return [];

    // Clona as aulas para evitar mutação direta
    const copiaAulas = aulas.map(a => ({
      ...a,
      topicosAssociados: a.topicosAssociados ? [...a.topicosAssociados] : []
    }));

    // Ordena as aulas cronologicamente
    copiaAulas.sort((a, b) => new Date(a.dataAgendada) - new Date(b.dataAgendada));

    const indexCancelada = copiaAulas.findIndex(a => a.id === aulaIdCancelada);
    if (indexCancelada === -1) return copiaAulas;

    const aulaCancelada = copiaAulas[indexCancelada];
    const topicosParaEmpurrar = [...aulaCancelada.topicosAssociados];

    // Marca aula cancelada como NAO_REALIZADA e esvazia seus tópicos
    aulaCancelada.status = 'NAO_REALIZADA';
    aulaCancelada.topicosAssociados = [];

    // Se não tinha tópicos associados para empurrar, encerra
    if (topicosParaEmpurrar.length === 0) {
      return copiaAulas;
    }

    // Percorre em cascata as aulas seguintes ativas
    let bufferTopicos = topicosParaEmpurrar;

    for (let i = indexCancelada + 1; i < copiaAulas.length; i++) {
      const aulaAtual = copiaAulas[i];

      // Só remaneja em aulas agendadas (não substitui aulas concluídas ou outras já canceladas)
      if (aulaAtual.status === 'AGENDADA') {
        const topicosOriginais = [...aulaAtual.topicosAssociados];
        aulaAtual.topicosAssociados = bufferTopicos;
        bufferTopicos = topicosOriginais;

        // Se o buffer ficou vazio, não há mais nada a empurrar
        if (bufferTopicos.length === 0) {
          break;
        }
      }
    }

    return copiaAulas;
  }

  /**
   * Retorna os principais feriados nacionais brasileiros fixos e móveis para um determinado ano.
   * 
   * @param {Number} ano 
   * @returns {Array} Lista de feriados { data: "YYYY-MM-DD", nome: string }
   */
  static obterFeriadosNacionais(ano = new Date().getFullYear()) {
    return [
      { data: `${ano}-01-01`, nome: 'Confraternização Universal' },
      { data: `${ano}-04-21`, nome: 'Tiradentes' },
      { data: `${ano}-05-01`, nome: 'Dia do Trabalho' },
      { data: `${ano}-09-07`, nome: 'Independência do Brasil' },
      { data: `${ano}-10-12`, nome: 'Nossa Senhora Aparecida' },
      { data: `${ano}-11-02`, nome: 'Finados' },
      { data: `${ano}-11-15`, nome: 'Proclamação da República' },
      { data: `${ano}-11-20`, nome: 'Dia da Consciência Negra' },
      { data: `${ano}-12-25`, nome: 'Natal' }
    ];
  }

  /**
   * Aplica um feriado ou recesso escolar a uma data no calendário.
   * Cancela as aulas do dia atribuindo o motivo e remaneja os tópicos em cascata (RN-12).
   * 
   * @param {Array} aulas 
   * @param {String} dataFeriado - "YYYY-MM-DD"
   * @param {String} motivo - Nome do feriado/recesso
   * @returns {Array} Aulas atualizadas com o feriado aplicado e tópicos remanejados
   */
  static aplicarFeriadoNoCalendario(aulas, dataFeriado, motivo = 'Feriado / Recesso Escolar') {
    if (!aulas || aulas.length === 0) return [];

    let aulasAtualizadas = [...aulas];
    const aulasDoDia = aulasAtualizadas.filter(a => a.dataAgendada === dataFeriado);

    aulasDoDia.forEach(aula => {
      aulasAtualizadas = this.remanejarAulasEmCascata(aulasAtualizadas, aula.id);
      const aulaModificada = aulasAtualizadas.find(a => a.id === aula.id);
      if (aulaModificada) {
        aulaModificada.motivoCancelamento = motivo;
      }
    });

    return aulasAtualizadas;
  }
}


