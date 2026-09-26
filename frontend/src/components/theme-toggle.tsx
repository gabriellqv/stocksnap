'use client';

import { useState, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';

/**
 * @description Retorna `true` quando executado no client (após hidratação).
 * Utiliza `useSyncExternalStore` ao invés de `useEffect` + `useState`
 * para evitar o warning `react-hooks/set-state-in-effect` e garantir
 * uma renderização síncrona sem cascata de re-renders.
 */
function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * @description Botão para alternar entre os temas claro e escuro.
 * Possui animação suave de giro (360°), escala e transição elástica entre os ícones de Sol e Lua.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();
  const [spinCount, setSpinCount] = useState(0);

  if (!mounted) {
    return (
      <button
        type="button"
        className="p-2 text-muted hover:text-foreground transition-colors duration-200 cursor-pointer rounded-xl hover:bg-border/50"
        title="Alternar Tema"
        aria-label="Alternar Tema"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const isDark = resolvedTheme ? resolvedTheme === 'dark' : theme !== 'light';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
    setSpinCount((prev) => prev + 1);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'p-2 text-muted hover:text-foreground hover:bg-border/50 transition-colors duration-200 cursor-pointer rounded-xl',
        'flex items-center justify-center select-none active:scale-90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
      )}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      aria-label="Alternar Tema"
    >
      <div
        key={spinCount}
        className={cn(
          'w-5 h-5 flex items-center justify-center',
          spinCount > 0 && 'animate-theme-spin',
        )}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-foreground" />
        ) : (
          <Moon className="w-5 h-5 text-foreground" />
        )}
      </div>
    </button>
  );
}
