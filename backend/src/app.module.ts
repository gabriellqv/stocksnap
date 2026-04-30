import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { MovementsModule } from './movements/movements.module';

/**
 * @description Módulo raiz da aplicação StockSnap.
 *
 * Atua como ponto de composição central do NestJS, orquestrando o registro
 * de todos os módulos de domínio da aplicação. Conforme novos módulos
 * são adicionados (Movements, Dashboard, etc.), devem ser importados aqui.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    MovementsModule,
  ],
})
export class AppModule {}
