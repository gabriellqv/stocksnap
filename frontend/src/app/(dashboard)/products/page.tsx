/**
 * @fileoverview Página de gerenciamento de produtos com integração Zustand.
 * Responsável por exibir a tabela de produtos, filtros, busca e acionar o modal de edição.
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useProductStore } from '@/stores/product-store';
import { useCategoryStore } from '@/stores/category-store';
import { StockBadge } from '@/components/ui/stock-badge';
import { ProductModal } from '@/components/product-modal';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

/**
 * @description Componente principal da rota de produtos.
 * Orquestra o estado global via Zustand para busca paginada e CRUD.
 */
export default function ProductsPage() {
  const { products, meta, query, isLoading, fetchProducts, deleteProduct } =
    useProductStore();

  const { categories, fetchCategories } = useCategoryStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState('');

  // Buscar dados no mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts({ search: searchInput, page: 1 });
  };

  const handleCategoryFilter = (categoryId: string) => {
    fetchProducts({ categoryId, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    fetchProducts({ page: newPage });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Deseja deletar "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Produtos
          </h1>
          <p className="text-muted mt-1">{meta.total} produtos cadastrados</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition cursor-pointer font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome ou SKU..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border text-foreground rounded-lg focus:ring-2 focus:ring-accent/40 outline-none"
          />
        </form>
        <select
          value={query.categoryId || ''}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-surface border border-border text-foreground rounded-lg focus:ring-2 focus:ring-accent/40 outline-none cursor-pointer"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">
                Produto
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">
                SKU
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">
                Categoria
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted uppercase">
                Custo
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted uppercase">
                Venda
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium text-muted uppercase">
                Estoque
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted">
                  Carregando...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted">
                  Nenhum produto encontrado
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-border/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-muted font-mono text-sm">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4 text-right text-muted font-mono">
                    {formatCurrency(Number(product.costPrice))}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-foreground font-mono">
                    {formatCurrency(Number(product.sellPrice))}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StockBadge
                      quantity={product.quantity}
                      minQuantity={product.minQuantity}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-muted hover:text-accent transition cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-1.5 text-muted hover:text-destructive transition cursor-pointer"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted">
            Mostrando {(meta.page - 1) * meta.limit + 1} a{' '}
            {Math.min(meta.page * meta.limit, meta.total)} de {meta.total}{' '}
            resultados
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
              className="px-3 py-1.5 border border-border text-foreground rounded-lg text-sm disabled:opacity-50 hover:bg-border/50 cursor-pointer transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
              className="px-3 py-1.5 border border-border text-foreground rounded-lg text-sm disabled:opacity-50 hover:bg-border/50 cursor-pointer transition-colors"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
      />
    </div>
  );
}
