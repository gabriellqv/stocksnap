/**
 * @fileoverview Store Zustand para gerenciamento de categorias.
 * Utilizado para alimentar dropdowns de filtro e gerenciar o CRUD de categorias.
 */

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Category, CreateCategoryData } from '@/types';

/**
 * Propriedades de estado para Categorias.
 */
interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Funções mutadoras para manipulação do estado de Categorias.
 */
interface CategoryActions {
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<void>;
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
        const categories = await api.get<Category[]>('/categories');
        set({ categories, isLoading: false });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao buscar categorias';
        set({ isLoading: false, error: message });
      }
    },

    createCategory: async (data) => {
      set({ isSubmitting: true, error: null });
      try {
        await api.post<Category>('/categories', data);
        set({ isSubmitting: false });
        await get().fetchCategories();
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
