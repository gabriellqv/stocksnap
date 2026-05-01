/**
 * Tipagens de Autenticação
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
}

/**
 * Tipagens de Categoria
 */
export interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export interface CreateCategoryData {
  name: string;
}

/**
 * Tipagens de Produto
 */
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  /** Representações decimais do Prisma são serializadas como strings */
  costPrice: string;
  sellPrice: string;
  quantity: number;
  minQuantity: number;
  categoryId: string;
  category: Category;
  movements?: Movement[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  sku: string;
  description?: string;
  costPrice: number;
  sellPrice: number;
  quantity?: number;
  minQuantity?: number;
  categoryId: string;
}

export interface UpdateProductData {
  name?: string;
  sku?: string;
  description?: string;
  costPrice?: number;
  sellPrice?: number;
  quantity?: number;
  minQuantity?: number;
  categoryId?: string;
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Tipagens de Movimentação
 */
export type MovementType = 'ENTRY' | 'EXIT';

export interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  reason: string | null;
  product: { name: string; sku: string };
  user: { name: string };
  createdAt: string;
}

export interface CreateMovementData {
  type: MovementType;
  quantity: number;
  productId: string;
  reason?: string;
}

export interface MovementQueryParams {
  productId?: string;
  type?: MovementType;
  page?: number;
  limit?: number;
}

/**
 * Tipagens do Resumo do Dashboard
 */
export interface DashboardSummary {
  totalProducts: number;
  totalValue: number;
  criticalItems: number;
  todayMovements: number;
}

export interface ChartData {
  date: string;
  entries: number;
  exits: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  categoryName: string;
}
