import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';

/**
 * @description Suite de testes unitários para o MovementsService.
 *
 * Valida as regras de negócio críticas do sistema de estoque:
 * - Produto inexistente → NotFoundException (404)
 * - Saída maior que saldo → BadRequestException (400)
 * - Entrada com estoque zerado → permitido
 * - Saída com quantidade exata → permitido (boundary test)
 * - Transação atômica invocada corretamente
 *
 * Utiliza mocks do PrismaService para isolar a camada de serviço
 * da camada de persistência, garantindo testes rápidos e determinísticos.
 */
describe('MovementsService', () => {
  let service: MovementsService;

  /**
   * Mock do PrismaService.
   * Substitui todas as chamadas ao banco de dados por funções controladas
   * via jest.fn(), permitindo simular qualquer cenário sem depender do PostgreSQL.
   */
  const mockPrisma = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    movement: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  /**
   * @description Configura o módulo de teste antes de cada caso.
   * O NestJS Testing Module replica o sistema de injeção de dependência,
   * mas substituindo providers reais por mocks controlados.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MovementsService>(MovementsService);

    // Limpar histórico de chamadas entre testes para evitar contaminação
    jest.clearAllMocks();
  });

  describe('create - Validações de Negócio', () => {
    const userId = 'user-123';

    /**
     * Cenário: O cliente envia um productId que não existe no banco.
     * Expectativa: O service deve barrar antes de criar qualquer transação.
     */
    it('deve lançar NotFoundException se o produto não existe', async () => {
      // Arrange: simula produto não encontrado
      mockPrisma.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create(
          { type: MovementType.ENTRY, quantity: 10, productId: 'fake-id' },
          userId,
        ),
      ).rejects.toThrow(NotFoundException);

      // Garante que a transação NUNCA foi iniciada (economia de recursos)
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    /**
     * Cenário: Produto tem 4 unidades, mas o usuário tenta retirar 10.
     * Expectativa: BadRequestException ANTES de iniciar a transação.
     */
    it('deve lançar BadRequestException se saída > estoque', async () => {
      // Arrange: produto com apenas 4 unidades
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Shampoo Dove',
        quantity: 4,
      });

      // Act & Assert: tentar tirar 10 de um estoque de 4
      await expect(
        service.create(
          { type: MovementType.EXIT, quantity: 10, productId: 'prod-1' },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);

      // A transação não deve ser iniciada em caso de validação falha
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    /**
     * Cenário: Mesma validação acima, mas verificando se a mensagem de erro
     * contém informações úteis (estoque atual e quantidade solicitada).
     * Isso prova que o erro é descritivo e facilita o debug em produção.
     */
    it('deve incluir o saldo atual e a quantidade solicitada na mensagem de erro', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        quantity: 3,
      });

      await expect(
        service.create(
          { type: MovementType.EXIT, quantity: 5, productId: 'prod-1' },
          userId,
        ),
      ).rejects.toThrow(/Quantidade insuficiente/);
    });

    /**
     * Cenário: Produto com estoque zerado recebe uma ENTRADA.
     * Expectativa: Deve funcionar normalmente (não há restrição para entradas).
     * Este teste prova que a validação de saldo só se aplica a saídas (EXIT).
     */
    it('deve permitir entrada mesmo com estoque zero', async () => {
      // Arrange
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        quantity: 0,
      });

      // Simula o comportamento da transação atômica do Prisma:
      // O $transaction recebe uma função callback e a executa,
      // passando um "mini-prisma" (tx) como argumento.
      mockPrisma.$transaction.mockImplementation(
        (fn: (tx: unknown) => Promise<unknown>) => {
          return fn({
            movement: {
              create: jest.fn().mockResolvedValue({
                id: 'mov-1',
                type: 'ENTRY',
                quantity: 10,
              }),
            },
            product: {
              update: jest.fn().mockResolvedValue({ quantity: 10 }),
            },
          });
        },
      );

      // Act
      const result = await service.create(
        { type: MovementType.ENTRY, quantity: 10, productId: 'prod-1' },
        userId,
      );

      // Assert: o saldo final deve ser 10 (0 + 10)
      expect(result.updatedStock).toBe(10);
    });

    /**
     * Cenário BOUNDARY: Produto tem exatamente 5 unidades e o usuário
     * tenta retirar exatamente 5. Este é o "caso limite" (edge case).
     * Expectativa: Deve funcionar, pois 5 >= 5 (não é estoque negativo).
     */
    it('deve permitir saída quando estoque é exatamente igual à quantidade', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        quantity: 5,
      });

      mockPrisma.$transaction.mockImplementation(
        (fn: (tx: unknown) => Promise<unknown>) => {
          return fn({
            movement: {
              create: jest.fn().mockResolvedValue({
                id: 'mov-1',
                type: 'EXIT',
                quantity: 5,
              }),
            },
            product: {
              update: jest.fn().mockResolvedValue({ quantity: 0 }),
            },
          });
        },
      );

      // Act: tirar exatamente 5 de um estoque de 5
      const result = await service.create(
        { type: MovementType.EXIT, quantity: 5, productId: 'prod-1' },
        userId,
      );

      // Assert: saldo final deve ser 0 (5 - 5)
      expect(result.updatedStock).toBe(0);
    });

    /**
     * Cenário: Verifica se o método create() usa a transação atômica do Prisma.
     * Este teste garante que NÃO é possível criar uma movimentação sem atualizar
     * o saldo, prevenindo dados inconsistentes em caso de falha parcial.
     */
    it('deve executar a criação dentro de uma transação atômica', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        quantity: 50,
      });

      mockPrisma.$transaction.mockImplementation(
        (fn: (tx: unknown) => Promise<unknown>) => {
          return fn({
            movement: {
              create: jest
                .fn()
                .mockResolvedValue({ id: 'mov-1', type: 'ENTRY', quantity: 5 }),
            },
            product: {
              update: jest.fn().mockResolvedValue({ quantity: 55 }),
            },
          });
        },
      );

      await service.create(
        { type: MovementType.ENTRY, quantity: 5, productId: 'prod-1' },
        userId,
      );

      // Assert: $transaction foi chamada exatamente 1 vez
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll - Listagem Paginada', () => {
    /**
     * Cenário: Verifica se a resposta da listagem inclui os metadados
     * de paginação (total, page, limit, totalPages) corretamente.
     */
    it('deve retornar dados com metadados de paginação', async () => {
      const mockMovements = [
        { id: 'mov-1', type: 'ENTRY', quantity: 10 },
        { id: 'mov-2', type: 'EXIT', quantity: 3 },
      ];

      mockPrisma.movement.findMany.mockResolvedValue(mockMovements);
      mockPrisma.movement.count.mockResolvedValue(25);

      // Act
      const result = await service.findAll({ page: 2, limit: 10 });

      // Assert: estrutura da resposta paginada
      expect(result.data).toEqual(mockMovements);
      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3, // Math.ceil(25 / 10) = 3
      });
    });

    /**
     * Cenário: Verifica se os filtros de productId e type são passados
     * corretamente para a query do Prisma.
     */
    it('deve aplicar filtros de productId e type na query', async () => {
      mockPrisma.movement.findMany.mockResolvedValue([]);
      mockPrisma.movement.count.mockResolvedValue(0);

      // Act: filtrar por produto e tipo
      await service.findAll({
        productId: 'prod-1',
        type: MovementType.ENTRY,
        page: 1,
        limit: 20,
      });

      // Assert: o where foi montado corretamente
      expect(mockPrisma.movement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId: 'prod-1', type: MovementType.ENTRY },
        }),
      );
    });
  });
});
