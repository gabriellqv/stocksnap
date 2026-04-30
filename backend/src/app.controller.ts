import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * @description Controller raiz da aplicação StockSnap.
 *
 * Responsável por expor o endpoint de health check na rota base (`GET /api`).
 * Utilizado para verificar se o servidor está ativo e respondendo corretamente,
 * sendo consumido por ferramentas de monitoramento e pelo Docker healthcheck.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * @description Retorna uma mensagem de confirmação indicando que o servidor está operacional.
   * @returns {string} Mensagem de health check do serviço.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
