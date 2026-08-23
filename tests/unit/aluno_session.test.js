import { describe, it, expect } from 'vitest';
import { signSessionToken, verifySessionToken } from '../../frontend/src/lib/aluno/session';

describe('Aluno Session Security (HMAC-SHA256)', () => {
  it('deve assinar e verificar um token de sessão válido com sucesso', () => {
    const payload = {
      loginKey: 'TEST_HASH_123',
      nome: 'Aluno Teste',
      login: 'ALUNO1234',
      vinculos: [{ professorUid: 'prof_abc', turmaId: '101' }],
    };

    const token = signSessionToken(payload);
    expect(token).toBeDefined();
    expect(token.split('.')).toHaveLength(2);

    const decoded = verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.loginKey).toBe('TEST_HASH_123');
    expect(decoded.nome).toBe('Aluno Teste');
    expect(decoded.vinculos).toHaveLength(1);
  });

  it('deve rejeitar tokens adulterados na assinatura', () => {
    const token = signSessionToken({ nome: 'Aluno Original' });
    const [payloadB64, sig] = token.split('.');
    
    // Adultera o payload
    const fakePayload = Buffer.from(JSON.stringify({ nome: 'Hacker' })).toString('base64url');
    const fakeToken = `${fakePayload}.${sig}`;

    const verified = verifySessionToken(fakeToken);
    expect(verified).toBeNull();
  });

  it('deve rejeitar tokens expirados ou mal formatados', () => {
    expect(verifySessionToken(null)).toBeNull();
    expect(verifySessionToken('')).toBeNull();
    expect(verifySessionToken('token.invalido.com.tres.partes')).toBeNull();
  });
});
