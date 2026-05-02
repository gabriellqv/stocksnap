'use client';

import { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';
import { useMovementStore } from '@/stores/movement-store';
import { useProductStore } from '@/stores/product-store';
import { MovementModal } from '@/components/movement-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { MovementType } from '@/types';

/**
 * @description Página do Dashboard dedicada ao histórico e controle de Movimentações.
 * Conecta-se diretamente aos Stores Zustand para obter os dados em tempo real.
 * Apresenta o log transacional através de uma tabela responsiva com paginação
 * server-side, suportando filtros por ID de Produto e Tipo de Movimento.
 */
export default function MovementsPage() {
  const { movements, meta, isLoading, fetchMovements } = useMovementStore();
  const { products, fetchProducts } = useProductStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<MovementType | ''>('');

  useEffect(() => {
    fetchMovements();
    fetchProducts({ limit: 100 }); // Busca produtos para o filtro
  }, [fetchMovements, fetchProducts]);

  const handleFilter = (productId: string, type: string) => {
    fetchMovements({
      productId: productId || undefined,
      type: (type as MovementType) || undefined,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    fetchMovements({ page: newPage });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Movimentações
          </h1>
          <p className="text-muted mt-1">
            Histórico de entradas e saídas do estoque
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          Nova Movimentação
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-surface p-4 rounded-xl border border-border">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted uppercase mb-1.5">
            Filtrar por Produto
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              handleFilter(e.target.value, selectedType);
            }}
            className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-accent/40 outline-none cursor-pointer"
          >
            <option value="">Todos os produtos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (SKU: {p.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-64">
          <label className="block text-xs font-medium text-muted uppercase mb-1.5">
            Tipo de Movimento
          </label>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value as MovementType);
              handleFilter(selectedProductId, e.target.value);
            }}
            className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-accent/40 outline-none cursor-pointer"
          >
            <option value="">Todas</option>
            <option value="ENTRY">Entrada</option>
            <option value="EXIT">Saída</option>
          </select>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full min-w-[50rem]">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">
                Data
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">
                Tipo
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">
                Produto
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted uppercase">
                Quantidade
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted uppercase">
                Motivo/Obs
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted uppercase">
                Responsável
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted">
                  Carregando histórico...
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted">
                  Nenhuma movimentação encontrada
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="hover:bg-border/30 transition-colors"
                >
                  <td className="px-6 py-4 text-muted font-mono text-sm">
                    {formatDate(movement.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {movement.type === 'ENTRY' ? (
                      <Badge
                        variant="default"
                        className="bg-status-ok-bg/20 text-status-ok-text border-status-ok-text/30 gap-1.5 flex w-fit items-center"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        ENTRADA
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="bg-status-critical-bg/20 text-status-critical-text border-status-critical-text/30 gap-1.5 flex w-fit items-center"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        SAÍDA
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      {movement.product.name}
                    </div>
                    <div className="text-xs text-muted font-mono">
                      {movement.product.sku}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-foreground">
                    {movement.type === 'ENTRY' ? '+' : '-'}
                    {movement.quantity}
                  </td>
                  <td className="px-6 py-4 text-muted text-sm max-w-48 truncate">
                    {movement.reason || '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-muted text-sm">
                    {movement.user.name}
                  </td>
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

      <MovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
