import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * @description Decorator para definir quais papéis (roles) são permitidos em uma rota.
 * Pode ser aplicado em classes (controllers) ou métodos.
 *
 * @param {...Role[]} roles - Lista de papéis permitidos.
 * @returns {CustomDecorator<string>} O decorator configurado.
 */
export const Roles = (...roles: Role[]): CustomDecorator =>
  SetMetadata(ROLES_KEY, roles);
