import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * @description Data Transfer Object (DTO) para atualização parcial de um produto.
 * Herda todos os campos e validações de CreateProductDto via PartialType,
 * tornando-os opcionais — permite enviar apenas os campos que se deseja alterar.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
