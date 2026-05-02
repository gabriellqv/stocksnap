/**
 * @fileoverview Store Zustand para gerenciamento centralizado de produtos.
 *
 * Centraliza a lista paginada com busca textual, filtros por categoria,
 * ordenação dinâmica e operações CRUD completas. Todas as chamadas de API
 * utilizam o client centralizado que injeta o Bearer Token automaticamente.
 */

import { create } from 'zustand';
import { api } from '@/lib/api';
import { buildQueryString } from '@/lib/utils';
import type {
  Product,
  PaginatedResponse,
  PaginationMeta,
  CreateProductData,
  UpdateProductData,
  ProductQueryParams,
} from '@/types';

/**
 * @description Define o esquema de estado reativo para o domínio de Produtos.
 */
interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  meta: PaginationMeta;
  query: ProductQueryParams;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * @description Define as ações disponíveis para mutação do estado de Produtos.
 */
interface ProductActions {
  fetchProducts: (params?: ProductQueryParams) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<void>;
  updateProduct: (id: string, data: UpdateProductData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setQuery: (params: Partial<ProductQueryParams>) => void;
  clearSelectedProduct: () => void;
  clearError: () => void;
}

/**
 * @description Store Zustand principal de Produtos.
 * Responsável por integrar requisições à API, mantendo paginação e filtros na memória.
 */
export const useProductStore = create<ProductState & ProductActions>(
  (set, get) => ({
    products: [],
    selectedProduct: null,
    meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    query: { page: 1, limit: 10 },
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchProducts: async (params) => {
      const mergedQuery = { ...get().query, ...params };
      set({ isLoading: true, error: null, query: mergedQuery });

      try {
        const response = await api.get<PaginatedResponse<Product>>(
          `/products${buildQueryString(mergedQuery)}`,
        );
        set({ products: response.data, meta: response.meta, isLoading: false });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao buscar produtos';
        set({ isLoading: false, error: message });
      }
    },

    fetchProduct: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const product = await api.get<Product>(`/products/${id}`);
        set({ selectedProduct: product, isLoading: false });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao buscar produto';
        set({ isLoading: false, error: message });
      }
    },

    createProduct: async (data) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.post<Product>('/products', data);
        set({ isSubmitting: false });
        await get().fetchProducts();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao criar produto';
        set({ isSubmitting: false, error: message });
        throw err;
      }
    },

    updateProduct: async (id, data) => {
      set({ isSubmitting: true, error: null });
      try {
        const updated = await api.patch<Product>(`/products/${id}`, data);
        set((state) => ({
          isSubmitting: false,
          products: state.products.map((p) => (p.id === id ? updated : p)),
          selectedProduct:
            state.selectedProduct?.id === id ? updated : state.selectedProduct,
        }));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao atualizar produto';
        set({ isSubmitting: false, error: message });
        throw err;
      }
    },

    deleteProduct: async (id) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.delete(`/products/${id}`);
        set({ isSubmitting: false });
        await get().fetchProducts();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao deletar produto';
        set({ isSubmitting: false, error: message });
        throw err;
      }
    },

    setQuery: (params) => {
      set((state) => ({ query: { ...state.query, ...params } }));
    },

    clearSelectedProduct: () => set({ selectedProduct: null }),
    clearError: () => set({ error: null }),
  }),
);
