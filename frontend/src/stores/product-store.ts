import { create } from 'zustand';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  isLoading: false,
  error: null,
  setProducts: (products) => set({ products }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
