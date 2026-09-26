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
 * @description Testes de integração do endpoint administrativo de reset de demonstração.
 *
 * Garante o controle de acesso (401 sem token, 403 para OPERATOR, 200 para ADMIN)
 * e que o reset efetivamente restaura o estado canônico.
 */
describe('Demo reset (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let operatorToken: string;
  const suffix = Date.now().toString();

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

    const password = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        name: 'Admin Demo',
        email: `demo-admin-${suffix}@test.com`,
        password,
        role: Role.ADMIN,
      },
    });
    await prisma.user.create({
      data: {
        name: 'Operator Demo',
        email: `demo-op-${suffix}@test.com`,
        password,
        role: Role.OPERATOR,
      },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: `demo-admin-${suffix}@test.com`, password: '123456' })
      .expect(200);
    adminToken = (adminLogin.body as { access_token: string }).access_token;

    const opLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: `demo-op-${suffix}@test.com`, password: '123456' })
      .expect(200);
    operatorToken = (opLogin.body as { access_token: string }).access_token;
  });

  afterAll(async () => {
    // O reset recria os dados canônicos; remove apenas os usuários de teste.
    await prisma.movement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            `demo-admin-${suffix}@test.com`,
            `demo-op-${suffix}@test.com`,
            'admin@stocksnap.com',
            'operador@stocksnap.com',
          ],
        },
      },
    });
    await app.close();
  });

  it('rejeita requisição sem autenticação (401)', async () => {
    await request(app.getHttpServer()).post('/api/demo/reset').expect(401);
  });

  it('rejeita OPERATOR (403)', async () => {
    await request(app.getHttpServer())
      .post('/api/demo/reset')
      .set('Authorization', `Bearer ${operatorToken}`)
      .expect(403);
  });

  it('restaura o dataset de demonstração para ADMIN (200)', async () => {
    // Estado sujo: apaga tudo antes do reset
    await prisma.movement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    const before = await prisma.product.count();
    expect(before).toBe(0);

    const res = await request(app.getHttpServer())
      .post('/api/demo/reset')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = res.body as {
      categories: number;
      products: number;
      movements: number;
    };
    expect(body.categories).toBe(5);
    expect(body.products).toBe(15);
    expect(body.movements).toBe(6);

    // O estado persistido deve refletir o dataset canônico
    await expect(prisma.category.count()).resolves.toBe(5);
    await expect(prisma.product.count()).resolves.toBe(15);
    await expect(prisma.movement.count()).resolves.toBe(6);

    // O saldo do produto HIG-001 deve voltar ao valor canônico (25)
    const product = await prisma.product.findUnique({
      where: { sku: 'HIG-001' },
      select: { quantity: true },
    });
    expect(product?.quantity).toBe(25);
  });
});
