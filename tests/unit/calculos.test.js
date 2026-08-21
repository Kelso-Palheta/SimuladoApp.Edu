/**
 * Testes Unitários de Regras de Negócio — Diário Pedagógico
 * Referência: specs/RULES.md (RN-01, RN-02, RN-03, RN-04)
 */

import { calcTotal, round2, statusColor, somaMaxAtv } from '../../frontend/src/utils/diario/calculos';

describe('RN-02: Arredondamento com 2 casas decimais (round2)', () => {
  test('deve arredondar valores corretamente', () => {
    expect(round2(6.6666)).toBe(6.67);
    expect(round2(5.554)).toBe(5.55);
    expect(round2(10)).toBe(10);
  });
});

describe('RN-01: Cálculo da média bimestral (calcTotal)', () => {
  const configPadrao = {
    simuladoMaxLanca: 5,
    simuladoMaxFinal: 5,
    atividadesMaxFinal: 5,
    mediaAprovacao: 5,
    mediaRecuperacao: 4.99
  };

  const atividades = [
    { id: 'atv1', nome: 'Trabalho 1', max: 2.5 },
    { id: 'atv2', nome: 'Trabalho 2', max: 2.5 }
  ];

  test('deve calcular nota total com Simulado 5.0 e Atividades cheias', () => {
    const notaAluno = {
      simulado: 5,
      atv1: 2.5,
      atv2: 2.5
    };
    const total = calcTotal(notaAluno.simulado, atividades, notaAluno, configPadrao);
    expect(total).toBe(10);
  });

  test('deve calcular nota proporcional quando o simulado for parcial', () => {
    const notaAluno = {
      simulado: 2.5, // 50% de 5.0 -> 2.5 pontos
      atv1: 2.5,
      atv2: 2.5      // 100% de 5.0 -> 5.0 pontos
    };
    const total = calcTotal(notaAluno.simulado, atividades, notaAluno, configPadrao);
    expect(total).toBe(7.5);
  });
});

describe('RN-03: Classificação de Status (statusColor)', () => {
  const config = { mediaAprovacao: 5, mediaRecuperacao: 4.99 };

  test('deve classificar nota >= 5 como good (aprovado)', () => {
    expect(statusColor(7.5, config)).toBe('good');
    expect(statusColor(5.0, config)).toBe('good');
  });

  test('deve classificar nota abaixo da recuperação como bad', () => {
    expect(statusColor(3.5, config)).toBe('bad');
  });
});
