/**
 * Testes Unitários de Regras de Negócio — Auto-Agendamento e Decisão de Status no Calendário Pedagógico
 * Referência: specs/RULES.md (RN-19, RN-20)
 */

import { describe, test, expect } from 'vitest';
import { ScheduleGeneratorEngine } from '../../frontend/src/lib/engines/ScheduleGeneratorEngine';

describe('RN-19: Auto-Agendamento com Ponto de Partida Flexível', () => {
  const topicosMock = [
    { id: 't1', ordem: 1, titulo: 'Introdução à Sintaxe', duracaoEstimadaAulas: 1 },
    { id: 't2', ordem: 2, titulo: 'Termos Essenciais da Oração', duracaoEstimadaAulas: 1 },
    { id: 't3', ordem: 3, titulo: 'Termos Integrantes da Oração', duracaoEstimadaAulas: 1 },
    { id: 't4', ordem: 4, titulo: 'Termos Acessórios da Oração', duracaoEstimadaAulas: 1 },
  ];

  const aulasMock = [
    { id: 'a1', dataAgendada: '2026-03-02', status: 'CONCLUIDA', topicosAssociados: [{ id: 't0', titulo: 'Revisão Inicial' }] },
    { id: 'a2', dataAgendada: '2026-03-09', status: 'AGENDADA', topicosAssociados: [] },
    { id: 'a3', dataAgendada: '2026-03-16', status: 'NAO_REALIZADA', topicosAssociados: [], motivoCancelamento: 'Conselho' },
    { id: 'a4', dataAgendada: '2026-03-23', status: 'AGENDADA', topicosAssociados: [] },
    { id: 'a5', dataAgendada: '2026-03-30', status: 'AGENDADA', topicosAssociados: [] },
    { id: 'a6', dataAgendada: '2026-04-06', status: 'AGENDADA', topicosAssociados: [] },
  ];

  test('deve distribuir tópicos sequencialmente a partir de uma dataInicio específica, pulando aulas canceladas e preservando concluídas', () => {
    const feriados = [{ data: '2026-03-30', nome: 'Recesso Escolar' }];

    const resultado = ScheduleGeneratorEngine.autoDistribuirTopicos(aulasMock, topicosMock, {
      dataInicio: '2026-03-09',
      feriados,
    });

    const aulaA1 = resultado.find(a => a.id === 'a1');
    expect(aulaA1.status).toBe('CONCLUIDA');
    expect(aulaA1.topicosAssociados[0].id).toBe('t0'); // Preservada

    const aulaA2 = resultado.find(a => a.id === 'a2');
    expect(aulaA2.topicosAssociados[0].id).toBe('t1'); // Primeiro tópico alocado no slot disponível

    const aulaA3 = resultado.find(a => a.id === 'a3');
    expect(aulaA3.status).toBe('NAO_REALIZADA');
    expect(aulaA3.topicosAssociados).toHaveLength(0); // Pulada

    const aulaA4 = resultado.find(a => a.id === 'a4');
    expect(aulaA4.topicosAssociados[0].id).toBe('t2'); // Segundo tópico alocado

    const aulaA5 = resultado.find(a => a.id === 'a5');
    // a5 é 2026-03-30, que está na lista de feriados -> deve ser pulada ou vazia
    expect(aulaA5.topicosAssociados).toHaveLength(0);

    const aulaA6 = resultado.find(a => a.id === 'a6');
    expect(aulaA6.topicosAssociados[0].id).toBe('t3'); // Terceiro tópico
  });

  test('deve respeitar a dataInicio ignorando slots anteriores mesmo que estejam vagos', () => {
    const resultado = ScheduleGeneratorEngine.autoDistribuirTopicos(aulasMock, topicosMock, {
      dataInicio: '2026-03-23',
    });

    const aulaA2 = resultado.find(a => a.id === 'a2');
    expect(aulaA2.topicosAssociados).toHaveLength(0); // Ignorada pois é anterior a 23/03

    const aulaA4 = resultado.find(a => a.id === 'a4');
    expect(aulaA4.topicosAssociados[0].id).toBe('t1'); // Inicia a alocação em 23/03
  });
});

describe('RN-20: Decisão Pedagógica de Remanejamento vs Pulo de Conteúdo', () => {
  const aulasComTopicos = [
    { id: 'a1', dataAgendada: '2026-05-04', status: 'AGENDADA', topicosAssociados: [{ id: 't1', titulo: 'Função Sintática' }] },
    { id: 'a2', dataAgendada: '2026-05-11', status: 'AGENDADA', topicosAssociados: [{ id: 't2', titulo: 'Concordância Verbal' }] },
    { id: 'a3', dataAgendada: '2026-05-18', status: 'AGENDADA', topicosAssociados: [{ id: 't3', titulo: 'Regência Verbal' }] },
  ];

  test('deve aplicar Smart Shift quando a decisão for "smart_shift"', () => {
    const resultado = ScheduleGeneratorEngine.atualizarStatusComDecisao(
      aulasComTopicos,
      'a1',
      'NAO_REALIZADA',
      'smart_shift'
    );

    const a1 = resultado.find(a => a.id === 'a1');
    const a2 = resultado.find(a => a.id === 'a2');
    const a3 = resultado.find(a => a.id === 'a3');

    expect(a1.status).toBe('NAO_REALIZADA');
    expect(a1.topicosAssociados).toHaveLength(0);
    expect(a2.topicosAssociados[0].id).toBe('t1'); // t1 foi empurrado para a2
    expect(a3.topicosAssociados[0].id).toBe('t2'); // t2 foi empurrado para a3
  });

  test('deve pular o conteúdo sem alterar as aulas subsequentes quando a decisão for "pular"', () => {
    const resultado = ScheduleGeneratorEngine.atualizarStatusComDecisao(
      aulasComTopicos,
      'a1',
      'NAO_REALIZADA',
      'pular'
    );

    const a1 = resultado.find(a => a.id === 'a1');
    const a2 = resultado.find(a => a.id === 'a2');
    const a3 = resultado.find(a => a.id === 'a3');

    expect(a1.status).toBe('NAO_REALIZADA');
    expect(a1.topicosAssociados).toHaveLength(0);
    expect(a2.topicosAssociados[0].id).toBe('t2'); // t2 permaneceu inalterado!
    expect(a3.topicosAssociados[0].id).toBe('t3'); // t3 permaneceu inalterado!
  });
});
