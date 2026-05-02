import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type {
  RegisterResponse,
  LoginResponse,
} from './interfaces/auth-response.interface';

/**
 * @description Serviço responsável pela lógica de negócios da autenticação.
 * Orquestra o registro de novos usuários, garantindo a unicidade de emails e
 * criptografia de senhas, e gerencia a emissão de tokens JWT no login.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @description Registra um novo usuário no sistema. Valida a disponibilidade do
   * email informado e realiza o hash da senha via bcrypt antes da persistência.
   * Utiliza `select` do Prisma para garantir que o campo `password` nunca
   * seja carregado em memória na resposta.
   *
   * @param {RegisterDto} dto - Payload contendo nome, email e senha do usuário.
   * @returns {Promise<RegisterResponse>} Os dados públicos do usuário criado.
   * @throws {ConflictException} Caso o email informado já esteja registrado no banco de dados.
   */
  async register(dto: RegisterDto): Promise<RegisterResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Este email já está cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * @description Autentica um usuário e emite um token JWT para acesso a rotas protegidas.
   * Por questões de segurança, falhas de e-mail ou senha disparam o mesmo erro genérico
   * para prevenir a enumeração de usuários do sistema.
   *
   * @param {LoginDto} dto - Payload contendo email e senha de acesso.
   * @returns {Promise<LoginResponse>} Objeto contendo o `access_token` e dados básicos do usuário logado.
   * @throws {UnauthorizedException} Se as credenciais estiverem incorretas ou o usuário não existir.
   */
  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
