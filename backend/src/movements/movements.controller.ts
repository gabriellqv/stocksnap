import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { QueryMovementDto } from './dto/query-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * @description Controller responsável pelos endpoints REST do módulo de movimentações.
 * Todas as rotas são protegidas por autenticação JWT. O `@CurrentUser` decorator
 * extrai o payload do token JWT para obter o `userId` sem que o cliente precise enviá-lo.
 */
@Controller('movements')
@UseGuards(JwtAuthGuard)
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  /**
   * @description Registra uma nova movimentação de estoque.
   * O `userId` é extraído automaticamente do token JWT via `@CurrentUser` decorator,
   * impedindo que um cliente forje o ID do responsável pela operação.
   *
   * @param {CreateMovementDto} dto - Corpo da requisição com tipo, quantidade, motivo e produto.
   * @param {{ id: string }} user - Payload do JWT injetado pelo decorator `@CurrentUser`.
   * @returns {Promise<unknown>} A movimentação criada e o saldo atualizado do produto.
   */
  @Post()
  create(@Body() dto: CreateMovementDto, @CurrentUser() user: { id: string }) {
    return this.movementsService.create(dto, user.id);
  }

  /**
   * @description Retorna uma lista paginada de movimentações com suporte a filtros.
   *
   * @param {QueryMovementDto} query - Query params: `productId`, `type`, `page`, `limit`.
   * @returns {Promise<unknown>} Objeto com `data` e `meta` de paginação.
   */
  @Get()
  findAll(@Query() query: QueryMovementDto) {
    return this.movementsService.findAll(query);
  }
}
