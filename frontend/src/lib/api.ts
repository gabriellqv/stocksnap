/**
 * @description Cliente API centralizado com autenticação via Bearer Token.
 *
 * O token é gerenciado pelo auth store do Zustand. Quando o store
 * faz login, ele chama `setAccessToken()` para sincronizar.
 * Todas as requisições passam por aqui, garantindo que o token
 * seja automaticamente injetado em cada requisição.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * @description Classe de Erro customizada para lidar com erros HTTP da API.
 * Estende o Error padrão com status HTTP e dados adicionais de payload.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * @description Variável global para Gerenciamento do Token, sincronizada com o store Zustand.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * @description Interface que define opções para o wrapper da requisição HTTP.
 */
interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

/**
 * @description Wrapper principal para Requisições HTTP.
 * Injeta automaticamente o token Bearer de Autorização a menos que `skipAuth` seja true.
 * Lida com respostas 401 Unauthorized limpando a sessão local e redirecionando.
 *
 * @param {string} endpoint - O caminho do endpoint da API (ex: '/auth/login').
 * @param {RequestOptions} options - Opções adicionais da requisição fetch e corpo (payload).
 * @returns {Promise<T>} Uma Promise que resolve para o tipo esperado `T`.
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth = false, headers: customHeaders, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...init,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !skipAuth) {
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('stocksnap-auth');
      window.location.href = '/login';
    }
    throw new ApiError('Sessão expirada. Faça login novamente.', 401);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.message || `Erro ${response.status}: ${response.statusText}`;
    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) return {} as T;

  return response.json();
}

/**
 * @description Helpers simplificados de métodos HTTP para interação com a API backend.
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body: data }),
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: data }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
