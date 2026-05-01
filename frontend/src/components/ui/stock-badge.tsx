/**
 * @fileoverview Componente visual para status de estoque.
 */

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Propriedades para o componente StockBadge.
 */
interface StockBadgeProps {
  quantity: number;
  minQuantity: number;
}

/**
 * @description Exibe uma tag (badge) estilizada indicando a saúde do estoque.
 * Possui três níveis visuais: Crítico, Atenção e Normal.
 */
export function StockBadge({ quantity, minQuantity }: StockBadgeProps) {
  const isCritical = quantity <= minQuantity;
  const isWarning = quantity <= minQuantity * 2 && !isCritical;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-mono',
        isCritical && 'bg-red-100 text-red-800',
        isWarning && 'bg-yellow-100 text-yellow-800',
        !isCritical && !isWarning && 'bg-green-100 text-green-800',
      )}
    >
      {isCritical && <AlertTriangle className="w-3.5 h-3.5" />}
      {quantity} un.
    </span>
  );
}
