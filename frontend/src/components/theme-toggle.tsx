'use client';

import { useSyncExternalStore } from 'react';
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

  const isDark = (theme || resolvedTheme) === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative p-2 text-muted hover:text-foreground transition-all duration-300 cursor-pointer rounded-xl hover:bg-border/50',
        'flex items-center justify-center select-none active:scale-90 active:rotate-12',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
      )}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      aria-label="Alternar Tema"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Ícone Sol: visível no tema escuro, gira 360° e escala para 0 ao mudar para claro */}
        <Sun
          className={cn(
            'w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-[360deg] scale-0 opacity-0 pointer-events-none absolute',
          )}
        />
        {/* Ícone Lua: visível no tema claro, gira 360° e cresce ao mudar para claro */}
        <Moon
          className={cn(
            'w-5 h-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            !isDark
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-[360deg] scale-0 opacity-0 pointer-events-none absolute',
          )}
        />
      </div>
    </button>
  );
}
