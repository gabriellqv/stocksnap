'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Box } from 'lucide-react';
import { useCategoryStore } from '@/stores/category-store';
import { Button } from '@/components/ui/button';
import { CategoryModal } from '@/components/category-modal';
import type { Category } from '@/types';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const categories = useCategoryStore((s) => s.categories);
  const isLoading = useCategoryStore((s) => s.isLoading);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (category._count && category._count.products > 0) {
      toast.error(`Não é possível excluir. Existem ${category._count.products} produto(s) vinculado(s) a esta categoria.`);
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      try {
        await deleteCategory(category.id);
        toast.success('Categoria excluída com sucesso!');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao excluir categoria');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="w-8 h-8 text-accent" />
            Categorias
          </h1>
          <p className="text-muted mt-1">
            Gerencie os departamentos e classificações do seu estoque.
          </p>
        </div>

        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova Categoria
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted">Carregando categorias...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Tag className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma categoria encontrada</h3>
            <p className="text-muted max-w-sm mb-4">
              Você ainda não possui nenhuma categoria cadastrada. Crie a sua primeira para organizar seus produtos.
            </p>
            <Button onClick={handleCreate} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Cadastrar Primeira Categoria
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome da Categoria</th>
                  <th className="px-6 py-4 font-medium text-center">Produtos Vinculados</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-accent/5 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-xs font-medium text-muted-foreground group-hover:border-accent/30 group-hover:text-accent transition-colors">
                        <Box className="w-3.5 h-3.5" />
                        {category._count?.products || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-accent hover:border-accent/30"
                          onClick={() => handleEdit(category)}
                          title="Editar Categoria"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                          onClick={() => handleDelete(category)}
                          title="Excluir Categoria"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  );
}
