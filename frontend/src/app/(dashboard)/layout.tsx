'use client';

import { Sidebar } from '@/components/sidebar';

/**
 * @description Layout compartilhado por todas as páginas do dashboard.
 * Renderiza a Sidebar à esquerda e o conteúdo da página à direita.
 * A proteção de rota é delegada ao proxy (Edge Runtime), dispensando
 * verificações de autenticação no client-side.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
