import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * @description Data Transfer Object (DTO) para criação de um novo produto.
 * O decorator `@Type(() => Number)` é necessário para converter strings de query params
 * ou JSON mal-tipado em números antes que o class-validator aplique suas regras.
 */
export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'SKU é obrigatório' })
  sku: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Preço de custo deve ter no máximo 2 casas decimais' },
  )
  @Min(0, { message: 'Preço de custo não pode ser negativo' })
  costPrice: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sellPrice: number;

  @Type(() => Number)
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(0)
  @IsOptional()
  quantity?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minQuantity?: number;

  @IsString()
  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  categoryId: string;
}
