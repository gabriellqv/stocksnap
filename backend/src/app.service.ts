import { Injectable } from '@nestjs/common';

/**
 * @description Serviço raiz da aplicação StockSnap.
 *
 * Encapsula a lógica de negócio do controller principal. Nesta fase inicial,
 * fornece apenas o endpoint de health check. Conforme os módulos de domínio
 * forem criados, este serviço permanecerá restrito a responsabilidades
 * transversais da aplicação (ex: status geral, versão da API).
 */
@Injectable()
export class AppService {
  /**
   * @description Retorna a mensagem padrão de health check da API.
   * @returns {string} Texto confirmando que o serviço está operacional.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
