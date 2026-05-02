'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting until mounted
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 text-muted hover:text-foreground transition-colors duration-200 cursor-pointer rounded-lg hover:bg-border/50"
        title="Alternar Tema"
      >
        <div className="w-5 h-5" /> {/* Placeholder */}
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
