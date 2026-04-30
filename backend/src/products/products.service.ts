import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

/**
 * @description Serviço responsável pela lógica de negócios do módulo de produtos.
 * Orquestra o CRUD completo com suporte a paginação, busca textual e filtros,
 * além de garantir integridade referencial (SKU único, categoria válida,
 * bloqueio de exclusão de produtos com histórico de movimentações).
 */
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description Retorna uma lista paginada de produtos com suporte a filtros.
   * Executa a busca de dados e a contagem total em paralelo via `Promise.all`
   * para minimizar a latência da consulta.
   *
   * @param {QueryProductDto} query - Filtros e parâmetros de paginação.
   * @returns {Promise<unknown>} Objeto com `data` (produtos da página) e `meta` (paginação).
   */
  async findAll(query: QueryProductDto) {
    const { search, categoryId, page = 1, limit = 10 } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * @description Retorna os detalhes completos de um produto, incluindo
   * sua categoria e as últimas 20 movimentações de estoque.
   *
   * @param {string} id - Identificador único (UUID) do produto.
   * @returns {Promise<unknown>} O produto com categoria e histórico de movimentações.
   * @throws {NotFoundException} Se o produto não for encontrado.
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        movements: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  /**
   * @description Cria um novo produto após validar a unicidade do SKU
   * e a existência da categoria informada.
   *
   * @param {CreateProductDto} dto - Payload com os dados do produto a ser criado.
   * @returns {Promise<unknown>} O produto recém-criado com os dados da categoria.
   * @throws {ConflictException} Se o SKU já estiver em uso por outro produto.
   * @throws {NotFoundException} Se a categoria informada não existir.
   */
  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });

    if (existing) {
      throw new ConflictException(`SKU "${dto.sku}" já está em uso`);
    }

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return this.prisma.product.create({
      data: dto,
      include: { category: true },
    });
  }

  /**
   * @description Atualiza parcialmente os dados de um produto.
   * Se o SKU for alterado, valida que o novo valor não conflita com outro produto.
   *
   * @param {string} id - Identificador único (UUID) do produto a ser atualizado.
   * @param {UpdateProductDto} dto - Payload com os campos a serem alterados.
   * @returns {Promise<unknown>} O produto com os dados atualizados.
   * @throws {NotFoundException} Se o produto não for encontrado.
   * @throws {ConflictException} Se o novo SKU já estiver em uso por outro produto.
   */
  async update(id: string, dto: UpdateProductDto) {
    await this.findOneOrFail(id);

    if (dto.sku) {
      const existing = await this.prisma.product.findFirst({
        where: { sku: dto.sku, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`SKU "${dto.sku}" já está em uso`);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  /**
   * @description Remove um produto do banco de dados.
   * A exclusão é bloqueada se o produto possuir movimentações registradas,
   * garantindo a integridade do histórico de estoque.
   *
   * @param {string} id - Identificador único (UUID) do produto a ser removido.
   * @returns {Promise<unknown>} O produto removido.
   * @throws {NotFoundException} Se o produto não for encontrado.
   * @throws {ConflictException} Se o produto possuir movimentações registradas.
   */
  async remove(id: string) {
    await this.findOneOrFail(id);

    const movementsCount = await this.prisma.movement.count({
      where: { productId: id },
    });

    if (movementsCount > 0) {
      throw new ConflictException(
        `Não é possível deletar: produto tem ${movementsCount} movimentação(ões) registrada(s)`,
      );
    }

    return this.prisma.product.delete({ where: { id } });
  }

  /**
   * @description Busca um produto pelo ID e lança exceção se não encontrado.
   * Método auxiliar interno reutilizado pelas operações de update e remove.
   *
   * @param {string} id - Identificador único (UUID) do produto.
   * @returns {Promise<unknown>} O produto encontrado.
   * @throws {NotFoundException} Se o produto não existir no banco de dados.
   */
  private async findOneOrFail(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    return product;
  }
}
