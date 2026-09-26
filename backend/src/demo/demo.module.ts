import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

/**
 * @description Módulo de manutenção do ambiente de demonstração.
 * Expõe o endpoint administrativo que restaura o dataset canônico,
 * protegido por JWT + RolesGuard(ADMIN).
 */
@Module({
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
