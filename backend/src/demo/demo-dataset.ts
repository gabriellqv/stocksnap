import { MovementType } from '@prisma/client';

/**
 * @description Dataset canônico da demonstração do StockSnap.
 *
 * Este é o estado "pristino" restaurado pelo `POST /demo/reset`. Extraído do
 * seed original para ser reutilizado tanto pela CLI (`prisma/seed.ts`) quanto
 * pelo endpoint de reset, garantindo que ambos produzam exatamente o mesmo
 * conjunto de dados.
 */

/** Usuário administrador de demonstração (credencial pública e documentada). */
export const DEMO_ADMIN = {
  name: 'Admin',
  email: 'admin@stocksnap.com',
} as const;

/** Usuário operador de demonstração. */
export const DEMO_OPERATOR = {
  name: 'Maria Operadora',
  email: 'operador@stocksnap.com',
} as const;

/** Categorias de demonstração. */
export const DEMO_CATEGORIES = [
  'Higiene',
  'Limpeza',
  'Alimentos',
  'Bebidas',
  'Papelaria',
] as const;

/** Produto de demonstração com o saldo inicial canônico. */
export interface DemoProduct {
  name: string;
  sku: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  minQuantity: number;
  categoryIndex: number;
}

/** Produtos de demonstração. `quantity` é o valor restaurado a cada reset. */
export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    name: 'Shampoo Dove 400ml',
    sku: 'HIG-001',
    costPrice: 12.0,
    sellPrice: 22.9,
    quantity: 25,
    minQuantity: 5,
    categoryIndex: 0,
  },
  {
    name: 'Sabonete Lux 90g',
    sku: 'HIG-002',
    costPrice: 2.5,
    sellPrice: 4.99,
    quantity: 50,
    minQuantity: 10,
    categoryIndex: 0,
  },
  {
    name: 'Creme Dental Colgate 90g',
    sku: 'HIG-003',
    costPrice: 3.8,
    sellPrice: 7.5,
    quantity: 3,
    minQuantity: 5,
    categoryIndex: 0,
  },
  {
    name: 'Detergente Ypê 500ml',
    sku: 'LIM-001',
    costPrice: 1.8,
    sellPrice: 3.49,
    quantity: 40,
    minQuantity: 10,
    categoryIndex: 1,
  },
  {
    name: 'Água Sanitária 1L',
    sku: 'LIM-002',
    costPrice: 3.0,
    sellPrice: 5.99,
    quantity: 2,
    minQuantity: 5,
    categoryIndex: 1,
  },
  {
    name: 'Desinfetante Pinho Sol 500ml',
    sku: 'LIM-003',
    costPrice: 4.5,
    sellPrice: 8.9,
    quantity: 15,
    minQuantity: 5,
    categoryIndex: 1,
  },
  {
    name: 'Arroz Tio João 5kg',
    sku: 'ALM-001',
    costPrice: 18.0,
    sellPrice: 27.9,
    quantity: 20,
    minQuantity: 5,
    categoryIndex: 2,
  },
  {
    name: 'Feijão Carioca 1kg',
    sku: 'ALM-002',
    costPrice: 6.0,
    sellPrice: 9.99,
    quantity: 30,
    minQuantity: 8,
    categoryIndex: 2,
  },
  {
    name: 'Macarrão Barilla 500g',
    sku: 'ALM-003',
    costPrice: 4.0,
    sellPrice: 7.49,
    quantity: 4,
    minQuantity: 5,
    categoryIndex: 2,
  },
  {
    name: 'Coca-Cola 2L',
    sku: 'BEB-001',
    costPrice: 5.5,
    sellPrice: 9.99,
    quantity: 35,
    minQuantity: 10,
    categoryIndex: 3,
  },
  {
    name: 'Suco Del Valle 1L',
    sku: 'BEB-002',
    costPrice: 4.0,
    sellPrice: 7.99,
    quantity: 18,
    minQuantity: 5,
    categoryIndex: 3,
  },
  {
    name: 'Caderno 96 folhas',
    sku: 'PAP-001',
    costPrice: 8.0,
    sellPrice: 15.9,
    quantity: 12,
    minQuantity: 3,
    categoryIndex: 4,
  },
  {
    name: 'Caneta BIC Azul',
    sku: 'PAP-002',
    costPrice: 1.2,
    sellPrice: 2.5,
    quantity: 100,
    minQuantity: 20,
    categoryIndex: 4,
  },
  {
    name: 'Borracha Faber-Castell',
    sku: 'PAP-003',
    costPrice: 0.8,
    sellPrice: 1.99,
    quantity: 60,
    minQuantity: 15,
    categoryIndex: 4,
  },
  {
    name: 'Amaciante Comfort 2L',
    sku: 'LIM-004',
    costPrice: 10.0,
    sellPrice: 18.9,
    quantity: 1,
    minQuantity: 3,
    categoryIndex: 1,
  },
];

/** Movimentação de demonstração, referenciando produtos por índice. */
export interface DemoMovement {
  productIndex: number;
  type: MovementType;
  quantity: number;
  reason: string;
}

/** Movimentações de demonstração recriadas a cada reset. */
export const DEMO_MOVEMENTS: DemoMovement[] = [
  {
    productIndex: 0,
    type: MovementType.ENTRY,
    quantity: 30,
    reason: 'Compra fornecedor Distribuidora ABC',
  },
  {
    productIndex: 0,
    type: MovementType.EXIT,
    quantity: 5,
    reason: 'Venda balcão',
  },
  {
    productIndex: 3,
    type: MovementType.ENTRY,
    quantity: 50,
    reason: 'Reposição mensal',
  },
  {
    productIndex: 3,
    type: MovementType.EXIT,
    quantity: 10,
    reason: 'Venda balcão',
  },
  {
    productIndex: 9,
    type: MovementType.ENTRY,
    quantity: 40,
    reason: 'Compra fornecedor Bebidas Ltda',
  },
  {
    productIndex: 9,
    type: MovementType.EXIT,
    quantity: 5,
    reason: 'Venda balcão',
  },
];
