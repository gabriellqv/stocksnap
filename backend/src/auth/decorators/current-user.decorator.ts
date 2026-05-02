import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @description Parameter Decorator customizado para injeção de dependência do usuário autenticado.
 * Extrai o objeto `user` populado pela `JwtStrategy` a partir do contexto de execução HTTP.
 *
 * @example
 * \@Get('me')
 * getProfile(\@CurrentUser() user: unknown) {
 *   return user;
 * }
 *
 * @param {unknown} data - Propriedade específica do usuário a ser extraída (opcional).
 * @param {ExecutionContext} ctx - Contexto de execução da requisição HTTP no NestJS.
 * @returns {unknown} Objeto do usuário autenticado validado.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: unknown }>();
    return request.user;
  },
);
