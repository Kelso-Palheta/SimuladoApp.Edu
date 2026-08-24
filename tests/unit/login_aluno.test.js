import { describe, it, expect } from 'vitest';
import { gerarLoginAluno, gerarLoginKey } from '../../frontend/src/utils/diario/loginAluno';

describe('Geração de Login do Aluno (Resolução de Colisão)', () => {
  it('deve desambiguar alunos com mesmo primeiro nome e mesmo dia/mês de nascimento', () => {
    const loginPedro1 = gerarLoginAluno('Pedro Henrique Ribeiro Nascimento', '1111');
    const loginPedro2 = gerarLoginAluno('Pedro Vitor Dos Santos Lima', '1111');

    expect(loginPedro1).toBe('pedrohenrique1111');
    expect(loginPedro2).toBe('pedrovitor1111');
    expect(loginPedro1).not.toBe(loginPedro2);
  });

  it('deve ignorar preposições como de, da, do, dos, das, e', () => {
    expect(gerarLoginAluno('Maria da Silva Santos', '1503')).toBe('mariasilva1503');
    expect(gerarLoginAluno('Lucas dos Santos Oliveira', '2010')).toBe('lucassantos2010');
    expect(gerarLoginAluno('Ana e Maria', '0101')).toBe('anamaria0101');
  });

  it('deve lidar corretamente com alunos de nome único', () => {
    expect(gerarLoginAluno('Kelso', '0407')).toBe('kelso0407');
    expect(gerarLoginAluno('Maria', '1503')).toBe('maria1503');
  });

  it('deve remover acentos e caracteres especiais', () => {
    expect(gerarLoginAluno('João Lúcio Álvares', '0505')).toBe('joaolucio0505');
    expect(gerarLoginAluno('Ângela Vitória', '1212')).toBe('angelavitoria1212');
  });

  it('deve gerar chave hash SHA-256 válida', async () => {
    const hash = await gerarLoginKey('pedrohenrique1111');
    expect(hash).toHaveLength(64);
    expect(typeof hash).toBe('string');
  });
});
