import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * @description Controller responsável pelos endpoints públicos de autenticação.
 * Expõe as rotas REST para registro de novos usuários e emissão de tokens JWT.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @description Cria uma nova conta de usuário no sistema.
   *
   * @param {RegisterDto} dto - Corpo da requisição validado com as informações do novo usuário.
   * @returns {Promise<unknown>} Dados do usuário registrado com sucesso.
   */
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<unknown> {
    return this.authService.register(dto);
  }

  /**
   * @description Autentica um usuário existente com suas credenciais.
   * Retorna explicitamente o status HTTP 200 OK, uma vez que a autenticação
   * não cria um novo recurso no banco de dados.
   *
   * @param {LoginDto} dto - Corpo da requisição validado com as credenciais.
   * @returns {Promise<unknown>} Token JWT e informações básicas do usuário.
   */
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<unknown> {
    return this.authService.login(dto);
  }
}
