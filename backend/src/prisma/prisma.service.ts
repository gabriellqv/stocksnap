import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * @description Serviço injetável que encapsula o Prisma Client para o NestJS.
 *
 * Extende `PrismaClient` diretamente, herdando todos os métodos de query
 * tipados gerados a partir do `schema.prisma`. Implementa os hooks de
 * ciclo de vida do NestJS para gerenciar a conexão com o PostgreSQL
 * de forma determinística: abre ao iniciar, fecha ao encerrar.
 *
 * @example
 * // Injetar em qualquer service via construtor:
 * constructor(private readonly prisma: PrismaService) {}
 *
 * // Utilizar queries tipadas:
 * const users = await this.prisma.user.findMany();
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * @description Estabelece a conexão com o PostgreSQL quando o módulo
   * é inicializado pelo container de injeção de dependências do NestJS.
   * @returns {Promise<void>}
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * @description Encerra a conexão com o PostgreSQL de forma limpa quando
   * a aplicação recebe sinal de shutdown (SIGTERM, SIGINT).
   * @returns {Promise<void>}
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
