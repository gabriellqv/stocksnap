import { create } from 'zustand';
import { Category } from '../types';

/**
 * @description Esquema de estado e ações do store de categorias.
 * Store esqueleto preparado para receber a lógica de CRUD
 * quando os componentes de listagem forem implementados.
 */
interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  setCategories: (categories: Category[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * @description Zustand store para gerenciamento de estado de categorias.
 */
export const useCategoryStore = create<CategoryState>()((set) => ({
  categories: [],
  isLoading: false,
  error: null,
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
