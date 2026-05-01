import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

/**
 * @description Módulo de domínio responsável pelo encapsulamento do CRUD de produtos.
 * Orquestra o registro do controller e do service de produtos, incluindo suporte
 * a paginação, busca textual e validação de integridade referencial (SKU único, categoria válida).
 */
@Module({
  imports: [CacheModule.register()],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
