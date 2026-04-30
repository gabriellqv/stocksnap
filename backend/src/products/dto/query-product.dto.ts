import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * @description Data Transfer Object (DTO) para os parâmetros de query da listagem de produtos.
 * Encapsula os filtros de busca (`search`, `categoryId`) e os parâmetros de
 * paginação (`page`, `limit`), com valores padrão sensatos.
 */
export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
