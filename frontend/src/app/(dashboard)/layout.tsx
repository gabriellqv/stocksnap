'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { BottomNav } from '@/components/bottom-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';

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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header — topo minimalista com logo e tema, respeitando safe-area-top */}
        <header
          className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface lg:hidden"
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

        {/* Conteúdo com padding inferior em mobile para não colidir com o BottomNav */}
        <main className="flex-1 overflow-auto p-4 pb-24 md:p-6 md:pb-24 lg:pb-8 lg:p-8 2xl:p-10 3xl:p-12 4xl:p-16">
          <div className="w-full max-w-[2560px] mx-auto min-h-full flex flex-col">
            {children}
          </div>
        </main>

        {/* Barra de navegação inferior em mobile (Bottom Tab Bar) */}
        <BottomNav onOpenMenu={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}
