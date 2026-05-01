import { create } from 'zustand';
import { Product } from '../types';

/**
 * @description Esquema de estado e ações do store de produtos.
 * Store esqueleto preparado para receber a lógica de CRUD
 * quando os componentes de listagem e formulários forem implementados.
 */
interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * @description Zustand store para gerenciamento de estado de produtos.
 */
export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  isLoading: false,
  error: null,
  setProducts: (products) => set({ products }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
