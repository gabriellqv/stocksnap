/**
 * @fileoverview Página de log e histórico transacional de movimentações de estoque.
 */

'use client';

import { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Plus, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/export-csv';
import { useMovementStore } from '@/stores/movement-store';
import { useProductStore } from '@/stores/product-store';
import { MovementModal } from '@/components/movement-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
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
    /** Pre-fetch dos produtos para popular o select do filtro de busca */
    fetchProducts({ limit: 100 });
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

  const handleExportCSV = () => {
    const data = movements.map((m) => ({
      Data: formatDate(m.createdAt),
      Tipo: m.type === 'ENTRY' ? 'Entrada' : 'Saída',
      Produto: m.product.name,
      Quantidade: m.quantity,
      Motivo: m.reason || '',
      Usuário: m.user.name,
    }));
    exportToCsv(data, 'Movimentacoes');
  };

  return (
    <div className="space-y-6 2xl:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl 2xl:text-4xl 3xl:text-5xl font-bold tracking-tight text-foreground">
            Movimentações
          </h1>
          <p className="text-muted mt-1 2xl:text-base 3xl:text-lg">
            Histórico de entradas e saídas do estoque
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 2xl:gap-3 w-full sm:w-auto 2xl:h-11 2xl:px-5 2xl:text-base"
        >
          <Plus className="w-5 h-5 2xl:w-6 2xl:h-6" />
          Nova Movimentação
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 2xl:gap-6 bg-surface p-4 2xl:p-6 rounded-xl 2xl:rounded-2xl border border-border">
        <div className="flex-1">
          <label className="block text-xs 2xl:text-sm font-medium text-muted uppercase mb-1.5 2xl:mb-2">
            Filtrar por Produto
          </label>
          <Select
            value={selectedProductId}
            onChange={(val) => {
              setSelectedProductId(val);
              handleFilter(val, selectedType);
            }}
            options={[
              { value: '', label: 'Todos os produtos' },
              ...products.map((p) => ({
                value: p.id,
                label: `${p.name} (SKU: ${p.sku})`,
              })),
            ]}
          />
        </div>

        <div className="w-full sm:w-64 2xl:w-80">
          <label className="block text-xs 2xl:text-sm font-medium text-muted uppercase mb-1.5 2xl:mb-2">
            Tipo de Movimento
          </label>
          <Select
            value={selectedType}
            onChange={(val) => {
              setSelectedType(val as MovementType);
              handleFilter(selectedProductId, val);
            }}
            options={[
              { value: '', label: 'Todas' },
              { value: 'ENTRY', label: 'Entrada' },
              { value: 'EXIT', label: 'Saída' },
            ]}
          />
        </div>

        <div className="flex items-end w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="gap-2 2xl:gap-3 w-full hover:text-accent hover:border-accent/30 transition-colors 2xl:h-11 2xl:px-5 2xl:text-base"
            disabled={movements.length === 0}
          >
            <Download className="w-4 h-4 2xl:w-5 2xl:h-5" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="bg-surface rounded-xl 2xl:rounded-2xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full min-w-[50rem]">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 2xl:px-8 2xl:py-4 text-xs 2xl:text-sm font-medium text-muted uppercase">
                Data
              </th>
              <th className="text-left px-6 py-3 2xl:px-8 2xl:py-4 text-xs 2xl:text-sm font-medium text-muted uppercase">
                Tipo
              </th>
              <th className="text-left px-6 py-3 2xl:px-8 2xl:py-4 text-xs 2xl:text-sm font-medium text-muted uppercase">
                Produto
              </th>
              <th className="text-right px-6 py-3 2xl:px-8 2xl:py-4 text-xs 2xl:text-sm font-medium text-muted uppercase">
                Quantidade
              </th>
              <th className="text-left px-6 py-3 2xl:px-8 2xl:py-4 text-xs 2xl:text-sm font-medium text-muted uppercase">
                Motivo/Obs
              </th>
              <th className="text-right px-6 py-3 2xl:px-8 2xl:py-4 text-xs 2xl:text-sm font-medium text-muted uppercase">
                Responsável
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-muted 2xl:text-base"
                >
                  Carregando histórico...
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-muted 2xl:text-base"
                >
                  Nenhuma movimentação encontrada
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="hover:bg-border/30 transition-colors"
                >
                  <td className="px-6 py-4 2xl:px-8 2xl:py-5 text-muted font-mono text-sm 2xl:text-base">
                    {formatDate(movement.createdAt)}
                  </td>
                  <td className="px-6 py-4 2xl:px-8 2xl:py-5">
                    {movement.type === 'ENTRY' ? (
                      <Badge
                        variant="default"
                        className="bg-status-ok-bg/20 text-status-ok-text border-status-ok-text/30 gap-1.5 flex w-fit items-center 2xl:text-xs 2xl:px-3 2xl:py-1"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                        ENTRADA
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="bg-status-critical-bg/20 text-status-critical-text border-status-critical-text/30 gap-1.5 flex w-fit items-center 2xl:text-xs 2xl:px-3 2xl:py-1"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                        SAÍDA
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 2xl:px-8 2xl:py-5">
                    <div className="font-medium text-foreground 2xl:text-base">
                      {movement.product.name}
                    </div>
                    <div className="text-xs 2xl:text-sm text-muted font-mono">
                      {movement.product.sku}
                    </div>
                  </td>
                  <td className="px-6 py-4 2xl:px-8 2xl:py-5 text-right font-mono font-medium text-foreground 2xl:text-base">
                    {movement.type === 'ENTRY' ? '+' : '-'}
                    {movement.quantity}
                  </td>
                  <td className="px-6 py-4 2xl:px-8 2xl:py-5 text-muted text-sm 2xl:text-base max-w-48 2xl:max-w-64 truncate">
                    {movement.reason || '-'}
                  </td>
                  <td className="px-6 py-4 2xl:px-8 2xl:py-5 text-right text-muted text-sm 2xl:text-base">
                    {movement.user.name}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 2xl:mt-6">
          <p className="text-sm 2xl:text-base text-muted text-center sm:text-left">
            Mostrando {(meta.page - 1) * meta.limit + 1} a{' '}
            {Math.min(meta.page * meta.limit, meta.total)} de {meta.total}{' '}
            resultados
          </p>
          <div className="flex gap-2 2xl:gap-3">
            <Button
              variant="outline"
              className="2xl:h-11 2xl:px-5 2xl:text-base"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              className="2xl:h-11 2xl:px-5 2xl:text-base"
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
