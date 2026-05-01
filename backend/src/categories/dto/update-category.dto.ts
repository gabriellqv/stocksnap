import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

/**
 * @description Data Transfer Object (DTO) para atualização parcial de uma categoria.
 * Herda todos os campos e validações de CreateCategoryDto via PartialType,
 * tornando-os opcionais — permite enviar apenas os campos que se deseja alterar.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
