import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * @description Filtro global de exceções.
 *
 * Centraliza o tratamento de erros para evitar que detalhes internos (stack traces,
 * mensagens do Prisma, caminhos de arquivo) vazem na resposta HTTP — especialmente
 * em produção. Erros `HttpException` preservam o status e a mensagem intencionais;
 * qualquer outro erro é registrado integralmente no log do servidor e devolvido
 * ao cliente como um 500 genérico.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  /**
   * @description Intercepta toda exceção não tratada e formata a resposta.
   *
   * @param {unknown} exception - A exceção lançada em qualquer ponto da requisição.
   * @param {ArgumentsHost} host - Contexto de execução do NestJS.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (isHttpException) {
      const exceptionResponse = exception.getResponse();
      response
        .status(status)
        .json(
          typeof exceptionResponse === 'object'
            ? exceptionResponse
            : { statusCode: status, message: exception.message },
        );
      return;
    }

    // Erro inesperado: loga o detalhe completo no servidor, mas não o expõe ao cliente.
    this.logger.error(
      `Erro não tratado em ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      statusCode: status,
      message: 'Erro interno do servidor',
    });
  }
}
