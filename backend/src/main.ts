import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * @description Inicializa e configura a aplicação NestJS do StockSnap.
 *
 * Esta função é o ponto de entrada do servidor backend. Ela estabelece
 * as camadas de configuração globais antes de iniciar o listener HTTP:
 *
 * 1. **Helmet**: injeta headers HTTP de segurança (X-Content-Type-Options,
 *    X-Frame-Options, Strict-Transport-Security, etc.) para proteção contra
 *    ataques XSS, clickjacking e MIME-type sniffing.
 * 2. **Prefixo de rota** (`/api`): isola o namespace da API REST.
 * 3. **ValidationPipe**: garante que toda requisição seja validada
 *    contra os DTOs definidos, rejeitando campos não declarados.
 * 4. **CORS**: restringe chamadas cross-origin exclusivamente ao domínio
 *    do frontend configurado em `CORS_ORIGIN`.
 * 5. **Filtro global de exceções**: impede vazamento de stack traces e
 *    detalhes internos nas respostas de erro.
 * 6. **Swagger/OpenAPI**: documentação interativa disponível apenas fora
 *    de produção.
 *
 * @returns {Promise<void>} Resolve quando o servidor estiver ouvindo conexões.
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

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  const isProduction = process.env.NODE_ENV === 'production';

  /** Swagger exposto apenas fora de produção para não revelar a superfície da API. */
  if (!isProduction) {
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
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(
    `Servidor HTTP ativo na porta ${port} (env: ${process.env.NODE_ENV ?? 'development'})`,
  );
  if (!isProduction) {
    logger.log(`Documentação Swagger: http://localhost:${port}/api/docs`);
  }
}
void bootstrap();
