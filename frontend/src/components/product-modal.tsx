/**
 * @fileoverview Modal de criação e edição de produtos.
 * Consome o estado centralizado do Zustand para as operações.
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useProductStore } from '@/stores/product-store';
import { useCategoryStore } from '@/stores/category-store';
import type { Product } from '@/types';

/**
 * Propriedades do componente ProductModal.
 */
interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

/**
 * @description Modal controlado via estado para gerenciar (Criar/Editar) produtos.
 * Utiliza integração direta com as stores `useProductStore` e `useCategoryStore`.
 */
export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const createProduct = useProductStore((s) => s.createProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const isSubmitting = useProductStore((s) => s.isSubmitting);
  const categories = useCategoryStore((s) => s.categories);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    costPrice: '',
    sellPrice: '',
    minQuantity: '5',
    categoryId: '',
  });
  const [error, setError] = useState('');

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        costPrice: String(product.costPrice),
        sellPrice: String(product.sellPrice),
        minQuantity: String(product.minQuantity),
        categoryId: product.categoryId,
      });
    } else {
      setForm({
        name: '',
        sku: '',
        description: '',
        costPrice: '',
        sellPrice: '',
        minQuantity: '5',
        categoryId: categories[0]?.id || '',
      });
    }
  }, [product, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...form,
        costPrice: parseFloat(form.costPrice),
        sellPrice: parseFloat(form.sellPrice),
        minQuantity: parseInt(form.minQuantity),
      };

      if (isEditing) {
        await updateProduct(product!.id, payload);
      } else {
        await createProduct(payload);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5 cursor-pointer" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-destructive-muted border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Nome
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-accent/40 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                SKU
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border text-foreground font-mono text-sm rounded-lg focus:ring-2 focus:ring-accent/40 outline-none"
                placeholder="HIG-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Categoria
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-accent/40 outline-none"
                required
              >
                <option value="">Selecione...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Preço de Custo
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.costPrice}
                onChange={(e) =>
                  setForm({ ...form, costPrice: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border text-foreground font-mono text-sm rounded-lg focus:ring-2 focus:ring-accent/40 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Preço de Venda
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.sellPrice}
                onChange={(e) =>
                  setForm({ ...form, sellPrice: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border text-foreground font-mono text-sm rounded-lg focus:ring-2 focus:ring-accent/40 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Estoque Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={form.minQuantity}
                onChange={(e) =>
                  setForm({ ...form, minQuantity: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border text-foreground font-mono text-sm rounded-lg focus:ring-2 focus:ring-accent/40 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Descrição (opcional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-accent/40 outline-none"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-foreground border border-border rounded-lg hover:bg-border/50 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
