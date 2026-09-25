import { Prisma } from '@prisma/client';

/**
 * @description Código de erro do Prisma para violação de constraint única (P2002).
 * Referência: https://www.prisma.io/docs/orm/reference/error-reference
 */
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

/**
 * @description Verifica se um erro lançado pelo Prisma corresponde a uma violação
 * de constraint única (P2002). Esse erro ocorre quando duas requisições concorrentes
 * passam pela checagem de unicidade (read → check → write) e a segunda colide na
 * constraint do banco. Sem esse tratamento, a corrida vira um HTTP 500 genérico;
 * com ele, retornamos 409 Conflict de forma determinística.
 *
 * @param {unknown} error - O erro capturado no catch.
 * @returns {boolean} `true` se for uma violação de unicidade do Prisma.
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  );
}

/**
 * @description Extrai o nome do campo/índice que sofreu a colisão a partir do
 * metadado `target` do erro P2002, quando disponível.
 *
 * @param {unknown} error - O erro capturado no catch.
 * @returns {string[]} Lista de campos que compõem a constraint violada.
 */
export function uniqueConstraintTarget(error: unknown): string[] {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return [];
  }
  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.map(String);
  }
  return typeof target === 'string' ? [target] : [];
}
