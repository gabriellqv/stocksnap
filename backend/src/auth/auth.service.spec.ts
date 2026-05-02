import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve retornar token e usuário se credenciais forem válidas', async () => {
      const user = {
        id: 'uuid-1',
        email: 'test@test.com',
        password: 'hashed-password',
        name: 'Test',
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwt.sign.mockReturnValue('fake-jwt-token');

      const result = await service.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        'hashed-password',
      );
      expect(mockJwt.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: undefined,
      });
      expect(result).toHaveProperty('access_token', 'fake-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uuid',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('deve lançar ConflictException se o email já estiver em uso', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uuid' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'pass',
          name: 'Test',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
