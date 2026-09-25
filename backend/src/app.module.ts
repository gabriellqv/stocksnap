import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './auth/guards/custom-throttler.guard';
import { validateEnv } from './config/env.validation';
import { redisStore } from 'cache-manager-redis-yet';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { MovementsModule } from './movements/movements.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * @description Módulo raiz da aplicação StockSnap.
 *
 * Atua como ponto de composição central do NestJS, orquestrando o registro
 * de todos os módulos de domínio e a configuração global de cache com Redis.
 * O CacheModule é registrado como global (isGlobal: true) para que qualquer
 * service possa injetar o CACHE_MANAGER sem precisar importar o módulo novamente.
 *
 * O ThrottlerModule limita requisições por IP para proteção contra
 * ataques de força bruta e abuso de endpoints (padrão: 20 req/min).
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),

    /**
     * Rate limiting global. Limita cada IP a 20 requisições por janela
     * de 60 segundos. Endpoints sensíveis (como login) podem sobrescrever
     * com limites mais restritivos via decorator @Throttle().
     */
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),

    /**
     * Configuração global de cache com Redis.
     * O TTL padrão de 60 segundos (em milissegundos) é aplicado a todas as
     * chaves que não especificarem um valor de expiração explícito.
     */
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const logger = new Logger('CacheModule');
        const url = config.get<string>('REDIS_URL');
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = config.get<number>('REDIS_PORT', 6379);
        const password = config.get<string>('REDIS_PASSWORD');

        try {
          const store = await redisStore(
            url
              ? {
                  url,
                  socket: {
                    connectTimeout: 5000,
                    reconnectStrategy: (retries: number) => {
                      if (retries > 3) {
                        return new Error('Redis connection failed');
                      }
                      return Math.min(retries * 500, 2000);
                    },
                  },
                }
              : {
                  socket: {
                    host,
                    port,
                    connectTimeout: 5000,
                    reconnectStrategy: (retries: number) => {
                      if (retries > 3) {
                        return new Error('Redis connection failed');
                      }
                      return Math.min(retries * 500, 2000);
                    },
                  },
                  ...(password ? { password } : {}),
                },
          );
          logger.log(
            `Conexão com Redis estabelecida com sucesso (${url ? 'via REDIS_URL' : `${host}:${port}`})`,
          );
          return {
            store,
            ttl: 60 * 1000,
          };
        } catch (error) {
          logger.warn(
            `Falha ao conectar ao Redis (${(error as Error).message}). Operando com cache em memória (fallback) para manter o serviço ativo.`,
          );
          return {
            ttl: 60 * 1000,
          };
        }
      },
    }),

    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    MovementsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    /**
     * Registra o CustomThrottlerGuard globalmente via APP_GUARD,
     * aplicando rate limiting a todos os endpoints com mensagem
     * de erro personalizada em português.
     */
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
