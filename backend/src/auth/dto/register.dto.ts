import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * @description Data Transfer Object (DTO) para registro de novos usuários.
 * Utiliza o class-validator para garantir que os dados recebidos pelo endpoint
 * estejam no formato correto antes de atingirem o controller, prevenindo a injeção
 * de payloads mal-formados ou maliciosos no banco de dados.
 */
export class RegisterDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password: string;
}
