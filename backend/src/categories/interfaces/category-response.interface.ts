/**
 * @description Contrato de resposta para uma categoria individual.
 * Reflete fielmente o schema Prisma do model Category (sem timestamps).
 */
export interface CategoryResponse {
  id: string;
  name: string;
}

/**
 * @description Contrato estendido para listagem de categorias.
 * Inclui a contagem de produtos vinculados via `_count` do Prisma.
 */
export interface CategoryWithCountResponse extends CategoryResponse {
  _count: { products: number };
}
