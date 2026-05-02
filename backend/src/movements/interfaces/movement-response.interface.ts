/**
 * @description Contrato de resposta para uma movimentação de estoque.
 * Inclui os dados resumidos do produto e do usuário responsável,
 * obtidos via `include` do Prisma na query de criação/listagem.
 */
export interface MovementResponse {
  id: string;
  type: string;
  quantity: number;
  reason: string | null;
  productId: string;
  userId: string;
  product: { name: string; sku: string };
  user: { name: string };
  createdAt: Date;
}

/**
 * @description Contrato de resposta para o endpoint `POST /movements`.
 * Retorna a movimentação criada junto com o saldo atualizado do produto,
 * permitindo que o frontend atualize a UI sem uma segunda requisição.
 */
export interface CreateMovementResponse {
  movement: MovementResponse;
  updatedStock: number;
}
