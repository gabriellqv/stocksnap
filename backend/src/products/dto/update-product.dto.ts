import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * @description Data Transfer Object (DTO) para atualização parcial de um produto.
 *
 * Herda os campos e validações de CreateProductDto via PartialType, tornando-os
 * opcionais, mas **exclui `quantity`** intencionalmente: o saldo só pode mudar
 * pelo fluxo auditável de `POST /movements`, que registra o histórico e roda em
 * transação. Permitir alterar `quantity` diretamente quebraria a trilha de
 * auditoria e contornaria as validações de saldo.
 */
export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['quantity'] as const),
) {}
