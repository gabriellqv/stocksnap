import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * @description Data Transfer Object (DTO) para o processo de login.
 * Blinda a API garantindo que apenas requisições contendo email válido
 * e senha preenchida sejam processadas pelo serviço de autenticação.
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;
}
