/**
 * Zustand store for authentication state management.
 *
 * Utilizes the `persist` middleware to automatically synchronize state
 * with localStorage. Upon application reload, the store restores the token
 * from localStorage and re-injects it into the API client via `onRehydrateStorage`.
 *
 * Architectural Decision: Zustand over Context API
 * 1. Zero boilerplate (no Providers, no useReducer overhead).
 * 2. Optimized renders (components only re-render when selected slices change).
 * 3. Built-in `persist` middleware for seamless localStorage integration.
 * 4. Accessible outside of React components (via `getState()`).
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
 * Defines the schema for the authentication state properties.
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
}

/**
 * Defines the available actions to mutate the authentication state.
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
