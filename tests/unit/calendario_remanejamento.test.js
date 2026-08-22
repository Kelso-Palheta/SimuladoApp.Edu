/**
 * Testes Unitários de Regras de Negócio — Calendário Pedagógico & Smart Shift
 * Referência: specs/RULES.md (RN-10, RN-11)
 */

import { describe, test, expect } from 'vitest';
import { ScheduleGeneratorEngine } from '../../frontend/src/lib/engines/ScheduleGeneratorEngine';

describe('RN-11: Remanejamento em Cascata (Smart Shift)', () => {
  const aulasIniciais = [
    {
      id: 'aula_1',
      dataAgendada: '2026-03-02',
      status: 'AGENDADA',
      topicosAssociados: [{ topicoId: 't1', topicoTitulo: 'Introdução à Função Afim' }]
    },
    {
      id: 'aula_2',
      dataAgendada: '2026-03-04',
      status: 'AGENDADA',
      topicosAssociados: [{ topicoId: 't2', topicoTitulo: 'Gráfico da Função Afim' }]
    },
    {
      id: 'aula_3',
      dataAgendada: '2026-03-09',
      status: 'AGENDADA',
      topicosAssociados: []
    }
  ];

  test('deve empurrar tópicos para a próxima aula quando aula_1 for cancelada', () => {
    const resultado = ScheduleGeneratorEngine.remanejarAulasEmCascata(aulasIniciais, 'aula_1');

    // Aula 1 deve estar marcada como NAO_REALIZADA mantendo o registro do que foi cancelado
    const aula1 = resultado.find(a => a.id === 'aula_1');
    expect(aula1.status).toBe('NAO_REALIZADA');
    expect(aula1.topicosAssociados[0].topicoId).toBe('t1');

    // Aula 2 deve agora receber o tópico t1 da Aula 1
    const aula2 = resultado.find(a => a.id === 'aula_2');
    expect(aula2.topicosAssociados[0].topicoId).toBe('t1');

    // Aula 3 deve receber o tópico t2 que estava na Aula 2
    const aula3 = resultado.find(a => a.id === 'aula_3');
    expect(aula3.topicosAssociados[0].topicoId).toBe('t2');
  });

  test('não deve alterar aulas anteriores à aula cancelada', () => {
    const aulasComHistorico = [
      {
        id: 'aula_concluida',
        dataAgendada: '2026-02-25',
        status: 'CONCLUIDA',
        topicosAssociados: [{ topicoId: 't0', topicoTitulo: 'Conjuntos Numéricos' }]
      },
      ...aulasIniciais
    ];

    const resultado = ScheduleGeneratorEngine.remanejarAulasEmCascata(aulasComHistorico, 'aula_1');
    const aulaConcluida = resultado.find(a => a.id === 'aula_concluida');
    expect(aulaConcluida.status).toBe('CONCLUIDA');
    expect(aulaConcluida.topicosAssociados[0].topicoId).toBe('t0');
  });
});
