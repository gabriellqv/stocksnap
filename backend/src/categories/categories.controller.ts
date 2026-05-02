import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type {
  CategoryResponse,
  CategoryWithCountResponse,
} from './interfaces/category-response.interface';

/**
 * @description Controller responsável pelos endpoints REST do módulo de categorias.
 * Todas as rotas são protegidas por autenticação JWT.
 */
@ApiTags('Categorias')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * @description Retorna a lista completa de categorias.
   *
   * @returns {Promise<CategoryWithCountResponse[]>} Array de categorias com contagem de produtos.
   */
  @ApiOperation({ summary: 'Listar todas as categorias' })
  @Get()
  findAll(): Promise<CategoryWithCountResponse[]> {
    return this.categoriesService.findAll();
  }

  /**
   * @description Cria uma nova categoria.
   *
   * @param {CreateCategoryDto} dto - Corpo da requisição validado com o nome da categoria.
   * @returns {Promise<CategoryResponse>} A categoria recém-criada.
   */
  @ApiOperation({ summary: 'Criar nova categoria' })
  @Post()
  create(@Body() dto: CreateCategoryDto): Promise<CategoryResponse> {
    return this.categoriesService.create(dto);
  }

  /**
   * @description Atualiza parcialmente uma categoria existente.
   *
   * @param {string} id - UUID da categoria a ser atualizada (path param).
   * @param {UpdateCategoryDto} dto - Corpo da requisição com os campos a alterar.
   * @returns {Promise<CategoryResponse>} A categoria com os dados atualizados.
   */
  @ApiOperation({ summary: 'Atualizar categoria' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    return this.categoriesService.update(id, dto);
  }

  /**
   * @description Remove uma categoria pelo ID.
   *
   * @param {string} id - UUID da categoria a ser removida (path param).
   * @returns {Promise<CategoryResponse>} A categoria removida.
   */
  @ApiOperation({ summary: 'Deletar categoria' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<CategoryResponse> {
    return this.categoriesService.remove(id);
  }
}
