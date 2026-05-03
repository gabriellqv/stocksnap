/**
 * @description Script de seed para popular o banco de dados com dados iniciais.
 *
 * Cria um conjunto de dados realistas para desenvolvimento e demonstração:
 * 2 usuários (admin + operador), 5 categorias, 15 produtos distribuídos
 * entre as categorias e 6 movimentações de exemplo.
 *
 * Utiliza `upsert` em vez de `create` para garantir idempotência:
 * o script pode ser executado múltiplas vezes sem duplicar registros.
 *
 * @example
 * // Executar via Prisma CLI:
 * npx prisma db seed
 *
 * // Resetar o banco e re-popular:
 * npx prisma migrate reset
 */
import 'dotenv/config';
import { PrismaClient, Role, MovementType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * @description Função principal do seed que orquestra a criação sequencial
 * de usuários, categorias, produtos e movimentações.
 *
 * @throws {Error} Propaga erros do Prisma Client caso a conexão falhe
 * ou constraints do banco sejam violadas.
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  console.log('🌱 Iniciando seed...');

  // 1. Criar usuários
  const adminPassword = await bcrypt.hash('admin123', 10);
  const operatorPassword = await bcrypt.hash('operator123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stocksnap.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@stocksnap.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operador@stocksnap.com' },
    update: {},
    create: {
      name: 'Maria Operadora',
      email: 'operador@stocksnap.com',
      password: operatorPassword,
      role: Role.OPERATOR,
    },
  });

  console.log('✅ Usuários criados');

  // 2. Criar categorias
  const categorias = [
    'Higiene',
    'Limpeza',
    'Alimentos',
    'Bebidas',
    'Papelaria',
  ];

  const categoriasDb = await Promise.all(
    categorias.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  console.log('✅ Categorias criadas');

  // 3. Criar produtos
  const produtos = [
    {
      name: 'Shampoo Dove 400ml',
      sku: 'HIG-001',
      costPrice: 12.0,
      sellPrice: 22.9,
      quantity: 25,
      minQuantity: 5,
      categoryIndex: 0,
    },
    {
      name: 'Sabonete Lux 90g',
      sku: 'HIG-002',
      costPrice: 2.5,
      sellPrice: 4.99,
      quantity: 50,
      minQuantity: 10,
      categoryIndex: 0,
    },
    {
      name: 'Creme Dental Colgate 90g',
      sku: 'HIG-003',
      costPrice: 3.8,
      sellPrice: 7.5,
      quantity: 3,
      minQuantity: 5,
      categoryIndex: 0,
    },
    {
      name: 'Detergente Ypê 500ml',
      sku: 'LIM-001',
      costPrice: 1.8,
      sellPrice: 3.49,
      quantity: 40,
      minQuantity: 10,
      categoryIndex: 1,
    },
    {
      name: 'Água Sanitária 1L',
      sku: 'LIM-002',
      costPrice: 3.0,
      sellPrice: 5.99,
      quantity: 2,
      minQuantity: 5,
      categoryIndex: 1,
    },
    {
      name: 'Desinfetante Pinho Sol 500ml',
      sku: 'LIM-003',
      costPrice: 4.5,
      sellPrice: 8.9,
      quantity: 15,
      minQuantity: 5,
      categoryIndex: 1,
    },
    {
      name: 'Arroz Tio João 5kg',
      sku: 'ALM-001',
      costPrice: 18.0,
      sellPrice: 27.9,
      quantity: 20,
      minQuantity: 5,
      categoryIndex: 2,
    },
    {
      name: 'Feijão Carioca 1kg',
      sku: 'ALM-002',
      costPrice: 6.0,
      sellPrice: 9.99,
      quantity: 30,
      minQuantity: 8,
      categoryIndex: 2,
    },
    {
      name: 'Macarrão Barilla 500g',
      sku: 'ALM-003',
      costPrice: 4.0,
      sellPrice: 7.49,
      quantity: 4,
      minQuantity: 5,
      categoryIndex: 2,
    },
    {
      name: 'Coca-Cola 2L',
      sku: 'BEB-001',
      costPrice: 5.5,
      sellPrice: 9.99,
      quantity: 35,
      minQuantity: 10,
      categoryIndex: 3,
    },
    {
      name: 'Suco Del Valle 1L',
      sku: 'BEB-002',
      costPrice: 4.0,
      sellPrice: 7.99,
      quantity: 18,
      minQuantity: 5,
      categoryIndex: 3,
    },
    {
      name: 'Caderno 96 folhas',
      sku: 'PAP-001',
      costPrice: 8.0,
      sellPrice: 15.9,
      quantity: 12,
      minQuantity: 3,
      categoryIndex: 4,
    },
    {
      name: 'Caneta BIC Azul',
      sku: 'PAP-002',
      costPrice: 1.2,
      sellPrice: 2.5,
      quantity: 100,
      minQuantity: 20,
      categoryIndex: 4,
    },
    {
      name: 'Borracha Faber-Castell',
      sku: 'PAP-003',
      costPrice: 0.8,
      sellPrice: 1.99,
      quantity: 60,
      minQuantity: 15,
      categoryIndex: 4,
    },
    {
      name: 'Amaciante Comfort 2L',
      sku: 'LIM-004',
      costPrice: 10.0,
      sellPrice: 18.9,
      quantity: 1,
      minQuantity: 3,
      categoryIndex: 1,
    },
  ];

  const produtosDb = await Promise.all(
    produtos.map((p) =>
      prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: {
          name: p.name,
          sku: p.sku,
          costPrice: p.costPrice,
          sellPrice: p.sellPrice,
          quantity: p.quantity,
          minQuantity: p.minQuantity,
          categoryId: categoriasDb[p.categoryIndex].id,
        },
      }),
    ),
  );

  console.log('✅ Produtos criados');

  // 4. Criar movimentações de exemplo
  const movimentacoes = [
    {
      productIndex: 0,
      type: MovementType.ENTRY,
      quantity: 30,
      reason: 'Compra fornecedor Distribuidora ABC',
    },
    {
      productIndex: 0,
      type: MovementType.EXIT,
      quantity: 5,
      reason: 'Venda balcão',
    },
    {
      productIndex: 3,
      type: MovementType.ENTRY,
      quantity: 50,
      reason: 'Reposição mensal',
    },
    {
      productIndex: 3,
      type: MovementType.EXIT,
      quantity: 10,
      reason: 'Venda balcão',
    },
    {
      productIndex: 9,
      type: MovementType.ENTRY,
      quantity: 40,
      reason: 'Compra fornecedor Bebidas Ltda',
    },
    {
      productIndex: 9,
      type: MovementType.EXIT,
      quantity: 5,
      reason: 'Venda balcão',
    },
  ];

  const movementsCount = await prisma.movement.count();
  if (movementsCount === 0) {
    await Promise.all(
      movimentacoes.map((m) =>
        prisma.movement.create({
          data: {
            type: m.type,
            quantity: m.quantity,
            reason: m.reason,
            productId: produtosDb[m.productIndex].id,
            userId: admin.id,
          },
        }),
      ),
    );
    console.log('✅ Movimentações criadas');
  } else {
    console.log('⚡ Movimentações já existem, pulando...');
  }
  console.log('🌱 Seed finalizado com sucesso!');
}

main()
  .catch((e: unknown) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
