import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type {
  RegisterResponse,
  LoginResponse,
} from './interfaces/auth-response.interface';

/**
 * @description Controller responsável pelos endpoints públicos de autenticação.
 * Expõe as rotas REST para registro de novos usuários e emissão de tokens JWT.
 * Ambos os endpoints possuem rate limiting restritivo via @Throttle para
 * proteção contra ataques de força bruta e spam de contas.
 */
@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @description Cria uma nova conta de usuário no sistema.
   *
   * @param {RegisterDto} dto - Corpo da requisição validado com as informações do novo usuário.
   * @returns {Promise<RegisterResponse>} Dados do usuário registrado com sucesso.
   * @throttle 3 requisições por minuto por IP (proteção contra spam de contas).
   */
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado.' })
  @Throttle({ default: { ttl: 60000, limit: 3 } })
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
