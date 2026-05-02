import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar uma categoria se o nome for único', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      const payload = { name: 'Eletrônicos' };
      const createdCategory = { id: 'uuid', name: 'Eletrônicos' };
      mockPrismaService.category.create.mockResolvedValue(createdCategory);

      const result = await service.create(payload);

      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { name: 'Eletrônicos' },
      });
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: payload,
      });
      expect(result).toEqual(createdCategory);
    });

    it('deve lançar ConflictException se o nome já existir', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: 'uuid',
        name: 'Eletrônicos',
      });

      const payload = { name: 'Eletrônicos' };

      await expect(service.create(payload)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.category.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar a categoria se o nome novo for único', async () => {
      const existingCategory = { id: 'uuid-1', name: 'Eletrônicos Velho' };

      // Simula que a categoria existe (findOneOrFail)
      mockPrismaService.category.findUnique
        .mockResolvedValueOnce(existingCategory) // Para o findOneOrFail
        .mockResolvedValueOnce(null); // Para a checagem de duplicidade do novo nome

      const payload = { name: 'Eletrônicos Novo' };
      const updatedCategory = { id: 'uuid-1', name: 'Eletrônicos Novo' };
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update('uuid-1', payload);

      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: payload,
      });
      expect(result).toEqual(updatedCategory);
    });

    it('deve lançar NotFoundException se tentar atualizar categoria inexistente', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'Teste' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.category.update).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException ao tentar renomear para um nome já existente', async () => {
      const existingCategory = { id: 'uuid-1', name: 'Eletrônicos' };
      const anotherCategory = { id: 'uuid-2', name: 'Móveis' };

      // Simula encontrar a categoria original, depois encontra que o novo nome já pertence a outra categoria
      mockPrismaService.category.findUnique
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce(anotherCategory);

      await expect(
        service.update('uuid-1', { name: 'Móveis' }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.category.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover a categoria se não houver produtos vinculados', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: 'uuid-1',
        name: 'Eletrônicos',
      });
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.category.delete.mockResolvedValue({
        id: 'uuid-1',
        name: 'Eletrônicos',
      });

      const result = await service.remove('uuid-1');

      expect(mockPrismaService.product.count).toHaveBeenCalledWith({
        where: { categoryId: 'uuid-1' },
      });
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
      expect(result).toEqual({ id: 'uuid-1', name: 'Eletrônicos' });
    });

    it('deve lançar ConflictException se tentar remover categoria com produtos vinculados', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: 'uuid-1',
        name: 'Eletrônicos',
      });
      mockPrismaService.product.count.mockResolvedValue(5); // 5 produtos vinculados

      await expect(service.remove('uuid-1')).rejects.toThrow(ConflictException);
      expect(mockPrismaService.category.delete).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException ao tentar deletar categoria inexistente', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.product.count).not.toHaveBeenCalled();
    });
  });
});
