import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

// PartialType torna todos os campos opcionais
// Então UpdateCategoryDto = { name?: string }
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
