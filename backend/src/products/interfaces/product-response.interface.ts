import type { Decimal } from '@prisma/client/runtime/library';

/**
 * @description Representação da categoria associada a um produto.
 */
export interface CategorySummary {
  id: string;
  name: string;
}

/**
 * @description Representação resumida de uma movimentação incluída no detalhe do produto.
 */
export interface MovementSummary {
  id: string;
  type: string;
  quantity: number;
  reason: string | null;
  user: { name: string };
  createdAt: Date;
}

/**
 * @description Contrato de resposta para um produto individual.
 * Utiliza o tipo `Decimal` do Prisma para os campos monetários, refletindo
 * fielmente o schema do banco de dados sem conversão prematura.
 */
export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  costPrice: Decimal;
  sellPrice: Decimal;
  quantity: number;
  minQuantity: number;
  categoryId: string;
  category: CategorySummary;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @description Contrato estendido com movimentações recentes, usado no endpoint GET /products/:id.
 */
export interface ProductDetailResponse extends ProductResponse {
  movements: MovementSummary[];
}

/**
 * @description Metadados de paginação reutilizáveis em todas as listagens.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * @description Contrato de resposta paginada genérico.
 * Utilizado por produtos e movimentações.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
