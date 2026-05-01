/**
 * @fileoverview Modal de criação e edição de produtos.
 * Consome o estado centralizado do Zustand para as operações.
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

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

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories().catch(console.error);
    }
  }, [isOpen, categories.length, fetchCategories]);

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
        toast.success('Produto atualizado com sucesso!');
      } else {
        await createProduct(payload);
        toast.success('Produto criado com sucesso!');
      }

      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar';
      setError(msg);
      toast.error(msg);
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
            className="text-muted hover:text-foreground transition-colors cursor-pointer"
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
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                SKU
              </label>
              <Input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="font-mono text-sm"
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
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent transition-all duration-200 cursor-pointer"
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
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.costPrice}
                onChange={(e) =>
                  setForm({ ...form, costPrice: e.target.value })
                }
                className="font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Preço de Venda
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.sellPrice}
                onChange={(e) =>
                  setForm({ ...form, sellPrice: e.target.value })
                }
                className="font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Estoque Mínimo
              </label>
              <Input
                type="number"
                min="0"
                value={form.minQuantity}
                onChange={(e) =>
                  setForm({ ...form, minQuantity: e.target.value })
                }
                className="font-mono text-sm"
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
                className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent transition-all duration-200"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
