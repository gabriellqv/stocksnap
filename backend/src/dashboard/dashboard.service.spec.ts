import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MovementType } from '@prisma/client';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;
  let cacheManager: any;

  const mockPrisma = {
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    movement: {
      aggregate: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ count: 0n }]),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('deve retornar o sumário do dashboard e usar cache se disponível', async () => {
      const cachedSummary = { totalProducts: 10 };
      mockCache.get.mockResolvedValue(cachedSummary);

      const result = await service.getSummary();

      expect(cacheManager.get).toHaveBeenCalledWith('dashboard:summary');
      expect(result).toEqual(cachedSummary);
      expect(prisma.product.count).not.toHaveBeenCalled(); // Não deve bater no banco
    });

    it('deve calcular o sumário se o cache não existir', async () => {
      mockCache.get.mockResolvedValue(null);

      mockPrisma.product.count.mockResolvedValue(50);
      mockPrisma.product.findMany.mockResolvedValue([
        { sellPrice: 10, quantity: 5 }, // 50
        { sellPrice: 20, quantity: 2 }, // 40 (Total: 90)
      ]);
      mockPrisma.movement.count
        .mockResolvedValueOnce(5) // today
        .mockResolvedValueOnce(3); // yesterday

      mockPrisma.movement.groupBy = jest.fn().mockResolvedValue([
        { productId: 'prod-1', _sum: { quantity: 10 } }
      ]);
      mockPrisma.product.findUnique = jest.fn().mockResolvedValue({ name: 'Produto X' });

      const result = await service.getSummary();

      expect(prisma.product.count).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
      expect(result.totalProducts).toBe(50);
      expect(result.totalValue).toBe(90);
      expect(result.todayMovements).toBe(5);
      expect(result.yesterdayMovements).toBe(3);
      expect(result.topProduct).toEqual({ name: 'Produto X', quantity: 10 });
    });
  });
});
