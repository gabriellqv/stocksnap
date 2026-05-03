import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import type {
  CategoryResponse,
  CategoryWithCountResponse,
} from './interfaces/category-response.interface';
import type { PaginatedResponse } from '../products/interfaces/product-response.interface';

/**
 * @description Serviço responsável pela lógica de negócios do módulo de categorias.
 * Orquestra as operações de CRUD, garantindo a integridade dos dados
 * (nome único) e a consistência referencial (impede exclusão de categorias
 * que possuam produtos vinculados).
 */
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description Retorna todas as categorias cadastradas, ordenadas alfabeticamente.
   * Inclui a contagem de produtos vinculados a cada categoria.
   *
   * @param {QueryCategoryDto} query - Filtros e parâmetros de paginação.
   * @returns {Promise<PaginatedResponse<CategoryWithCountResponse>>} Lista de categorias paginada.
   */
  async findAll(
    query: QueryCategoryDto,
  ): Promise<PaginatedResponse<CategoryWithCountResponse>> {
    const { search, page = 1, limit = 10 } = query;

    const where: Prisma.CategoryWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { products: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * @description Cria uma nova categoria após validar a unicidade do nome.
   *
   * @param {CreateCategoryDto} dto - Payload contendo o nome da categoria.
   * @returns {Promise<CategoryResponse>} A categoria recém-criada.
   * @throws {ConflictException} Se já existir uma categoria com o mesmo nome.
   */
  async create(dto: CreateCategoryDto): Promise<CategoryResponse> {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Categoria "${dto.name}" já existe`);
    }

    return this.prisma.category.create({ data: dto });
  }

  /**
   * @description Atualiza parcialmente os dados de uma categoria existente.
   *
   * @param {string} id - Identificador único (UUID) da categoria a ser atualizada.
   * @param {UpdateCategoryDto} dto - Payload com os campos a serem alterados.
   * @returns {Promise<CategoryResponse>} A categoria com os dados atualizados.
   * @throws {NotFoundException} Se a categoria não for encontrada.
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    await this.findOneOrFail(id);

    if (dto.name) {
      const existing = await this.prisma.category.findUnique({
        where: { name: dto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Categoria "${dto.name}" já existe`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * @description Remove uma categoria do banco de dados.
   * A exclusão é bloqueada se houver produtos vinculados à categoria,
   * protegendo a integridade referencial dos dados.
   *
   * @param {string} id - Identificador único (UUID) da categoria a ser removida.
   * @returns {Promise<CategoryResponse>} A categoria removida.
   * @throws {NotFoundException} Se a categoria não for encontrada.
   * @throws {ConflictException} Se existirem produtos vinculados à categoria.
   */
  async remove(id: string): Promise<CategoryResponse> {
    await this.findOneOrFail(id);

    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        `Não é possível deletar: ${productsCount} produto(s) vinculado(s)`,
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }

  /**
   * @description Busca uma categoria pelo ID e lança exceção se não encontrada.
   * Método auxiliar interno reutilizado pelas operações de update e remove.
   *
   * @param {string} id - Identificador único (UUID) da categoria.
   * @returns {Promise<CategoryResponse>} A categoria encontrada.
   * @throws {NotFoundException} Se a categoria não existir no banco de dados.
   */
  private async findOneOrFail(id: string): Promise<CategoryResponse> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return category;
  }
}
