'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { DemoResetResult } from '@/types';
import { cn } from '@/lib/utils';

/**
 * @description Botão de manutenção que restaura os dados de demonstração.
 *
 * A conta ADMIN é pública neste portfólio, então visitantes podem alterar ou
 * apagar os dados. Este botão chama `POST /demo/reset` para reconstruir o estado
 * canônico, mantendo a demo sempre apresentável. É renderizado apenas para ADMIN
 * (via `useIsAdmin`), e o backend valida o papel independentemente.
 */
export function ResetDemoButton() {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Restaurar os dados de demonstração? Produtos, categorias e movimentações ' +
        'atuais serão substituídos pelo conjunto original.',
    );
    if (!confirmed) return;

    setIsResetting(true);
    try {
      const result = await api.post<DemoResetResult>('/demo/reset', {});
      toast.success(
        `Dados restaurados: ${result.categories} categorias, ` +
          `${result.products} produtos e ${result.movements} movimentações.`,
      );
      /** Recarrega para refletir o estado restaurado em todas as telas. */
      window.location.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao restaurar demonstração',
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={isResetting}
      className={cn(
        'w-full flex items-center justify-center gap-2 px-3 py-2.5 lg:py-2 text-sm lg:text-xs 2xl:text-sm font-medium',
        'text-muted hover:text-accent hover:bg-accent/10 border border-border/60 dark:border-white/[0.08]',
        'hover:border-accent/30 rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98] backdrop-blur-sm',
        isResetting && 'opacity-60 cursor-not-allowed',
      )}
      title="Restaurar dados de demonstração"
      aria-label="Restaurar dados de demonstração"
    >
      <RotateCcw
        className={cn(
          'w-4 h-4 2xl:w-4.5 2xl:h-4.5 shrink-0',
          isResetting && 'animate-spin',
        )}
      />
      <span>{isResetting ? 'Restaurando...' : 'Restaurar demo'}</span>
    </button>
  );
}
