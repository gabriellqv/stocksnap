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

describe('Critical Flow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let categoryId: string;
  let productId: string;
  let uniqueSuffix = Date.now().toString();

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
  });

  afterAll(async () => {
    if (prisma) {
      // Limpeza reversa para evitar problemas de foreign keys
      await prisma.movement.deleteMany({
        where: { product: { sku: `E2E-${uniqueSuffix}` } },
      });
      await prisma.product.deleteMany({
        where: { sku: `E2E-${uniqueSuffix}` },
      });
      await prisma.category.deleteMany({
        where: { name: `Categoria E2E ${uniqueSuffix}` },
      });
      await prisma.user.deleteMany({
        where: { email: `e2e-${uniqueSuffix}@admin.com` },
      });
    }
    if (app) {
      await app.close();
    }
  });

  it('1. Prepara ambiente: Cria usuário ADMIN diretamente no BD', async () => {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        name: 'Admin E2E',
        email: `e2e-${uniqueSuffix}@admin.com`,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
  });

  it('2. Auth: POST /auth/login retorna JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: `e2e-${uniqueSuffix}@admin.com`,
        password: '123456',
      })
      .expect(200);

    expect(res.body.access_token).toBeDefined();
    accessToken = res.body.access_token;
  });

  it('3. CRUD Categoria: POST /categories', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Categoria E2E ${uniqueSuffix}`,
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    categoryId = res.body.id;
  });

  it('4. CRUD Produto: POST /products', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Produto E2E',
        sku: `E2E-${uniqueSuffix}`,
        costPrice: 10.5,
        sellPrice: 20.0,
        minQuantity: 5,
        categoryId: categoryId,
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    productId = res.body.id;
  });

  it('5. Movimentação: POST /movements para adicionar estoque', async () => {
    await request(app.getHttpServer())
      .post('/api/movements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'ENTRY',
        quantity: 50,
        productId: productId,
        reason: 'Estoque inicial',
      })
      .expect(201);
  });

  it('6. Dashboard: GET /dashboard/metrics reflete o estoque', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/dashboard/metrics')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.totalProducts).toBeGreaterThanOrEqual(1);
    expect(res.body.totalStockValue).toBeDefined();
    expect(res.body.lowStockProducts).toBeDefined();
    expect(res.body.recentMovements).toBeDefined();
  });
});
