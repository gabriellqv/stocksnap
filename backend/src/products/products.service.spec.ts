import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;
  let cacheManager: any;

  const mockPrisma = {
    product: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    movement: {
      count: jest.fn(),
    },
  };

  const mockCache = {
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um produto e invalidar o cache', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });

      const dto = {
        name: 'Produto X',
        sku: 'SKU-001',
        costPrice: 10,
        sellPrice: 20,
        categoryId: 'cat-1',
      };

      mockPrisma.product.create.mockResolvedValue({ id: 'prod-1', ...dto });

      const result = await service.create(dto);

      expect(prisma.product.create).toHaveBeenCalledWith({ data: dto, include: { category: true } });
      expect(cacheManager.del).toHaveBeenCalledWith('dashboard:summary');
      expect(cacheManager.del).toHaveBeenCalledWith('dashboard:low-stock');
      expect(result.id).toEqual('prod-1');
    });

    it('deve lançar ConflictException se SKU já existir', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'prod-1' });

      await expect(service.create({ sku: 'SKU-001', name: 'X', costPrice: 10, sellPrice: 20, categoryId: 'cat-1' })).rejects.toThrow(ConflictException);
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se a categoria não existir', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      mockPrisma.category.findUnique.mockResolvedValue(null); // Categoria não existe

      await expect(service.create({ sku: 'SKU-001', name: 'X', costPrice: 10, sellPrice: 20, categoryId: 'cat-invalid' })).rejects.toThrow(NotFoundException);
      expect(prisma.product.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve lançar ConflictException ao atualizar para um SKU que já pertence a outro produto', async () => {
      // O produto que estamos atualizando (retornado pelo findOneOrFail)
      mockPrisma.product.findUnique.mockResolvedValueOnce({ id: 'prod-1', sku: 'SKU-001' });
      // O check de duplicidade no update usa findFirst com NOT id
      mockPrisma.product.findFirst.mockResolvedValueOnce({ id: 'prod-2', sku: 'SKU-002' });

      await expect(service.update('prod-1', { sku: 'SKU-002' })).rejects.toThrow(ConflictException);
      expect(prisma.product.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve deletar um produto e invalidar o cache', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'prod-1' });
      mockPrisma.movement.count.mockResolvedValue(0);
      mockPrisma.product.delete.mockResolvedValue({ id: 'prod-1' });

      await service.remove('prod-1');

      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
      expect(cacheManager.del).toHaveBeenCalledWith('dashboard:summary');
      expect(cacheManager.del).toHaveBeenCalledWith('dashboard:low-stock');
    });
  });
});
