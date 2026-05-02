import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * @description Inicializa e configura a aplicação NestJS do StockSnap.
 *
 * Esta função é o ponto de entrada do servidor backend. Ela estabelece
 * três camadas de configuração global antes de iniciar o listener HTTP:
 *
 * 1. **Prefixo de rota** (`/api`): isola o namespace da API REST,
 *    evitando colisão com rotas do frontend em ambientes de proxy reverso.
 * 2. **ValidationPipe**: garante que toda requisição seja validada
 *    contra os DTOs definidos, rejeitando campos não declarados e
 *    aplicando transformação automática de tipos primitivos.
 * 3. **CORS**: restringe chamadas cross-origin exclusivamente ao
 *    domínio do frontend Next.js, com suporte a cookies de sessão.
 *
 * @returns {Promise<void>} Resolve quando o servidor estiver ouvindo conexões.
 *
 * @example
 * // A função é invocada diretamente no módulo raiz:
 * void bootstrap();
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `Backend rodando em http://localhost:${process.env.PORT ?? 3001}`,
  );
}
void bootstrap();
