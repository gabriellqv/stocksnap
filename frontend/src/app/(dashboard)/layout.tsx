'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { BottomNav } from '@/components/bottom-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

/**
 * @description Layout compartilhado por todas as páginas do dashboard.
 * Renderiza a Sidebar em telas desktop e a barra de navegação inferior (BottomNav)
 * em dispositivos móveis, respeitando as áreas seguras (notches e home indicators).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === '/';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        {/* Mobile header — topo minimalista com logo e tema, respeitando safe-area-top */}
        <header
          className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface lg:hidden shrink-0"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <Logo className="w-5 h-5 text-accent" />
            <h1 className="text-lg font-bold text-foreground">StockSnap</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Conteúdo: scroll vertical para mobile; no dashboard desktop mantém o viewport fit sem scroll */}
        <main
          className={cn(
            'flex-1 overflow-y-auto p-3.5 pb-28 md:p-5 md:pb-28 lg:p-4 2xl:p-6 min-h-0',
            isDashboard
              ? 'lg:overflow-hidden lg:pb-4 lg:flex lg:flex-col'
              : 'lg:pb-8',
          )}
        >
          <div
            className={cn(
              'w-full max-w-[2560px] mx-auto',
              isDashboard ? 'lg:flex-1 lg:min-h-0 lg:flex lg:flex-col' : '',
            )}
          >
            {children}
          </div>
        </main>

        {/* Barra de navegação inferior em mobile (Bottom Tab Bar) */}
        <BottomNav onOpenMenu={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}
