import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

/**
 * @description Inicializa e configura a aplicação NestJS do StockSnap.
 *
 * Esta função é o ponto de entrada do servidor backend. Ela estabelece
 * cinco camadas de configuração global antes de iniciar o listener HTTP:
 *
 * 1. **Helmet**: injeta headers HTTP de segurança (X-Content-Type-Options,
 *    X-Frame-Options, Strict-Transport-Security, etc.) para proteção contra
 *    ataques XSS, clickjacking e MIME-type sniffing.
 * 2. **Prefixo de rota** (`/api`): isola o namespace da API REST,
 *    evitando colisão com rotas do frontend em ambientes de proxy reverso.
 * 3. **ValidationPipe**: garante que toda requisição seja validada
 *    contra os DTOs definidos, rejeitando campos não declarados e
 *    aplicando transformação automática de tipos primitivos.
 * 4. **CORS**: restringe chamadas cross-origin exclusivamente ao
 *    domínio do frontend Next.js, com suporte a cookies de sessão.
 * 5. **Swagger/OpenAPI**: documentação interativa da API acessível em `/api/docs`.
 *
 * @returns {Promise<void>} Resolve quando o servidor estiver ouvindo conexões.
 *
 * @example
 * // A função é invocada diretamente no módulo raiz:
 * void bootstrap();
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
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

  /** Configuração do Swagger/OpenAPI */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('StockSnap API')
    .setDescription(
      'API REST para gerenciamento de estoque com autenticação JWT, ' +
        'controle de movimentações atômicas e dashboard analítico com cache Redis.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`Servidor HTTP ativo na porta ${port}`);
  logger.log(`Documentação Swagger: http://localhost:${port}/api/docs`);
}
void bootstrap();
