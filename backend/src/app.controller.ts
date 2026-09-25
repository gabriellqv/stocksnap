import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

/**
 * @description Controller raiz da aplicação StockSnap.
 *
 * Expõe endpoints de diagnóstico usados por health checks de container e
 * monitoramento. As rotas não exigem autenticação e não retornam dados sensíveis.
 */
@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * @description Health check simples, consumido pelo HEALTHCHECK do Docker.
   * @returns {string} Mensagem confirmando que o processo está operacional.
   */
  @ApiOperation({ summary: 'Health check do serviço' })
  @Get('health')
  getHealth(): string {
    return this.appService.getHello();
  }
}
