/**
 * @fileoverview Página de gerenciamento de produtos com integração Zustand.
 * Responsável por exibir a tabela de produtos, filtros, busca e acionar o modal de edição.
 * Operações de mutação (criar, editar, deletar) são restritas ao perfil ADMIN via RBAC.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
} from 'lucide-react';
import { exportToCsv } from '@/lib/export-csv';
import { toast } from 'sonner';
import { useProductStore } from '@/stores/product-store';
import { useCategoryStore } from '@/stores/category-store';
import { StockBadge } from '@/components/ui/stock-badge';
import { ProductModal } from '@/components/product-modal';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useIsAdmin } from '@/hooks/use-is-admin';
import type { Product } from '@/types';

/**
 * @description Componente principal da rota de produtos.
 * Orquestra o estado global via Zustand para busca paginada e CRUD.
 * Aplica controle de acesso baseado em papéis (RBAC): botões de criação,
 * edição e exclusão são renderizados condicionalmente via `useIsAdmin()`.
 */
export default function ProductsPage() {
  const { products, meta, query, isLoading, fetchProducts, deleteProduct } =
    useProductStore();

  const { categories, fetchCategories } = useCategoryStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const isAdmin = useIsAdmin();

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

  const handleSortQuantity = () => {
    const isCurrentlyQuantity = query.sortBy === 'quantity';
    let newOrder: 'asc' | 'desc' | undefined = 'desc';

    if (isCurrentlyQuantity && query.sortOrder === 'desc') {
      newOrder = 'asc';
    } else if (isCurrentlyQuantity && query.sortOrder === 'asc') {
      newOrder = undefined;
    }

    fetchProducts({
      ...query,
      sortBy: newOrder ? 'quantity' : undefined,
      sortOrder: newOrder,
      page: 1,
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      toast.success('Produto deletado com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao deletar');
    } finally {
      setProductToDelete(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleExportCSV = () => {
    const data = products.map((p) => ({
      Nome: p.name,
      SKU: p.sku,
      Categoria: p.category.name,
      'Preço Custo': String(p.costPrice).replace('.', ','),
      'Preço Venda': String(p.sellPrice).replace('.', ','),
      Quantidade: p.quantity,
      'Estoque Mínimo': p.minQuantity,
    }));
    exportToCsv(data, 'Produtos');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Produtos
          </h1>
          <p className="text-muted mt-1">{meta.total} produtos cadastrados</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          className="w-full sm:w-auto px-4 py-2 bg-surface border border-border text-foreground rounded-lg focus:ring-2 focus:ring-accent/40 outline-none cursor-pointer"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="gap-2 w-full sm:w-auto hover:text-accent hover:border-accent/30 transition-colors"
          disabled={products.length === 0}
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full min-w-[50rem]">
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
              <th className="px-6 py-3 text-xs font-medium text-muted uppercase">
                <button
                  onClick={handleSortQuantity}
                  className="flex w-full items-center justify-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                  title="Ordenar por quantidade"
                >
                  Estoque
                  {query.sortBy === 'quantity' ? (
                    query.sortOrder === 'asc' ? (
                      <ArrowUp className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                  )}
                </button>
              </th>
              {isAdmin && (
                <th className="text-right px-6 py-3 text-xs font-medium text-muted uppercase">
                  Ações
                </th>
              )}
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
                  {isAdmin && (
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
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-sm text-muted text-center sm:text-left">
            Mostrando {(meta.page - 1) * meta.limit + 1} a{' '}
            {Math.min(meta.page * meta.limit, meta.total)} de {meta.total}{' '}
            resultados
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
      />

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border w-full max-w-sm rounded-xl p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-foreground">
              Confirmar Exclusão
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              Tem certeza que deseja deletar o produto{' '}
              <strong className="text-foreground">
                {productToDelete.name}
              </strong>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end mt-2">
              <Button
                variant="outline"
                onClick={() => setProductToDelete(null)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Deletar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
