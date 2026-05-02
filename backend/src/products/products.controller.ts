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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type {
  ProductResponse,
  ProductDetailResponse,
  PaginatedResponse,
} from './interfaces/product-response.interface';

/**
 * @description Controller responsável pelos endpoints REST do módulo de produtos.
 * Suporta listagem paginada com filtros via query params, além das operações
 * de CRUD completo. Todas as rotas são protegidas por autenticação JWT.
 */
@ApiTags('Produtos')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * @description Retorna uma lista paginada de produtos com suporte a filtros.
   *
   * @param {QueryProductDto} query - Query params: `search`, `categoryId`, `page`, `limit`.
   * @returns {Promise<PaginatedResponse<ProductResponse>>} Objeto com `data` e `meta` de paginação.
   */
  @ApiOperation({ summary: 'Listar produtos com filtros e paginação' })
  @Get()
  findAll(
    @Query() query: QueryProductDto,
  ): Promise<PaginatedResponse<ProductResponse>> {
    return this.productsService.findAll(query);
  }

  /**
   * @description Retorna os detalhes de um produto, incluindo categoria e movimentações.
   *
   * @param {string} id - UUID do produto (path param).
   * @returns {Promise<ProductDetailResponse>} O produto com relacionamentos incluídos.
   */
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductDetailResponse> {
    return this.productsService.findOne(id);
  }

  /**
   * @description Cria um novo produto.
   *
   * @param {CreateProductDto} dto - Corpo da requisição com os dados do produto.
   * @returns {Promise<ProductResponse>} O produto recém-criado.
   */
  @ApiOperation({ summary: 'Criar novo produto' })
  @Post()
  create(@Body() dto: CreateProductDto): Promise<ProductResponse> {
    return this.productsService.create(dto);
  }

  /**
   * @description Atualiza parcialmente um produto existente.
   *
   * @param {string} id - UUID do produto a ser atualizado (path param).
   * @param {UpdateProductDto} dto - Corpo da requisição com os campos a alterar.
   * @returns {Promise<ProductResponse>} O produto com os dados atualizados.
   */
  @ApiOperation({ summary: 'Atualizar produto' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponse> {
    return this.productsService.update(id, dto);
  }

  /**
   * @description Remove um produto pelo ID.
   *
   * @param {string} id - UUID do produto a ser removido (path param).
   * @returns {Promise<ProductResponse>} O produto removido.
   */
  @ApiOperation({ summary: 'Deletar produto' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponse> {
    return this.productsService.remove(id);
  }
}
