import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface RequestWithUser {
  user?: { role: Role };
}

/**
 * @description Guardião de autorização baseado em papéis (Role-Based Access Control).
 * Verifica se o usuário autenticado possui o papel exigido pelo decorator `@Roles()`.
 * Se a rota não possuir o decorator, o acesso é permitido por padrão.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Se a rota não tiver o decorator @Roles, permite o acesso.
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado.');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Você não tem permissão para executar esta ação.',
      );
    }

    return true;
  }
}
