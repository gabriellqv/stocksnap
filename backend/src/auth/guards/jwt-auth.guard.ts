import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * @description Guardião de Rotas Baseado em JWT.
 * Atua como interceptador no pipeline de execução do NestJS, bloqueando
 * o acesso a endpoints caso o consumidor não forneça um token JWT válido.
 *
 * @example
 * \@UseGuards(JwtAuthGuard)
 * \@Get('profile')
 * getProfile() { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
