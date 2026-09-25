import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MovementType } from '@prisma/client';

/**
 * @description Data Transfer Object (DTO) para os parâmetros de query da listagem de movimentações.
 * Permite filtrar por produto (`productId`) e tipo (`ENTRY` | `EXIT`), com paginação
 * configurável. O limite padrão é 20, maior que o de produtos, pois movimentações
 * são consultadas em volumes maiores.
 */
export class QueryMovementDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsEnum(MovementType)
  type?: MovementType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: 'Limite máximo de 100 itens por página' })
  limit?: number = 20;
}
