import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { restoreDemoData } from './demo-seed';

/**
 * @description Entrypoint CLI do seed, executado como parte do container.
 *
 * Resolve as credenciais a partir do ambiente e delega ao `restoreDemoData`
 * compartilhado com o endpoint `POST /demo/reset`, garantindo paridade entre
 * o seed de boot e o reset em runtime.
 *
 * A senha do admin tem um default público e documentado (`admin123`) para que
 * a demonstração online seja acessível; sobrescreva com `ADMIN_PASSWORD`.
 */
function resolveAdminPassword(): string {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }

  console.warn(
    '⚠️  ADMIN_PASSWORD não definido. Usando a credencial PÚBLICA de demonstração (admin123).',
  );
  console.warn('   Defina ADMIN_PASSWORD para usar uma senha privada.');
  return 'admin123';
}

/**
 * @description Executa a restauração do dataset de demonstração.
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    // Bootstrap idempotente: em um banco já populado o seed não faz nada, para
    // não sobrescrever dados existentes a cada restart. A restauração completa
    // é responsabilidade do endpoint `POST /demo/reset`.
    const existingProducts = await prisma.product.count();
    if (existingProducts > 0) {
      console.log(
        `⚡ Banco já possui ${existingProducts} produto(s); seed ignorado.`,
      );
      return;
    }

    console.log('🌱 Iniciando seed...');
    const result = await restoreDemoData(prisma, {
      adminPassword: resolveAdminPassword(),
      operatorPassword:
        process.env.OPERATOR_PASSWORD ?? randomBytes(18).toString('base64url'),
    });
    console.log(
      `🌱 Seed concluído: ${result.categories} categorias, ` +
        `${result.products} produtos, ${result.movements} movimentações.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e: unknown) => {
  console.error('❌ Erro no seed:', e);
  process.exit(1);
});
