import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType } from '@prisma/client';

/**
 * @description Data Transfer Object (DTO) para registro de uma nova movimentação de estoque.
 * O campo `type` utiliza o enum `MovementType` do Prisma (ENTRY | EXIT), garantindo
 * que apenas valores válidos sejam aceitos pela API.
 */
export class CreateMovementDto {
  @IsEnum(MovementType, { message: 'Tipo deve ser ENTRY ou EXIT' })
  type: MovementType;

  @Type(() => Number)
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade deve ser pelo menos 1' })
  quantity: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  productId: string;
}
