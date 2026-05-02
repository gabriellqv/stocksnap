import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * @description Controller responsável pelos endpoints REST do módulo de produtos.
 * Suporta listagem paginada com filtros via query params, além das operações
 * de CRUD completo. Todas as rotas são protegidas por autenticação JWT.
 */
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * @description Retorna uma lista paginada de produtos com suporte a filtros.
   *
   * @param {QueryProductDto} query - Query params: `search`, `categoryId`, `page`, `limit`.
   * @returns {Promise<unknown>} Objeto com `data` e `meta` de paginação.
   */
  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  /**
   * @description Retorna os detalhes de um produto, incluindo categoria e movimentações.
   *
   * @param {string} id - UUID do produto (path param).
   * @returns {Promise<unknown>} O produto com relacionamentos incluídos.
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * @description Cria um novo produto.
   *
   * @param {CreateProductDto} dto - Corpo da requisição com os dados do produto.
   * @returns {Promise<unknown>} O produto recém-criado.
   */
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  /**
   * @description Atualiza parcialmente um produto existente.
   *
   * @param {string} id - UUID do produto a ser atualizado (path param).
   * @param {UpdateProductDto} dto - Corpo da requisição com os campos a alterar.
   * @returns {Promise<unknown>} O produto com os dados atualizados.
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  /**
   * @description Remove um produto pelo ID.
   *
   * @param {string} id - UUID do produto a ser removido (path param).
   * @returns {Promise<unknown>} O produto removido.
   */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
