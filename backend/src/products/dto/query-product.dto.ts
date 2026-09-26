import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * @description Colunas permitidas para ordenação. Restringir por whitelist evita
 * que chaves arbitrárias cheguem ao `orderBy` do Prisma (o que geraria erro 500)
 * e limita a ordenação a colunas indexadas/relevantes.
 */
export const PRODUCT_SORTABLE_FIELDS = [
  'name',
  'sku',
  'quantity',
  'minQuantity',
  'costPrice',
  'sellPrice',
  'createdAt',
] as const;

/**
 * @description Data Transfer Object (DTO) para os parâmetros de query da listagem de produtos.
 * Encapsula os filtros de busca (`search`, `categoryId`) e os parâmetros de
 * paginação (`page`, `limit`), com valores padrão sensatos e limite máximo
 * para conter o consumo de recursos do servidor.
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
  @Max(100, { message: 'Limite máximo de 100 itens por página' })
  limit?: number = 10;

  @IsOptional()
  @IsIn(PRODUCT_SORTABLE_FIELDS, { message: 'Campo de ordenação inválido' })
  sortBy?: (typeof PRODUCT_SORTABLE_FIELDS)[number];

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Ordenação deve ser asc ou desc' })
  sortOrder?: 'asc' | 'desc';
}
