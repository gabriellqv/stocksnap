/**
 * @fileoverview Modal de criação e edição de produtos.
 * Consome o estado centralizado do Zustand para as operações.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
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

const productSchema = z.object({
  name: z.string().min(1, 'O nome do produto é obrigatório.'),
  sku: z.string().min(1, 'O SKU do produto é obrigatório.'),
  description: z.string().optional(),
  costPrice: z.number().min(0, 'Preço inválido.'),
  sellPrice: z.number().min(0, 'Preço inválido.'),
  minQuantity: z.number().min(0),
  categoryId: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

/**
 * @description Modal controlado via estado para gerenciar (Criar/Editar) produtos.
 * Utiliza validação via react-hook-form e zod, integração direta com as stores.
 */
export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const createProduct = useProductStore((s) => s.createProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const isSubmitting = useProductStore((s) => s.isSubmitting);
  const categories = useCategoryStore((s) => s.categories);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const createCategory = useCategoryStore((s) => s.createCategory);

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      costPrice: 0,
      sellPrice: 0,
      minQuantity: 5,
      categoryId: '',
    },
  });

  const isEditing = !!product;

  useEffect(() => {
    if (product && isOpen) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        costPrice: product.costPrice as unknown as number,
        sellPrice: product.sellPrice as unknown as number,
        minQuantity: product.minQuantity,
        categoryId: product.categoryId,
      });
    } else if (isOpen) {
      reset({
        name: '',
        sku: '',
        description: '',
        costPrice: 0,
        sellPrice: 0,
        minQuantity: 5,
        categoryId: categories[0]?.id || '',
      });
    }
  }, [product, categories, isOpen, reset]);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories().catch(console.error);
    }
    /** Reset imperativo do formulário aninhado de categoria ao colapsar a interface */
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCreatingCategory(false);

      setNewCategoryName('');
    }
  }, [isOpen, categories.length, fetchCategories]);

  /**
   * Previne a inserção antecipada da categoria.
   * O flush no banco de dados agora é atrelado exclusivamente à finalização do produto raiz.
   */

  const onSubmit = async (data: ProductFormData) => {
    if (isCreatingCategory && !newCategoryName.trim()) {
      setError('root', { message: 'O nome da nova categoria é obrigatório.' });
      return;
    }
    if (!isCreatingCategory && !data.categoryId) {
      setError('categoryId', {
        message: 'Selecione uma categoria ou crie uma nova.',
      });
      return;
    }

    try {
      let finalCategoryId = data.categoryId as string;

      /** Resolvimento da dependência hierárquica: cadastra a categoria in-flight antes do produto */
      if (isCreatingCategory) {
        const newCat = await createCategory({ name: newCategoryName.trim() });
        finalCategoryId = newCat.id;
      }

      const payload = {
        name: data.name,
        sku: data.sku,
        description: data.description,
        categoryId: finalCategoryId,
        costPrice: data.costPrice,
        sellPrice: data.sellPrice,
        minQuantity: data.minQuantity,
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
      setError('root', { message: msg });
      toast.error(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-6 space-y-4 overflow-y-auto"
        >
          {errors.root && (
            <div className="bg-destructive-muted border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {errors.root.message}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Nome
              </label>
              <Input type="text" {...register('name')} />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                SKU
              </label>
              <Input
                type="text"
                {...register('sku')}
                className="font-mono text-sm"
                placeholder="HIG-001"
              />
              {errors.sku && (
                <p className="text-destructive text-xs mt-1">
                  {errors.sku.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-foreground">
                  Categoria
                </label>
                {!isCreatingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 font-medium transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Nova
                  </button>
                )}
              </div>

              {isCreatingCategory ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Nome da categoria..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="h-10 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsCreatingCategory(false);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-muted hover:text-destructive transition-colors"
                    onClick={() => {
                      setIsCreatingCategory(false);
                      setNewCategoryName('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <select
                  {...register('categoryId')}
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent transition-all duration-200 cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.categoryId && !isCreatingCategory && (
                <p className="text-destructive text-xs mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Preço de Custo
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('costPrice', { valueAsNumber: true })}
                className="font-mono text-sm"
              />
              {errors.costPrice && (
                <p className="text-destructive text-xs mt-1">
                  {errors.costPrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Preço de Venda
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register('sellPrice', { valueAsNumber: true })}
                className="font-mono text-sm"
              />
              {errors.sellPrice && (
                <p className="text-destructive text-xs mt-1">
                  {errors.sellPrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Estoque Mínimo
              </label>
              <Input
                type="number"
                min="0"
                {...register('minQuantity', { valueAsNumber: true })}
                className="font-mono text-sm"
              />
              {errors.minQuantity && (
                <p className="text-destructive text-xs mt-1">
                  {errors.minQuantity.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Descrição (opcional)
              </label>
              <textarea
                {...register('description')}
                className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent transition-all duration-200"
                rows={2}
              />
              {errors.description && (
                <p className="text-destructive text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
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
