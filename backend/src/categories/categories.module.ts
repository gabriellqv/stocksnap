import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

/**
 * @description Módulo de domínio responsável pelo encapsulamento do CRUD de categorias.
 * Registra o controller e o service de categorias no container de injeção de dependências.
 */
@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
