/**
 * @fileoverview Página de gerenciamento de Categorias, listagem e modal de edição.
 */

'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Box } from 'lucide-react';
import { useCategoryStore } from '@/stores/category-store';
import { Button } from '@/components/ui/button';
import { CategoryModal } from '@/components/category-modal';
import type { Category } from '@/types';
import { toast } from 'sonner';
import { useIsAdmin } from '@/hooks/use-is-admin';

/**
 * @description Página de gerenciamento de Categorias do estoque.
 * Permite a visualização, criação, edição e exclusão de categorias com
 * controle de acesso baseado em papéis (RBAC) — operações de mutação
 * são restritas ao perfil ADMIN, enquanto OPERATOR mantém acesso de leitura.
 */
export default function CategoriesPage() {
  const categories = useCategoryStore((s) => s.categories);
  const isLoading = useCategoryStore((s) => s.isLoading);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const isAdmin = useIsAdmin();

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
      toast.error(
        `Não é possível excluir. Existem ${category._count.products} produto(s) vinculado(s) a esta categoria.`,
      );
      return;
    }

    if (
      window.confirm(
        `Tem certeza que deseja excluir a categoria "${category.name}"?`,
      )
    ) {
      try {
        await deleteCategory(category.id);
        toast.success('Categoria excluída com sucesso!');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Erro ao excluir categoria',
        );
      }
    }
  };

  return (
    <div className="space-y-6 2xl:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl 2xl:text-4xl 3xl:text-5xl font-bold tracking-tight text-foreground">
            Categorias
          </h1>
          <p className="text-muted mt-1 2xl:text-base 3xl:text-lg">
            Gerencie os departamentos e classificações do seu estoque.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2 2xl:gap-3 w-full sm:w-auto 2xl:h-11 2xl:px-5 2xl:text-base"
          >
            <Plus className="w-4 h-4 2xl:w-5 2xl:h-5" /> Nova Categoria
          </Button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl 2xl:rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 2xl:p-12 text-center text-muted 2xl:text-base">
            Carregando categorias...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 2xl:p-16 flex flex-col items-center justify-center text-center">
            <Tag className="w-12 h-12 2xl:w-16 2xl:h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg 2xl:text-xl font-medium text-foreground mb-1">
              Nenhuma categoria encontrada
            </h3>
            <p className="text-muted max-w-sm 2xl:max-w-md mb-4 2xl:text-base">
              Você ainda não possui nenhuma categoria cadastrada. Crie a sua
              primeira para organizar seus produtos.
            </p>
            <Button onClick={handleCreate} variant="outline" className="gap-2 2xl:h-11 2xl:px-5 2xl:text-base">
              <Plus className="w-4 h-4 2xl:w-5 2xl:h-5" /> Cadastrar Primeira Categoria
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm 2xl:text-base text-left">
              <thead className="text-xs 2xl:text-sm text-muted-foreground uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4 2xl:px-8 2xl:py-5 font-medium">Nome da Categoria</th>
                  <th className="px-6 py-4 2xl:px-8 2xl:py-5 font-medium text-center">
                    Produtos Vinculados
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-4 2xl:px-8 2xl:py-5 font-medium text-right">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-accent/5 transition-colors group"
                  >
                    <td className="px-6 py-4 2xl:px-8 2xl:py-5 font-medium text-foreground">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 2xl:px-8 2xl:py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 2xl:px-3.5 2xl:py-1.5 rounded-full bg-background border border-border text-xs 2xl:text-sm font-medium text-muted-foreground group-hover:border-accent/30 group-hover:text-accent transition-colors">
                        <Box className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                        {category._count?.products || 0}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 2xl:px-8 2xl:py-5 text-right">
                        <div className="flex items-center justify-end gap-2 2xl:gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 2xl:h-10 2xl:w-10 text-muted-foreground hover:text-accent hover:border-accent/30"
                            onClick={() => handleEdit(category)}
                            title="Editar Categoria"
                          >
                            <Pencil className="w-4 h-4 2xl:w-5 2xl:h-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 2xl:h-10 2xl:w-10 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                            onClick={() => handleDelete(category)}
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-4 h-4 2xl:w-5 2xl:h-5" />
                          </Button>
                        </div>
                      </td>
                    )}
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
