/**
 * API Client para Django REST Framework
 * Comunicação centralizada do frontend com a API /api/v1/
 */
class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl || window.API_BASE_URL || '';
  }

  /**
   * Helper genérico para requisições fetch com tratamento de JSON e erros.
   */
  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: data.error || data.detail || data.mensagem || 'Erro na requisição',
          data
        };
      }

      return {
        ok: true,
        status: response.status,
        data
      };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        error: `Falha de conexão com o backend: ${err.message}`,
        data: null
      };
    }
  }

  /**
   * POST /api/v1/grade/validar/
   * Executa auditoria completa da lista de slots.
   */
  async validarGrade(slots, escolaId = 'default') {
    return this._fetch('/api/v1/grade/validar/', {
      method: 'POST',
      body: JSON.stringify({ escola_id: escolaId, slots })
    });
  }

  /**
   * POST /api/v1/grade/remanejar/
   * Executa permuta atômica de slots.
   */
  async remanejarAula(origem, destino, forcarSeInvalido = False, escolaId = 'default') {
    return this._fetch('/api/v1/grade/remanejar/', {
      method: 'POST',
      body: JSON.stringify({
        escola_id: escolaId,
        origem,
        destino,
        forcar_se_invalido: forcarSeInvalido
      })
    });
  }

  /**
   * GET /api/v1/grade/carregar/
   * Carrega o estado completo da grade do servidor.
   */
  async carregarGrade(escolaId = 'default') {
    return this._fetch(`/api/v1/grade/carregar/?escola_id=${encodeURIComponent(escolaId)}`, {
      method: 'GET'
    });
  }

  /**
   * POST /api/v1/grade/importar-pdf/
   * Envia arquivo PDF para extração tabular rápida local via pdfplumber.
   */
  async importarPDF(file) {
    const formData = new FormData();
    formData.append('arquivo_pdf', file);

    return this._fetch('/api/v1/grade/importar-pdf/', {
      method: 'POST',
      body: formData
    });
  }

  /**
   * POST /api/v1/grade/gerar-assincrono/
   * Dispara a geração automatizada via Celery.
   */
  async gerarGradeAssincrono(escolaId = 1) {
    return this._fetch('/api/v1/grade/gerar-assincrono/', {
      method: 'POST',
      body: JSON.stringify({ escola_id: escolaId })
    });
  }

  /**
   * GET /api/v1/grade/task-status/<task_id>/
   * Consulta o estado e progresso de uma tarefa assíncrona do Celery.
   */
  async consultarStatusTask(taskId) {
    return this._fetch(`/api/v1/grade/task-status/${encodeURIComponent(taskId)}/`, {
      method: 'GET'
    });
  }

  /**
   * POST /api/v1/assistente/maritaca/
   * Envia consultas ao assistente pedagógico Maritaca AI.
   */
  async assistenteMaritaca(mensagemUsuario, promptSistema = '', contexto = {}) {
    return this._fetch('/api/v1/assistente/maritaca/', {
      method: 'POST',
      body: JSON.stringify({
        mensagem_usuario: mensagemUsuario,
        prompt_sistema: promptSistema,
        contexto
      })
    });
  }
}

// Instância global para uso em index.html e importer.html
window.apiClient = new ApiClient();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiClient;
}
