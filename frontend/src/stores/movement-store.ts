import { create } from 'zustand';
import { api, ApiError } from '@/lib/api';
import type {
  Movement,
  CreateMovementData,
  MovementQueryParams,
  PaginatedResponse,
  PaginationMeta,
} from '@/types';

interface MovementState {
  movements: Movement[];
  meta: PaginationMeta;
  isLoading: boolean;
  error: string | null;
  query: MovementQueryParams;
}

interface MovementActions {
  fetchMovements: (params?: MovementQueryParams) => Promise<void>;
  createMovement: (data: CreateMovementData) => Promise<void>;
  setQuery: (params: Partial<MovementQueryParams>) => void;
  clearError: () => void;
}

/**
 * @description Constrói a Query String da URL baseada nos parâmetros de filtro.
 * Utiliza a API nativa URLSearchParams para lidar com a formatação e escape corretos.
 *
 * @param {MovementQueryParams} params - Filtros e paginação da movimentação.
 * @returns {string} Query string final (ex: "?productId=123&type=ENTRY&page=1").
 */
function buildQueryString(params: MovementQueryParams): string {
  const searchParams = new URLSearchParams();
  if (params.productId) searchParams.set('productId', params.productId);
  if (params.type) searchParams.set('type', params.type);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * @description Hook Zustand para gerenciamento global de estado das Movimentações.
 * Mantém em sincronia o histórico de movimentações, metadados de paginação e
 * gerencia as interações assíncronas com o backend (GET e POST).
 */
export const useMovementStore = create<MovementState & MovementActions>()((set, get) => ({
  movements: [],
  meta: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  query: {
    page: 1,
    limit: 20,
  },

  setQuery: (params) => {
    set((state) => ({ query: { ...state.query, ...params } }));
  },

  clearError: () => set({ error: null }),

  fetchMovements: async (params) => {
    try {
      set({ isLoading: true, error: null });
      
      const newQuery = params ? { ...get().query, ...params } : get().query;
      if (params) set({ query: newQuery });

      const qs = buildQueryString(newQuery);
      const data = await api.get<PaginatedResponse<Movement>>(`/movements${qs}`);

      set({
        movements: data.data,
        meta: data.meta,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao buscar movimentações';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  createMovement: async (data) => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/movements', data);
      
      // Atualiza a lista após criar nova movimentação
      await get().fetchMovements({ page: 1 });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao registrar movimentação';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
