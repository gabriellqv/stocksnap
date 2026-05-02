/**
 * @fileoverview Store Zustand para gerenciamento centralizado da Dashboard.
 *
 * Executa as três requisições ao backend (sumário, gráfico, estoque crítico)
 * em paralelo via Promise.all para maximizar a performance de carregamento.
 */

import { create } from 'zustand';
import { api, ApiError } from '@/lib/api';
import type { DashboardSummary, ChartData, LowStockItem } from '@/types';

/**
 * @description Define o esquema de estado reativo para a Dashboard.
 */
interface DashboardState {
  summary: DashboardSummary | null;
  chart: ChartData[];
  lowStock: LowStockItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * @description Define as ações disponíveis para mutação do estado da Dashboard.
 */
interface DashboardActions {
  fetchDashboardData: () => Promise<void>;
  clearError: () => void;
}

/**
 * @description Hook Zustand para gerenciamento global de estado da Dashboard.
 * Mantém em sincronia o resumo financeiro, os dados do gráfico e a lista de itens
 * em estoque crítico. Executa as três requisições ao backend em paralelo para maximizar a performance.
 */
export const useDashboardStore = create<DashboardState & DashboardActions>()(
  (set) => ({
    summary: null,
    chart: [],
    lowStock: [],
    isLoading: true,
    error: null,

    clearError: () => set({ error: null }),

    fetchDashboardData: async () => {
      try {
        set({ isLoading: true, error: null });

        /** 
         * Orquestração paralela das queries analíticas (Summary, Chart, Critical).
         * Mitiga waterfalling effects e otimiza a latência agregada da renderização do painel.
         */
        const [summaryResponse, chartResponse, lowStockResponse] =
          await Promise.all([
            api.get<DashboardSummary>('/dashboard/summary'),
            api.get<ChartData[]>('/dashboard/chart'),
            api.get<LowStockItem[]>('/dashboard/low-stock'),
          ]);

        set({
          summary: summaryResponse,
          chart: chartResponse,
          lowStock: lowStockResponse,
          isLoading: false,
        });
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Erro ao carregar os dados da Dashboard';
        set({ error: message, isLoading: false });
        throw err;
      }
    },
  }),
);
