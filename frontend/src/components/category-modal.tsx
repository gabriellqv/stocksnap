/**
 * @fileoverview Modal controlado para criação e edição de categorias.
 *
 * Consome a store `useCategoryStore` para operações de CRUD e
 * fornece feedback visual via Sonner (toast) e alertas inline.
 */

'use client';

import { useState, useEffect } from 'react';
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

/**
 * @description Modal reutilizável para gerenciamento de categorias (Criar/Editar).
 * Utiliza validação manual no frontend e tratamento de conflitos via API.
 */
export function CategoryModal({
  isOpen,
  onClose,
  category,
}: CategoryModalProps) {
  const createCategory = useCategoryStore((s) => s.createCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const isSubmitting = useCategoryStore((s) => s.isSubmitting);

  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(category.name);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName('');
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('O nome da categoria é obrigatório.');
      return;
    }

    try {
      if (isEditing) {
        await updateCategory(category!.id, { name: name.trim() });
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await createCategory({ name: name.trim() });
        toast.success('Categoria criada com sucesso!');
      }
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao salvar categoria';
      setError(msg);
      toast.error(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-sm mx-4">
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

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {error && (
            <div className="bg-destructive-muted border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nome da Categoria
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Eletrônicos"
              autoFocus
              required
            />
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
