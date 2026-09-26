import type { PrismaClient, Prisma, Category, Product } from '@prisma/client';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  DEMO_ADMIN,
  DEMO_CATEGORIES,
  DEMO_MOVEMENTS,
  DEMO_OPERATOR,
  DEMO_PRODUCTS,
} from './demo-dataset';

/** Resultado da restauração, útil para feedback na UI e logs. */
export interface DemoResetResult {
  categories: number;
  products: number;
  movements: number;
  resetAt: string;
}

/** Senhas usadas ao (re)criar os usuários de demonstração. */
export interface DemoCredentials {
  adminPassword: string;
  operatorPassword: string;
}

/**
 * @description Restaura o banco ao estado canônico de demonstração.
 *
 * Compartilhado entre a CLI de seed (`prisma/seed.ts`) e o endpoint
 * `POST /demo/reset`, garantindo que ambos produzam exatamente o mesmo estado.
 *
 * Usuários são garantidos via `upsert` (sem sobrescrever a senha de um usuário
 * já existente), e os dados de domínio são recriados integralmente. A ordem de
 * exclusão respeita as FKs `RESTRICT`: movimentos → produtos → categorias.
 *
 * @param {PrismaClient} prisma - Client Prisma (ou transação) a utilizar.
 * @param {DemoCredentials} credentials - Senhas dos usuários de demonstração.
 * @returns {Promise<DemoResetResult>} Contagem dos registros recriados.
 */
export async function restoreDemoData(
  prisma: PrismaClient,
  credentials: DemoCredentials,
): Promise<DemoResetResult> {
  const admin = await prisma.user.upsert({
    where: { email: DEMO_ADMIN.email },
    update: {},
    create: {
      name: DEMO_ADMIN.name,
      email: DEMO_ADMIN.email,
      password: await bcrypt.hash(credentials.adminPassword, 10),
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: DEMO_OPERATOR.email },
    update: {},
    create: {
      name: DEMO_OPERATOR.name,
      email: DEMO_OPERATOR.email,
      password: await bcrypt.hash(credentials.operatorPassword, 10),
      role: Role.OPERATOR,
    },
  });

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.movement.deleteMany();
    await tx.product.deleteMany();
    await tx.category.deleteMany();

    const categories: Category[] = [];
    for (const name of DEMO_CATEGORIES) {
      categories.push(await tx.category.create({ data: { name } }));
    }

    const products: Product[] = [];
    for (const p of DEMO_PRODUCTS) {
      products.push(
        await tx.product.create({
          data: {
            name: p.name,
            sku: p.sku,
            costPrice: p.costPrice,
            sellPrice: p.sellPrice,
            quantity: p.quantity,
            minQuantity: p.minQuantity,
            categoryId: categories[p.categoryIndex].id,
          },
        }),
      );
    }

    for (const m of DEMO_MOVEMENTS) {
      await tx.movement.create({
        data: {
          type: m.type,
          quantity: m.quantity,
          reason: m.reason,
          productId: products[m.productIndex].id,
          userId: admin.id,
        },
      });
    }
  });

  return {
    categories: DEMO_CATEGORIES.length,
    products: DEMO_PRODUCTS.length,
    movements: DEMO_MOVEMENTS.length,
    resetAt: new Date().toISOString(),
  };
}
