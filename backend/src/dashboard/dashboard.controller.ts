import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * @description Controller responsável pelos endpoints de leitura do dashboard.
 * Todas as rotas são protegidas por JWT e retornam dados cacheados no Redis.
 */
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * @description Retorna as métricas resumidas do dashboard.
   *
   * @returns {Promise<unknown>} Objeto com `totalProducts`, `totalValue`, `criticalItems` e `todayMovements`.
   */
  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  /**
   * @description Retorna os dados do gráfico de movimentações dos últimos 7 dias.
   *
   * @returns {Promise<unknown>} Array de objetos `{ date, entries, exits }` por dia.
   */
  @Get('chart')
  getChart() {
    return this.dashboardService.getChart();
  }

  /**
   * @description Retorna os produtos com estoque igual ou abaixo do mínimo.
   *
   * @returns {Promise<unknown>} Array de itens críticos ordenados pelo mais crítico primeiro.
   */
  @Get('low-stock')
  getLowStock() {
    return this.dashboardService.getLowStock();
  }
}
