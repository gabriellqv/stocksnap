import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { QueryMovementDto } from './dto/query-movement.dto';

/**
 * @description Serviço responsável pela lógica de negócios do módulo de movimentações.
 * Implementa o registro de entradas e saídas de estoque com transação atômica via
 * `prisma.$transaction`, garantindo que o registro da movimentação e a atualização
 * do saldo de estoque do produto ocorram de forma indivisível.
 */
@Injectable()
export class MovementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description Registra uma nova movimentação de estoque (entrada ou saída) utilizando
   * transação atômica. Valida a existência do produto e, em caso de saída, verifica
   * se há saldo suficiente antes de iniciar a transação.
   *
   * @param {CreateMovementDto} dto - Payload com tipo, quantidade, motivo e ID do produto.
   * @param {string} userId - ID do usuário autenticado, extraído do token JWT pelo guard.
   * @returns {Promise<unknown>} Objeto contendo a movimentação criada e o saldo atualizado (`updatedStock`).
   * @throws {NotFoundException} Se o produto informado não existir.
   * @throws {BadRequestException} Se o tipo for EXIT e a quantidade solicitada superar o saldo.
   */
  async create(dto: CreateMovementDto, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (dto.type === MovementType.EXIT) {
      if (product.quantity < dto.quantity) {
        throw new BadRequestException(
          `Quantidade insuficiente. Estoque atual: ${product.quantity}, ` +
          `solicitado: ${dto.quantity}`,
        );
      }
    }

    // TRANSAÇÃO ATÔMICA: criação da movimentação + atualização do saldo
    // acontecem juntas ou nenhuma é persistida.
    const result = await this.prisma.$transaction(async (tx) => {
      const movement = await tx.movement.create({
        data: {
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason,
          productId: dto.productId,
          userId: userId,
        },
        include: {
          product: { select: { name: true, sku: true } },
          user: { select: { name: true } },
        },
      });

      // ENTRY: incrementa | EXIT: decrementa (increment com negativo)
      const quantityChange = dto.type === MovementType.ENTRY
        ? dto.quantity
        : -dto.quantity;

      const updatedProduct = await tx.product.update({
        where: { id: dto.productId },
        data: { quantity: { increment: quantityChange } },
      });

      return {
        movement,
        updatedStock: updatedProduct.quantity,
      };
    });

    return result;
  }

  /**
   * @description Retorna uma lista paginada de movimentações com suporte a filtros.
   * Executa busca e contagem em paralelo via `Promise.all` para minimizar latência.
   * Movimentações são ordenadas da mais recente para a mais antiga.
   *
   * @param {QueryMovementDto} query - Filtros (`productId`, `type`) e parâmetros de paginação.
   * @returns {Promise<unknown>} Objeto com `data` (movimentações da página) e `meta` (paginação).
   */
  async findAll(query: QueryMovementDto) {
    const { productId, type, page = 1, limit = 20 } = query;

    const where: any = {};

    if (productId) where.productId = productId;
    if (type) where.type = type;

    const [movements, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        include: {
          product: { select: { name: true, sku: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.movement.count({ where }),
    ]);

    return {
      data: movements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
