import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

/**
 * @description Módulo raiz da aplicação StockSnap.
 *
 * Atua como ponto de composição central do NestJS, orquestrando o registro
 * de todos os controllers e providers da aplicação. Conforme o projeto
 * evolui, os módulos de domínio (Auth, Products, Categories, etc.)
 * devem ser importados aqui através do array `imports`.
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
