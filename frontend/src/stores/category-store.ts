/**
 * @fileoverview Store Zustand para gerenciamento de categorias.
 * Utilizado para alimentar dropdowns de filtro e gerenciar o CRUD de categorias.
 */

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Category, CreateCategoryData, PaginatedResponse } from '@/types';

/**
 * @description Define o esquema de estado reativo para o domínio de Categorias.
 */
interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * @description Define as ações disponíveis para mutação do estado de Categorias.
 */
interface CategoryActions {
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  updateCategory: (id: string, data: CreateCategoryData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

/**
 * @description Store principal de Categorias, com ações para fetch e CRUD integradas à API.
 */
export const useCategoryStore = create<CategoryState & CategoryActions>(
  (set, get) => ({
    categories: [],
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchCategories: async () => {
      set({ isLoading: true, error: null });
      try {
        /**
         * A API limita `limit` a 100 por página. Como os dropdowns precisam da
         * lista completa, percorremos as páginas até esgotar os resultados.
         */
        const all: Category[] = [];
        let page = 1;
        let totalPages = 1;

        do {
          const response = await api.get<PaginatedResponse<Category>>(
            `/categories?limit=100&page=${page}`,
          );
          all.push(...response.data);
          totalPages = response.meta.totalPages;
          page += 1;
        } while (page <= totalPages);

        set({ categories: all, isLoading: false });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao buscar categorias';
        set({ isLoading: false, error: message });
      }
    },

    createCategory: async (data) => {
      set({ isSubmitting: true, error: null });
      try {
        const newCategory = await api.post<Category>('/categories', data);
        set({ isSubmitting: false });
        await get().fetchCategories();
        return newCategory;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao criar categoria';
        set({ isSubmitting: false, error: message });
        throw err;
      }
    },

    updateCategory: async (id, data) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.patch<Category>(`/categories/${id}`, data);
        set({ isSubmitting: false });
        await get().fetchCategories();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao atualizar categoria';
        set({ isSubmitting: false, error: message });
        throw err;
      }
    },

    deleteCategory: async (id) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.delete(`/categories/${id}`);
        set({ isSubmitting: false });
        await get().fetchCategories();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao deletar categoria';
        set({ isSubmitting: false, error: message });
        throw err;
      }
    },

    clearError: () => set({ error: null }),
  }),
);
