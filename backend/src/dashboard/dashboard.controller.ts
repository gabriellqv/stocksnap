import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type {
  DashboardSummaryResponse,
  ChartDataPoint,
  LowStockItemResponse,
} from './interfaces/dashboard-response.interface';

/**
 * @description Controller responsável pelos endpoints de leitura do dashboard.
 * Todas as rotas são protegidas por JWT e retornam dados cacheados no Redis.
 */
@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * @description Retorna as métricas resumidas do dashboard.
   *
   * @returns {Promise<DashboardSummaryResponse>} Objeto com `totalProducts`, `totalValue`, `criticalItems` e `todayMovements`.
   */
  @ApiOperation({ summary: 'Obter métricas resumidas do dashboard' })
  @Get('summary')
  getSummary(): Promise<DashboardSummaryResponse> {
    return this.dashboardService.getSummary();
  }

  /**
   * @description Retorna os dados do gráfico de movimentações dos últimos 7 dias.
   *
   * @returns {Promise<ChartDataPoint[]>} Array de objetos `{ date, entries, exits }` por dia.
   */
  @ApiOperation({ summary: 'Obter dados do gráfico de movimentações (7 dias)' })
  @Get('chart')
  getChart(): Promise<ChartDataPoint[]> {
    return this.dashboardService.getChart();
  }

  /**
   * @description Retorna os produtos com estoque igual ou abaixo do mínimo.
   *
   * @returns {Promise<LowStockItemResponse[]>} Array de itens críticos ordenados pelo mais crítico primeiro.
   */
  @ApiOperation({ summary: 'Listar produtos com estoque crítico' })
  @Get('low-stock')
  getLowStock(): Promise<LowStockItemResponse[]> {
    return this.dashboardService.getLowStock();
  }
}
