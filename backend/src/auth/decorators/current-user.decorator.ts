/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @description Parameter Decorator customizado para injeção de dependência do usuário autenticado.
 * Extrai o objeto `user` populado pela `JwtStrategy` a partir do contexto de execução HTTP.
 *
 * @example
 * \@Get('me')
 * getProfile(\@CurrentUser() user: any) {
 *   return user;
 * }
 *
 * @param {unknown} data - Propriedade específica do usuário a ser extraída (opcional).
 * @param {ExecutionContext} ctx - Contexto de execução da requisição HTTP no NestJS.
 * @returns {any} Objeto do usuário autenticado validado.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
