/**
 * @description Testes de integração (E2E) do AppController.
 *
 * Executa requisições HTTP reais contra a aplicação NestJS instanciada
 * em memória via Supertest. Diferente dos testes unitários, aqui o
 * módulo completo é carregado, validando o pipeline inteiro de
 * request/response (middlewares, pipes, interceptors).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
