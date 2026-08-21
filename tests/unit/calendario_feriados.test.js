/**
 * Testes Unitários de Regras de Negócio — Gestão de Feriados e Recessos
 * Referência: specs/RULES.md (RN-12)
 */

import { describe, test, expect } from 'vitest';
import { ScheduleGeneratorEngine } from '../../frontend/src/lib/engines/ScheduleGeneratorEngine';

describe('RN-12: Bloqueio de Feriados & Remanejamento Automático', () => {
  const aulas = [
    {
      id: 'aula_1',
      dataAgendada: '2026-04-20', // Segunda-feira
      status: 'AGENDADA',
      topicosAssociados: [{ topicoId: 't1', topicoTitulo: 'Geometria Espacial' }]
    },
    {
      id: 'aula_2',
      dataAgendada: '2026-04-21', // Terça-feira (Feriado Tiradentes)
      status: 'AGENDADA',
      topicosAssociados: [{ topicoId: 't2', topicoTitulo: 'Prismas e Cilindros' }]
    },
    {
      id: 'aula_3',
      dataAgendada: '2026-04-27', // Próxima Segunda
      status: 'AGENDADA',
      topicosAssociados: []
    }
  ];

  test('deve cancelar a aula do feriado e empurrar o tópico para a próxima aula vaga', () => {
    const resultado = ScheduleGeneratorEngine.aplicarFeriadoNoCalendario(aulas, '2026-04-21', 'Feriado Nacional - Tiradentes');

    const aulaFeriado = resultado.find(a => a.dataAgendada === '2026-04-21');
    expect(aulaFeriado.status).toBe('NAO_REALIZADA');
    expect(aulaFeriado.motivoCancelamento).toBe('Feriado Nacional - Tiradentes');
    expect(aulaFeriado.topicosAssociados).toEqual([]);

    // O tópico t2 (Prismas) deve ter sido empurrado para a aula de 27/04
    const proximaAula = resultado.find(a => a.dataAgendada === '2026-04-27');
    expect(proximaAula.topicosAssociados[0].topicoId).toBe('t2');
  });

  test('deve listar os feriados nacionais padrão do Brasil', () => {
    const feriadosNacionais = ScheduleGeneratorEngine.obterFeriadosNacionais(2026);
    expect(feriadosNacionais.length).toBeGreaterThan(5);
    expect(feriadosNacionais.some(f => f.nome.includes('Tiradentes'))).toBe(true);
    expect(feriadosNacionais.some(f => f.nome.includes('Independência'))).toBe(true);
  });
});
