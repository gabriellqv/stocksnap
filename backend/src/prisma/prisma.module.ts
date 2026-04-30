import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @description Módulo global de acesso ao banco de dados via Prisma.
 *
 * O decorator `@Global()` garante que o `PrismaService` fique disponível
 * em toda a aplicação sem necessidade de importação explícita em cada
 * módulo de domínio (Auth, Products, Categories, etc.).
 *
 * Essa decisão arquitetural evita imports repetitivos e centraliza
 * o ciclo de vida da conexão com o PostgreSQL em um único ponto.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
