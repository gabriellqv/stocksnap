/**
 * @fileoverview Modal controlado para criação e edição de categorias.
 *
 * Consome a store `useCategoryStore` para operações de CRUD e
 * fornece feedback visual via Sonner (toast) e alertas inline.
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCategoryStore } from '@/stores/category-store';
import type { Category } from '@/types';

/**
 * @description Propriedades do componente CategoryModal.
 */
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

const categorySchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório.'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

/**
 * @description Modal reutilizável para gerenciamento de categorias (Criar/Editar).
 * Utiliza validação via react-hook-form e zod, com tratamento de conflitos da API.
 */
export function CategoryModal({
  isOpen,
  onClose,
  category,
}: CategoryModalProps) {
  const createCategory = useCategoryStore((s) => s.createCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const isSubmitting = useCategoryStore((s) => s.isSubmitting);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const isEditing = !!category;

  useEffect(() => {
    if (category && isOpen) {
      reset({ name: category.name });
    } else if (isOpen) {
      reset({ name: '' });
    }
  }, [category, isOpen, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditing) {
        await updateCategory(category!.id, { name: data.name.trim() });
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await createCategory({ name: data.name.trim() });
        toast.success('Categoria criada com sucesso!');
      }
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao salvar categoria';
      setError('root', { message: msg });
      toast.error(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-6 space-y-4"
        >
          {errors.root && (
            <div className="bg-destructive-muted border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {errors.root.message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nome da Categoria
            </label>
            <Input
              type="text"
              {...register('name')}
              placeholder="Ex: Eletrônicos"
              autoFocus
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">
                {errors.name.message}
              </p>
            )}
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
