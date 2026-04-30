import { IsNotEmpty, IsString } from 'class-validator';

/**
 * @description Data Transfer Object (DTO) para criação de uma nova categoria.
 * Utiliza class-validator para garantir que apenas dados no formato correto
 * cheguem ao service, prevenindo payloads mal-formados.
 */
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome da categoria é obrigatório' })
  name: string;
}
