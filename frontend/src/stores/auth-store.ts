/**
 * @description Store Zustand para gerenciamento do estado de autenticação.
 *
 * Utiliza o middleware `persist` para sincronizar automaticamente o estado
 * com o localStorage. Ao recarregar a aplicação, o store restaura o token
 * do localStorage e o injeta novamente no cliente da API via `onRehydrateStorage`.
 *
 * Decisão Arquitetural: Zustand sobre Context API
 * 1. Zero boilerplate (sem Providers, sem overhead do useReducer).
 * 2. Renderizações otimizadas (componentes só renderizam quando o pedaço do estado selecionado muda).
 * 3. Middleware `persist` embutido para integração transparente com localStorage.
 * 4. Acessível fora dos componentes React (via `getState()`).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAccessToken } from '@/lib/api';
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
} from '@/types';

/**
 * @description Define o esquema (schema) para as propriedades de estado da autenticação.
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
}

/**
 * @description Define as ações disponíveis para mutação do estado de autenticação.
 */
interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isHydrated: false,

      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<LoginResponse>(
            '/auth/login',
            credentials,
            { skipAuth: true },
          );

          setAccessToken(response.access_token);

          if (typeof document !== 'undefined') {
            document.cookie = `stocksnap-token=${response.access_token}; path=/; max-age=86400`;
          }

          set({
            user: response.user,
            token: response.access_token,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Erro ao fazer login';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          await api.post('/auth/register', credentials, { skipAuth: true });

          const loginResponse = await api.post<LoginResponse>(
            '/auth/login',
            { email: credentials.email, password: credentials.password },
            { skipAuth: true },
          );

          setAccessToken(loginResponse.access_token);

          if (typeof document !== 'undefined') {
            document.cookie = `stocksnap-token=${loginResponse.access_token}; path=/; max-age=86400`;
          }

          set({
            user: loginResponse.user,
            token: loginResponse.access_token,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Erro ao registrar';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: () => {
        setAccessToken(null);
        if (typeof document !== 'undefined') {
          document.cookie =
            'stocksnap-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        set({ user: null, token: null, error: null });
      },

      clearError: () => set({ error: null }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'stocksnap-auth',

      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),

      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAccessToken(state.token);
        }
        state?.setHydrated();
      },
    },
  ),
);
