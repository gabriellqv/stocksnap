import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import type {
  RegisterResponse,
  LoginResponse,
} from './interfaces/auth-response.interface';

/**
 * @description Controller responsável pelos endpoints de autenticação.
 * Expõe a rota pública de login e a rota de criação de usuários, esta última
 * restrita a administradores para impedir auto-registro público (que concederia
 * acesso a dados e à movimentação de estoque a qualquer visitante).
 * Ambos os endpoints possuem rate limiting restritivo via @Throttle para
 * proteção contra ataques de força bruta e spam de contas.
 */
@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @description Cria uma nova conta de usuário no sistema. Requer um token
   * JWT válido de um usuário com papel ADMIN.
   *
   * @param {RegisterDto} dto - Corpo da requisição validado com as informações do novo usuário.
   * @returns {Promise<RegisterResponse>} Dados do usuário registrado com sucesso.
   * @throttle 3 requisições por minuto por IP (proteção contra spam de contas).
   */
  @ApiOperation({ summary: 'Registrar novo usuário (requer ADMIN)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Requer papel ADMIN.' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado.' })
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(dto);
  }

  /**
   * @description Autentica um usuário existente com suas credenciais.
   * Retorna explicitamente o status HTTP 200 OK, uma vez que a autenticação
   * não cria um novo recurso no banco de dados.
   *
   * @param {LoginDto} dto - Corpo da requisição validado com as credenciais.
   * @returns {Promise<LoginResponse>} Token JWT e informações básicas do usuário.
   * @throttle 5 requisições por minuto por IP (proteção contra força bruta).
   */
  @ApiOperation({ summary: 'Autenticar usuário e obter token JWT' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto);
  }
}
