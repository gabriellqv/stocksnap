import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';

jest.mock('cache-manager-redis-yet', () => ({
  redisStore: jest.fn().mockResolvedValue({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }),
}));

import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { Role } from '@prisma/client';

/**
 * @description Teste de integração que prova a invariante de integridade de estoque
 * sob concorrência real contra o PostgreSQL.
 *
 * Diferente dos testes unitários (que mockam o Prisma), aqui usamos o banco de
 * verdade e disparamos requisições HTTP simultâneas. É a evidência definitiva de
 * que o saldo nunca fica negativo — a regra que antes era apenas aparente no README.
 *
 * Pré-requisito: PostgreSQL acessível via DATABASE_URL com as migrations aplicadas.
 */
describe('Stock Concurrency (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let categoryId: string;
  const uniqueSuffix = Date.now().toString();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    const hashedPassword = await bcrypt.hash('123456', 10);
    const admin = await prisma.user.upsert({
      where: { email: `concurrency-${uniqueSuffix}@admin.com` },
      update: {},
      create: {
        name: 'Admin Concurrency',
        email: `concurrency-${uniqueSuffix}@admin.com`,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    void admin;

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: `concurrency-${uniqueSuffix}@admin.com`,
        password: '123456',
      })
      .expect(200);
    accessToken = (login.body as { access_token: string }).access_token;

    const category = await prisma.category.create({
      data: { name: `Categoria Concurrency ${uniqueSuffix}` },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.movement.deleteMany({
      where: { product: { sku: { startsWith: `CONC-${uniqueSuffix}` } } },
    });
    await prisma.product.deleteMany({
      where: { sku: { startsWith: `CONC-${uniqueSuffix}` } },
    });
    await prisma.category.deleteMany({
      where: { name: `Categoria Concurrency ${uniqueSuffix}` },
    });
    await prisma.user.deleteMany({
      where: { email: `concurrency-${uniqueSuffix}@admin.com` },
    });
    await app.close();
  });

  it('não permite saldo negativo com 10 saídas concorrentes de 1 unidade em estoque de 5', async () => {
    const product = await prisma.product.create({
      data: {
        name: 'Produto Concorrência',
        sku: `CONC-${uniqueSuffix}-A`,
        costPrice: 10,
        sellPrice: 20,
        quantity: 5,
        minQuantity: 0,
        categoryId,
      },
    });

    const attempts = Array.from({ length: 10 }, () =>
      request(app.getHttpServer())
        .post('/api/movements')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ type: 'EXIT', quantity: 1, productId: product.id }),
    );

    const responses = await Promise.all(attempts);
    const succeeded = responses.filter((r) => r.status === 201).length;
    const rejected = responses.filter((r) => r.status === 400).length;

    const finalProduct = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    const movementCount = await prisma.movement.count({
      where: { productId: product.id },
    });

    // Exatamente 5 requisições devem ter sucesso e 5 devem ser barradas
    expect(succeeded).toBe(5);
    expect(rejected).toBe(5);

    // A invariante central: o saldo nunca fica negativo
    expect(finalProduct.quantity).toBe(0);
    expect(finalProduct.quantity).toBeGreaterThanOrEqual(0);

    // Cada sucesso gera exatamente uma movimentação — sem duplicidade
    expect(movementCount).toBe(5);
  });

  it('criação concorrente com o mesmo SKU retorna 409 e não duplica o produto', async () => {
    const sku = `CONC-${uniqueSuffix}-B`;
    const payload = {
      name: 'Produto Corrida SKU',
      sku,
      costPrice: 5,
      sellPrice: 9,
      minQuantity: 1,
      categoryId,
    };

    const attempts = Array.from({ length: 5 }, () =>
      request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload),
    );

    const responses = await Promise.all(attempts);
    const created = responses.filter((r) => r.status === 201).length;
    const conflicts = responses.filter((r) => r.status === 409).length;

    const count = await prisma.product.count({ where: { sku } });

    expect(created).toBe(1);
    expect(conflicts).toBe(4);
    expect(count).toBe(1);
  });
});
