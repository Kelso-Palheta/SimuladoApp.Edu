/**
 * Cliente HTTP Oficial — RotinaDocente (Conexao Django REST Framework)
 * Suporte nativo a JWT (access & refresh tokens) com renovacao transparente.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this._inMemoryTokens = { access: null, refresh: null };
  }

  getTokens() {
    if (typeof window === 'undefined') {
      return { ...this._inMemoryTokens };
    }
    try {
      return {
        access: localStorage.getItem('rd_access_token') || this._inMemoryTokens.access,
        refresh: localStorage.getItem('rd_refresh_token') || this._inMemoryTokens.refresh,
      };
    } catch {
      return { ...this._inMemoryTokens };
    }
  }

  setTokens(access, refresh) {
    this._inMemoryTokens = { access: access || null, refresh: refresh || null };
    if (typeof window === 'undefined') return;
    try {
      if (access) localStorage.setItem('rd_access_token', access);
      if (refresh) localStorage.setItem('rd_refresh_token', refresh);
    } catch (e) {
      console.warn('Erro ao salvar tokens no localStorage:', e);
    }
  }

  clearTokens() {
    this._inMemoryTokens = { access: null, refresh: null };
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('rd_access_token');
      localStorage.removeItem('rd_refresh_token');
      localStorage.removeItem('rd_user_perfil');
    } catch (e) {
      console.warn('Erro ao limpar tokens:', e);
    }
  }

  async refreshToken() {
    const { refresh } = this.getTokens();
    if (!refresh) return null;

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (res.ok) {
        const data = await res.json();
        this.setTokens(data.access, data.refresh || refresh);
        return data.access;
      } else {
        this.clearTokens();
        return null;
      }
    } catch {
      return null;
    }
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const { access } = this.getTokens();
    if (access && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${access}`;
    }

    let response = await fetch(url, { ...options, headers });

    // Se receber 401 (token expirado), tenta renovar via refresh_token uma vez
    if (response.status === 401 && access) {
      const newAccess = await this.refreshToken();
      if (newAccess) {
        headers['Authorization'] = `Bearer ${newAccess}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  }

  // Auth Endpoints
  auth = {
    login: async (email, password) => {
      const res = await this.request('/api/v1/auth/token/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'E-mail ou senha incorretos.');
      }
      const data = await res.json();
      this.setTokens(data.access, data.refresh);
      return data;
    },

    registro: async (dados) => {
      const res = await this.request('/api/v1/auth/registro/', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = Object.values(err)[0] || 'Erro ao realizar cadastro.';
        throw new Error(Array.isArray(msg) ? msg[0] : msg);
      }
      const data = await res.json();
      if (data.tokens) {
        this.setTokens(data.tokens.access, data.tokens.refresh);
      }
      return data;
    },

    perfil: async () => {
      const res = await this.request('/api/v1/auth/perfil/');
      if (!res.ok) throw new Error('Não foi possível obter os dados do perfil.');
      return res.json();
    },

    saldoCreditos: async () => {
      const res = await this.request('/api/v1/auth/creditos/');
      if (!res.ok) throw new Error('Não foi possível obter o saldo de créditos.');
      return res.json();
    },
  };

  // Diário Endpoints
  diario = {
    listarTurmas: async () => {
      const res = await this.request('/api/v1/diario/turmas/');
      return res.json();
    },
    publicarNotasBatch: async (turmaId, bimestre, notas) => {
      const res = await this.request(`/api/v1/diario/turmas/${turmaId}/publicar-notas/`, {
        method: 'POST',
        body: JSON.stringify({ bimestre, notas }),
      });
      return res.json();
    },
  };
}

export const api = new ApiClient();
