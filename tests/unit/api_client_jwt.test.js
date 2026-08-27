import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../../frontend/src/lib/api-client';

describe('Cliente HTTP com Autenticacao JWT & Creditos (api-client)', () => {
  beforeEach(() => {
    // Limpa tokens
    api.clearTokens();
    vi.restoreAllMocks();
  });

  it('deve armazenar e recuperar tokens de acesso e refresh corretamente', () => {
    api.setTokens('jwt_access_123', 'jwt_refresh_456');
    const { access, refresh } = api.getTokens();

    expect(access).toBe('jwt_access_123');
    expect(refresh).toBe('jwt_refresh_456');
  });

  it('deve limpar tokens no logout', () => {
    api.setTokens('jwt_access_123', 'jwt_refresh_456');
    api.clearTokens();

    const { access, refresh } = api.getTokens();
    expect(access).toBeNull();
    expect(refresh).toBeNull();
  });

  it('deve injetar cabecalho Authorization Bearer quando token de acesso existir', async () => {
    api.setTokens('token_teste_bearer', 'token_refresh');

    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true }),
    });
    global.fetch = fetchMock;

    await api.request('/api/v1/auth/perfil/');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledHeaders = fetchMock.mock.calls[0][1].headers;
    expect(calledHeaders['Authorization']).toBe('Bearer token_teste_bearer');
  });

  it('deve tentar renovar token automaticamente em resposta HTTP 401', async () => {
    api.setTokens('token_expirado', 'refresh_valido');

    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(async (url) => {
      callCount++;
      if (url.includes('/api/v1/auth/token/refresh/')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ access: 'novo_token_renovado' }),
        };
      }
      if (callCount === 1) {
        return { ok: false, status: 401 };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ perfil: 'sucesso' }),
      };
    });
    global.fetch = fetchMock;

    const res = await api.request('/api/v1/auth/perfil/');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/token/refresh/'),
      expect.anything()
    );
    expect(api.getTokens().access).toBe('novo_token_renovado');
  });

  it('deve chamar endpoint de publicacao atomica de notas do diario', async () => {
    api.setTokens('token_teste', 'refresh');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ sucesso: true, mensagem: 'Notas publicadas' }),
    });
    global.fetch = fetchMock;

    const res = await api.diario.publicarNotasBatch(1, 1, [
      { estudante_id: 10, nota_simulado: 8.0, nota_atividades: 6.0, faltas: 0 }
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/diario/turmas/1/publicar-notas/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          bimestre: 1,
          notas: [{ estudante_id: 10, nota_simulado: 8.0, nota_atividades: 6.0, faltas: 0 }]
        }),
      })
    );
    expect(res.sucesso).toBe(true);
  });

  it('deve chamar endpoint de execucao do Smart Shift do calendario', async () => {
    api.setTokens('token_teste', 'refresh');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ sucesso: true, aulas_afetadas: 4 }),
    });
    global.fetch = fetchMock;

    const res = await api.calendario.executarSmartShift(2, '2026-03-05', 'Feriado Municipal');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/calendario/smart-shift/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          turma_id: 2,
          data_cancelada: '2026-03-05',
          motivo: 'Feriado Municipal',
        }),
      })
    );
    expect(res.aulas_afetadas).toBe(4);
  });

  it('deve chamar endpoint de envio de redacao para o pipeline Celery/OpenCV', async () => {
    api.setTokens('token_teste', 'refresh');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 99, status: 'pendente' }),
    });
    global.fetch = fetchMock;

    const res = await api.redacao.enviarRedacao({
      tema: 1,
      texto_extraido_ocr: 'Texto da redacao...',
      nome_aluno_avulso: 'João Silva',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/redacao/submissoes/',
      expect.objectContaining({ method: 'POST' })
    );
    expect(res.id).toBe(99);
  });
});
