/**
 * @description Contrato de resposta para o endpoint `GET /dashboard/summary`.
 * Agrega as métricas KPI do painel principal: volume de produtos, valor financeiro,
 * alertas de estoque crítico, e comparativo de movimentações (hoje vs. ontem).
 */
export interface DashboardSummaryResponse {
  totalProducts: number;
  totalValue: number;
  criticalItems: number;
  todayMovements: number;
  yesterdayMovements: number;
  topProduct: {
    name: string;
    quantity: number;
  } | null;
}

/**
 * @description Contrato de resposta para o endpoint `GET /dashboard/chart`.
 * Representa um ponto no gráfico de movimentações diárias dos últimos 7 dias.
 */
export interface ChartDataPoint {
  date: string;
  entries: number;
  exits: number;
}

/**
 * @description Contrato de resposta para o endpoint `GET /dashboard/low-stock`.
 * Representa um produto com estoque igual ou abaixo do mínimo configurado.
 */
export interface LowStockItemResponse {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  categoryName: string;
}
