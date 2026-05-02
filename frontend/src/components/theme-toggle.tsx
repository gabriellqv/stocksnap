'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

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
 * Exibe o ícone `Sun` (sol) quando o tema ativo é escuro e `Moon` (lua) quando é claro,
 * indicando visualmente para qual tema o usuário será alternado ao clicar.
 * Renderiza um placeholder inerte durante a hidratação (SSR) para evitar mismatch.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <button
        className="p-2 text-muted hover:text-foreground transition-colors duration-200 cursor-pointer rounded-lg hover:bg-border/50"
        title="Alternar Tema"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 text-muted hover:text-foreground transition-colors duration-200 cursor-pointer rounded-lg hover:bg-border/50 flex items-center justify-center"
      title="Alternar Tema"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
