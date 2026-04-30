/**
 * @description Testes unitários do AppController.
 *
 * Valida o comportamento isolado do controller raiz, garantindo que o
 * endpoint de health check retorna a resposta esperada do AppService
 * sem dependências externas (banco de dados, rede, etc.).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
