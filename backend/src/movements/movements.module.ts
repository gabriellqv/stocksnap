import { Module } from '@nestjs/common';
import { MovementsController } from './movements.controller';
import { MovementsService } from './movements.service';

/**
 * @description Módulo de domínio responsável pelo registro de movimentações de estoque.
 * Encapsula a lógica de entradas e saídas com transações atômicas e
 * invalidação automática do cache do dashboard após cada operação.
 */
@Module({
  controllers: [MovementsController],
  providers: [MovementsService],
})
export class MovementsModule {}
