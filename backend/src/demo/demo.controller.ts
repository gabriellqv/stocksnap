import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { DemoService, DemoResetResult } from './demo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * @description Controller administrativo de manutenção do ambiente de demonstração.
 *
 * Em um projeto de portfólio a conta ADMIN é pública, então qualquer visitante
 * pode alterar o estado dos dados. Este endpoint permite restaurar o conjunto
 * canônico com um clique, mantendo a demo sempre apresentável.
 *
 * A rota exige autenticação e papel ADMIN — nunca fica disponível anonimamente.
 */
@ApiTags('Demonstração')
@ApiBearerAuth()
@Controller('demo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  /**
   * @description Restaura categorias, produtos e movimentações ao estado inicial.
   * Preserva os usuários existentes.
   *
   * @returns {Promise<DemoResetResult>} Contagem dos registros recriados e timestamp.
   */
  @ApiOperation({ summary: 'Restaurar dados de demonstração (requer ADMIN)' })
  @ApiResponse({ status: 200, description: 'Dados restaurados.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Requer papel ADMIN.' })
  @Roles(Role.ADMIN)
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  reset(): Promise<DemoResetResult> {
    return this.demoService.reset();
  }
}
