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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * @description Controller responsável pelos endpoints REST do módulo de categorias.
 * Todas as rotas são protegidas por autenticação JWT.
 */
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * @description Retorna a lista completa de categorias.
   *
   * @returns {Promise<unknown>} Array de categorias com contagem de produtos.
   */
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * @description Cria uma nova categoria.
   *
   * @param {CreateCategoryDto} dto - Corpo da requisição validado com o nome da categoria.
   * @returns {Promise<unknown>} A categoria recém-criada.
   */
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  /**
   * @description Atualiza parcialmente uma categoria existente.
   *
   * @param {string} id - UUID da categoria a ser atualizada (path param).
   * @param {UpdateCategoryDto} dto - Corpo da requisição com os campos a alterar.
   * @returns {Promise<unknown>} A categoria com os dados atualizados.
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  /**
   * @description Remove uma categoria pelo ID.
   *
   * @param {string} id - UUID da categoria a ser removida (path param).
   * @returns {Promise<unknown>} A categoria removida.
   */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
