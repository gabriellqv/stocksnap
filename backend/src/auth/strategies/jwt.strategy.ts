import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * @description Estratégia do Passport para validação de tokens JWT.
 * Configura o ciclo de vida da autenticação, extraindo o token do cabeçalho
 * 'Authorization: Bearer <token>', validando sua assinatura contra o `JWT_SECRET`
 * e convertendo o payload em um objeto validado.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * @description Método acionado automaticamente pelo Passport após a verificação
   * bem-sucedida da assinatura e validade (expiração) do JWT.
   * O retorno é injetado automaticamente pelo framework no objeto Request (`req.user`).
   *
   * @param {Object} payload - Dados decodificados do token JWT.
   * @returns {Promise<{id: string, email: string, role: string}>} Objeto serializado para injeção.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<{ id: string; email: string; role: string }> {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
