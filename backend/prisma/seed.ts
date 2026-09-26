/**
 * @description Entrypoint de seed via Prisma CLI (`npx prisma db seed`).
 *
 * Delega para o módulo compartilhado em `src/demo/seed-cli.ts`, o mesmo usado
 * pelo container em produção. Assim, seed local e reset em runtime produzem
 * exatamente o mesmo estado.
 *
 * @example
 * // Popular o banco local:
 * npx prisma db seed
 *
 * // Com senha de admin customizada:
 * ADMIN_PASSWORD="minha-senha" npx prisma db seed
 */
import '../src/demo/seed-cli';
