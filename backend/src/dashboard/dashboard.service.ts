import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import type {
  DashboardSummaryResponse,
  ChartDataPoint,
  LowStockItemResponse,
} from './interfaces/dashboard-response.interface';

/**
 * @description Serviço responsável pelas queries de agregação do dashboard.
 * Implementa uma camada de cache Redis (TTL: 60s) sobre as queries pesadas,
 * garantindo que o banco não seja sobrecarregado por múltiplos acessos simultâneos.
 * O cache é invalidado automaticamente após cada nova movimentação de estoque.
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * @description Retorna as métricas principais do dashboard: total de produtos,
   * valor total em estoque, contagem de itens críticos e movimentações do dia.
   * Calcula também o comparativo de movimentações do dia anterior (Delta) e o
   * produto com mais saídas nos últimos 7 dias (Top Product).
   * O resultado é cacheado por 60 segundos para evitar queries repetidas.
   *
   * @returns {Promise<DashboardSummaryResponse>} Objeto com as métricas do painel.
   */
  async getSummary(): Promise<DashboardSummaryResponse> {
    const cacheKey = 'dashboard:summary';
    const cached =
      await this.cacheManager.get<DashboardSummaryResponse>(cacheKey);
    if (cached) return cached;

    const totalProducts = await this.prisma.product.count();

    const products = await this.prisma.product.findMany({
      select: { quantity: true, sellPrice: true },
    });
    const totalValue = products.reduce(
      (sum, p) => sum + p.quantity * Number(p.sellPrice),
      0,
    );

    const criticalCount = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM products WHERE quantity <= min_quantity
    `;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [todayMovements, yesterdayMovements] = await Promise.all([
      this.prisma.movement.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.movement.count({
        where: { createdAt: { gte: yesterday, lt: today } },
      }),
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Produto com mais saídas (EXIT) nos últimos 7 dias
    const topExit = await this.prisma.movement.groupBy({
      by: ['productId'],
      where: { type: 'EXIT', createdAt: { gte: sevenDaysAgo } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 1,
    });

    let topProduct: { name: string; quantity: number } | null = null;
    if (topExit.length > 0) {
      const productInfo = await this.prisma.product.findUnique({
        where: { id: topExit[0].productId },
        select: { name: true },
      });
      if (productInfo) {
        topProduct = {
          name: productInfo.name,
          quantity: topExit[0]._sum.quantity || 0,
        };
      }
    }

    const result: DashboardSummaryResponse = {
      totalProducts,
      totalValue: Math.round(totalValue * 100) / 100,
      criticalItems: Number(criticalCount[0].count),
      todayMovements,
      yesterdayMovements,
      topProduct,
    };

    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }

  /**
   * @description Retorna os dados do gráfico de movimentações agrupados por dia
   * para os últimos 7 dias. Todos os dias do período são incluídos no resultado,
   * mesmo que não haja movimentações naquele dia (valores zerados).
   * O resultado é cacheado por 60 segundos.
   *
   * @returns {Promise<ChartDataPoint[]>} Array de objetos com `date`, `entries` e `exits` para cada dia.
   */
  async getChart(): Promise<ChartDataPoint[]> {
    const cacheKey = 'dashboard:chart';
    const cached = await this.cacheManager.get<ChartDataPoint[]>(cacheKey);
    if (cached) return cached;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const movements = await this.prisma.movement.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { type: true, quantity: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const chartData: Record<
      string,
      { date: string; entries: number; exits: number }
    > = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      chartData[key] = { date: key, entries: 0, exits: 0 };
    }

    for (const m of movements) {
      const key = m.createdAt.toISOString().split('T')[0];
      if (chartData[key]) {
        if (m.type === 'ENTRY') {
          chartData[key].entries += m.quantity;
        } else {
          chartData[key].exits += m.quantity;
        }
      }
    }

    const result = Object.values(chartData);
    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }

  /**
   * @description Retorna os produtos com estoque igual ou abaixo do mínimo definido,
   * ordenados pelo mais crítico primeiro (menor proporção `quantity/minQuantity`).
   * Utiliza raw query pois o Prisma não suporta comparar dois campos da mesma tabela.
   * O resultado é cacheado por 60 segundos.
   *
   * @returns {Promise<LowStockItemResponse[]>} Array de produtos com estoque crítico.
   */
  async getLowStock(): Promise<LowStockItemResponse[]> {
    const cacheKey = 'dashboard:low-stock';
    const cached =
      await this.cacheManager.get<LowStockItemResponse[]>(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.$queryRaw<LowStockItemResponse[]>`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.quantity,
        p.min_quantity as "minQuantity",
        c.name as "categoryName"
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.quantity <= p.min_quantity
      ORDER BY (p.quantity::float / NULLIF(p.min_quantity, 0)) ASC
    `;

    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }
}
