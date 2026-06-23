const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options;

  let url = `${API_URL}${endpoint}`;
  if (params) {
    url += "?" + new URLSearchParams(params).toString();
  }

  const headers: Record<string, string> = {};
  if (!(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...init.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  postMultipart: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, {
      method: "POST",
      body: formData,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: "DELETE", params }),
};

