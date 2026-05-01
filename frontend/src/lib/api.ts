/**
 * Centralized API Client with Bearer Token authentication.
 *
 * The token is managed by the Zustand auth store. When the store
 * logs in, it calls `setAccessToken()` to synchronize.
 * All requests pass through here, ensuring that the token
 * is automatically injected into each request.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Custom Error class to handle API HTTP errors.
 * Extends standard Error with HTTP status and additional payload data.
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
 * Global variable for Token Management, synchronized with Zustand store.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Interface defining options for the HTTP request wrapper.
 */
interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

/**
 * Core HTTP Request Wrapper.
 * Automatically injects the Authorization Bearer token unless `skipAuth` is true.
 * Handles 401 Unauthorized responses by clearing the local session and redirecting.
 *
 * @param endpoint - The API endpoint path (e.g., '/auth/login').
 * @param options - Additional fetch request options and payload body.
 * @returns A Promise that resolves to the expected type `T`.
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
 * Shorthand HTTP Method Helpers for interacting with the backend API.
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
