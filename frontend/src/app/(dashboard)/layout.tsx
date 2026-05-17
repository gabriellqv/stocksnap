'use client';

import { useState } from 'react';
import { Menu, Package } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { Logo } from '@/components/logo';

/**
 * @description Layout compartilhado por todas as páginas do dashboard.
 * Renderiza a Sidebar à esquerda e o conteúdo da página à direita.
 * Em viewports mobile (<1024px), exibe um header com botão hamburger
 * para controlar a visibilidade da Sidebar (drawer offcanvas).
 * A proteção de rota é delegada ao proxy (Edge Runtime), dispensando
 * verificações de autenticação no client-side.
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
        {/* Mobile header — visible only below lg breakpoint */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-muted hover:text-foreground hover:bg-border/50 rounded-lg transition-colors cursor-pointer"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Logo className="w-5 h-5 text-accent" />
            StockSnap
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
