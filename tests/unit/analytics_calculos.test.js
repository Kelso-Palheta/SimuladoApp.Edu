/**
 * Testes Unitários de Regras de Negócio — Dashboard Analytics Pedagógico
 * Referência: specs/RULES.md (RN-17, RN-18)
 */

import { describe, test, expect } from 'vitest';
import {
  calcularMetricasTurma,
  calcularMetricasGlobais,
  calcularEvolucaoBimestral,
  calcularDistribuicaoNotas,
  obterAlunosEmRisco,
  classificarFaixaNota,
} from '../../frontend/src/utils/analytics/metricas';

describe('RN-17: Agregação de Métricas Analíticas', () => {
  const turmaMock = {
    id: 'turma-1',
    nome: '3º Ano A',
    disciplina: 'Língua Portuguesa',
    alunos: [
      { id: 'aluno-1', nome: 'Ana Silva' },
      { id: 'aluno-2', nome: 'Bruno Santos' },
      { id: 'aluno-3', nome: 'Carlos Lima' },
      { id: 'aluno-4', nome: 'Daniela Costa' },
    ],
    bimestres: {
      '1': {
        config: { mediaAprovacao: 5, mediaRecuperacao: 4.99, simuladoMaxLanca: 5, simuladoMaxFinal: 5, atividadesMaxFinal: 5 },
        atividades: [{ id: 'a1', max: 5 }],
        notas: {
          'aluno-1': { simulado: 5, a1: 5 },  // Total: 10
          'aluno-2': { simulado: 3, a1: 3 },  // Total: 6
          'aluno-3': { simulado: 1.5, a1: 1.5 }, // Total: 3 (Crítico)
          'aluno-4': {}, // Sem nota
        },
      },
      '2': {
        config: { mediaAprovacao: 5, mediaRecuperacao: 4.99, simuladoMaxLanca: 5, simuladoMaxFinal: 5, atividadesMaxFinal: 5 },
        atividades: [{ id: 'a1', max: 5 }],
        notas: {
          'aluno-1': { simulado: 4, a1: 4 },  // Total: 8
          'aluno-2': { simulado: 3.5, a1: 3.5 }, // Total: 7
          'aluno-3': { simulado: 2.2, a1: 2.2 }, // Total: 4.4 (Recuperação)
        },
      },
      '3': { config: {}, atividades: [], notas: {} },
      '4': { config: {}, atividades: [], notas: {} },
    },
  };

  test('deve calcular média da turma considerando apenas alunos avaliados', () => {
    const metricas = calcularMetricasTurma(turmaMock, '1');
    expect(metricas.totalAvaliados).toBe(3);
    expect(metricas.totalAlunos).toBe(4);
    // (10 + 6 + 3) / 3 = 19 / 3 = 6.33
    expect(metricas.mediaTurma).toBe(6.33);
    expect(metricas.taxaAprovacao).toBe(66.67); // 2 de 3 aprovados
  });

  test('deve retornar valores seguros sem NaN quando não houver notas lançadas', () => {
    const metricas = calcularMetricasTurma(turmaMock, '3');
    expect(metricas.totalAvaliados).toBe(0);
    expect(metricas.mediaTurma).toBe(null);
    expect(metricas.taxaAprovacao).toBe(0);
  });

  test('deve consolidar métricas globais para múltiplas turmas', () => {
    const turmaMock2 = {
      id: 'turma-2',
      nome: '3º Ano B',
      alunos: [{ id: 'aluno-5', nome: 'Eduarda' }],
      bimestres: {
        '1': {
          config: { mediaAprovacao: 5, mediaRecuperacao: 4.99, simuladoMaxLanca: 5, simuladoMaxFinal: 5, atividadesMaxFinal: 5 },
          atividades: [{ id: 'a1', max: 5 }],
          notas: { 'aluno-5': { simulado: 4, a1: 4 } }, // Total: 8
        },
      },
    };

    const globais = calcularMetricasGlobais([turmaMock, turmaMock2], '1');
    expect(globais.totalTurmas).toBe(2);
    expect(globais.totalAlunos).toBe(5);
    expect(globais.totalAvaliados).toBe(4);
    // (10 + 6 + 3 + 8) / 4 = 27 / 4 = 6.75
    expect(globais.mediaGeral).toBe(6.75);
    expect(globais.taxaAprovacao).toBe(75); // 3 de 4 aprovados
  });

  test('deve calcular a evolução das médias da turma ao longo dos 4 bimestres', () => {
    const evolucao = calcularEvolucaoBimestral(turmaMock);
    expect(evolucao).toHaveLength(4);
    expect(evolucao[0].bimestre).toBe('1º Bim');
    expect(evolucao[0].media).toBe(6.33);
    expect(evolucao[1].bimestre).toBe('2º Bim');
    expect(evolucao[1].media).toBe(6.47); // (8 + 7 + 4.4) / 3 = 19.4 / 3 = 6.47
    expect(evolucao[2].media).toBe(null); // Sem notas
  });
});

describe('RN-18: Faixas de Desempenho e Alertas Pedagógicos', () => {
  test('deve categorizar faixas de notas estritamente conforme a regra', () => {
    expect(classificarFaixaNota(9.5)).toBe('excelente');
    expect(classificarFaixaNota(8.0)).toBe('excelente');
    expect(classificarFaixaNota(7.9)).toBe('aprovado');
    expect(classificarFaixaNota(5.0)).toBe('aprovado');
    expect(classificarFaixaNota(4.9)).toBe('recuperacao');
    expect(classificarFaixaNota(4.0)).toBe('recuperacao');
    expect(classificarFaixaNota(3.9)).toBe('critico');
    expect(classificarFaixaNota(0.0)).toBe('critico');
  });

  test('deve calcular a distribuição de notas agrupadas por faixas', () => {
    const turma = {
      alunos: [
        { id: '1', nome: 'A' },
        { id: '2', nome: 'B' },
        { id: '3', nome: 'C' },
        { id: '4', nome: 'D' },
      ],
      bimestres: {
        '1': {
          config: { mediaAprovacao: 5, mediaRecuperacao: 4.99, simuladoMaxLanca: 5, simuladoMaxFinal: 5, atividadesMaxFinal: 5 },
          atividades: [{ id: 'a1', max: 5 }],
          notas: {
            '1': { simulado: 5, a1: 4.5 }, // 9.5 -> excelente
            '2': { simulado: 3, a1: 3 },   // 6.0 -> aprovado
            '3': { simulado: 2, a1: 2.5 }, // 4.5 -> recuperacao
            '4': { simulado: 1, a1: 1 },   // 2.0 -> critico
          },
        },
      },
    };

    const dist = calcularDistribuicaoNotas(turma, '1');
    expect(dist.excelente).toBe(1);
    expect(dist.aprovado).toBe(1);
    expect(dist.recuperacao).toBe(1);
    expect(dist.critico).toBe(1);
  });

  test('deve listar alunos em risco ordenados pelo menor rendimento', () => {
    const turma = {
      id: 't1',
      nome: '3º A',
      disciplina: 'História',
      alunos: [
        { id: '1', nome: 'Aluno Bom' },
        { id: '2', nome: 'Aluno Médio' },
        { id: '3', nome: 'Aluno Crítico' },
        { id: '4', nome: 'Aluno Recuperação' },
      ],
      bimestres: {
        '1': {
          config: { mediaAprovacao: 5, mediaRecuperacao: 4.99, simuladoMaxLanca: 5, simuladoMaxFinal: 5, atividadesMaxFinal: 5 },
          atividades: [{ id: 'a1', max: 5 }],
          notas: {
            '1': { simulado: 5, a1: 4 },   // 9.0
            '2': { simulado: 3, a1: 3 },   // 6.0
            '3': { simulado: 1, a1: 1 },   // 2.0 (Crítico)
            '4': { simulado: 2, a1: 2.5 }, // 4.5 (Recuperação)
          },
        },
      },
    };

    const emRisco = obterAlunosEmRisco([turma], '1');
    expect(emRisco).toHaveLength(2);
    expect(emRisco[0].nome).toBe('Aluno Crítico');
    expect(emRisco[0].nota).toBe(2.0);
    expect(emRisco[0].classificacao).toBe('critico');
    expect(emRisco[1].nome).toBe('Aluno Recuperação');
    expect(emRisco[1].nota).toBe(4.5);
    expect(emRisco[1].classificacao).toBe('recuperacao');
  });
});
