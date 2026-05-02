import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Prisma } from '@prisma/client';
import type {
  ProductResponse,
  ProductDetailResponse,
  PaginatedResponse,
} from './interfaces/product-response.interface';

/**
 * @description Serviço responsável pela lógica de negócios do módulo de produtos.
 * Orquestra o CRUD completo com suporte a paginação, busca textual e filtros,
 * além de garantir integridade referencial (SKU único, categoria válida,
 * bloqueio de exclusão de produtos com histórico de movimentações).
 */
@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * @description Retorna uma lista paginada de produtos com suporte a filtros.
   * Executa a busca de dados e a contagem total em paralelo via `Promise.all`
   * para minimizar a latência da consulta.
   *
   * @param {QueryProductDto} query - Filtros e parâmetros de paginação.
   * @returns {Promise<PaginatedResponse<ProductResponse>>} Objeto com `data` (produtos da página) e `meta` (paginação).
   */
  async findAll(
    query: QueryProductDto,
  ): Promise<PaginatedResponse<ProductResponse>> {
    const { search, categoryId, page = 1, limit = 10 } = query;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
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
   * @returns {Promise<ProductDetailResponse>} O produto com categoria e histórico de movimentações.
   * @throws {NotFoundException} Se o produto não for encontrado.
   */
  async findOne(id: string): Promise<ProductDetailResponse> {
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
   * @returns {Promise<ProductResponse>} O produto recém-criado com os dados da categoria.
   * @throws {ConflictException} Se o SKU já estiver em uso por outro produto.
   * @throws {NotFoundException} Se a categoria informada não existir.
   */
  async create(dto: CreateProductDto): Promise<ProductResponse> {
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

    const newProduct = await this.prisma.product.create({
      data: dto,
      include: { category: true },
    });

    await this.cacheManager.del('dashboard:summary');
    await this.cacheManager.del('dashboard:low-stock');

    return newProduct;
  }

  /**
   * @description Atualiza parcialmente os dados de um produto.
   * Se o SKU for alterado, valida que o novo valor não conflita com outro produto.
   *
   * @param {string} id - Identificador único (UUID) do produto a ser atualizado.
   * @param {UpdateProductDto} dto - Payload com os campos a serem alterados.
   * @returns {Promise<ProductResponse>} O produto com os dados atualizados.
   * @throws {NotFoundException} Se o produto não for encontrado.
   * @throws {ConflictException} Se o novo SKU já estiver em uso por outro produto.
   */
  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    await this.findOneOrFail(id);

    if (dto.sku) {
      const existing = await this.prisma.product.findFirst({
        where: { sku: dto.sku, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`SKU "${dto.sku}" já está em uso`);
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });

    await this.cacheManager.del('dashboard:summary');
    await this.cacheManager.del('dashboard:low-stock');

    return updatedProduct;
  }

  /**
   * @description Remove um produto do banco de dados.
   * A exclusão é bloqueada se o produto possuir movimentações registradas,
   * garantindo a integridade do histórico de estoque.
   *
   * @param {string} id - Identificador único (UUID) do produto a ser removido.
   * @returns {Promise<ProductResponse>} O produto removido.
   * @throws {NotFoundException} Se o produto não for encontrado.
   * @throws {ConflictException} Se o produto possuir movimentações registradas.
   */
  async remove(id: string): Promise<ProductResponse> {
    await this.findOneOrFail(id);

    const movementsCount = await this.prisma.movement.count({
      where: { productId: id },
    });

    if (movementsCount > 0) {
      throw new ConflictException(
        `Não é possível deletar: produto tem ${movementsCount} movimentação(ões) registrada(s)`,
      );
    }

    const deletedProduct = await this.prisma.product.delete({
      where: { id },
      include: { category: true },
    });

    await this.cacheManager.del('dashboard:summary');
    await this.cacheManager.del('dashboard:low-stock');

    return deletedProduct;
  }

  /**
   * @description Busca um produto pelo ID e lança exceção se não encontrado.
   * Método auxiliar interno reutilizado pelas operações de update e remove.
   *
   * @param {string} id - Identificador único (UUID) do produto.
   * @returns {Promise<{ id: string }>} O produto encontrado.
   * @throws {NotFoundException} Se o produto não existir no banco de dados.
   */
  private async findOneOrFail(id: string): Promise<{ id: string }> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    return product;
  }
}
