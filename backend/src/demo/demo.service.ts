import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { restoreDemoData } from './demo-seed';
import type { DemoResetResult } from './demo-seed';

export type { DemoResetResult };

/**
 * @description Serviço responsável por restaurar o banco ao estado de demonstração.
 *
 * Como o ambiente de portfólio expõe uma conta ADMIN pública, qualquer visitante
 * pode alterar ou apagar os dados. Este serviço permite reconstruir o estado
 * conhecido com uma única chamada, sem exigir acesso ao banco.
 *
 * A operação é idempotente: apaga os dados de domínio e recria o dataset canônico,
 * preservando os usuários existentes.
 */
@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * @description Restaura categorias, produtos e movimentações ao estado inicial.
   *
   * As senhas são aleatórias e nunca aplicadas, pois os usuários já existem
   * (`upsert` com `update: {}` não altera a senha). Isso evita manter qualquer
   * credencial fixa no caminho do endpoint.
   *
   * @returns {Promise<DemoResetResult>} Contagem dos registros recriados.
   */
  async reset(): Promise<DemoResetResult> {
    const result = await restoreDemoData(this.prisma, {
      adminPassword: randomBytes(18).toString('base64url'),
      operatorPassword: randomBytes(18).toString('base64url'),
    });

    this.logger.log(
      `Dados de demonstração restaurados: ${result.categories} categorias, ` +
        `${result.products} produtos, ${result.movements} movimentações.`,
    );

    return result;
  }
}
