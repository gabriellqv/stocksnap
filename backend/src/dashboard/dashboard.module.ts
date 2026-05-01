import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

/**
 * @description Módulo de domínio responsável pelas queries de agregação do dashboard.
 * Fornece endpoints de leitura para métricas resumidas, gráficos de movimentação
 * e listagem de itens com estoque crítico, todos com cache Redis integrado.
 */
@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
