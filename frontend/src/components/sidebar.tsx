'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Tags,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';

/**
 * @description Itens do menu lateral com rota, label e ícone Lucide correspondente.
 */
const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Produtos', icon: Package },
  { href: '/movements', label: 'Movimentações', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categorias', icon: Tags },
];

/**
 * @description Propriedades do componente Sidebar.
 * O controle de visibilidade é delegado ao layout pai (DashboardLayout).
 */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * @description Barra lateral de navegação principal do dashboard.
 * Renderiza o logo, os links de navegação com estado ativo baseado na rota atual,
 * e o painel do usuário autenticado com botão de logout.
 *
 * Em viewports mobile (<1024px), comporta-se como um drawer offcanvas
 * com overlay backdrop. Em desktop (>=1024px), permanece fixa na lateral esquerda.
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-0 z-50 w-full h-full lg:h-auto lg:static lg:z-auto lg:w-64 2xl:w-72 3xl:w-80 bg-surface/80 dark:bg-surface/65 backdrop-blur-2xl border-r border-border/70 dark:border-white/[0.08] flex flex-col relative overflow-hidden',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Luz ambiente interna suave para refração realista do vidro fosco */}
        <div className="pointer-events-none absolute -top-24 -left-20 w-64 h-64 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -right-28 w-56 h-56 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl" />

        <div
          className="p-5 sm:p-6 2xl:p-8 border-b border-border/60 dark:border-white/[0.06] flex items-center justify-between relative z-10"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)',
          }}
        >
          <div>
            <h1 className="text-xl 2xl:text-2xl 3xl:text-3xl font-bold text-foreground flex items-center gap-2.5 2xl:gap-3">
              <Logo className="w-6 h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8 text-accent" />
              StockSnap
            </h1>
            <p className="text-xs sm:text-sm 2xl:text-base text-muted mt-0.5">Controle de Estoque</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-muted hover:text-foreground active:scale-95 transition-colors rounded-xl hover:bg-white/[0.06] dark:hover:bg-white/[0.04] lg:hidden cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 sm:p-5 2xl:p-6 space-y-2 2xl:space-y-2.5 relative z-10">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'relative flex items-center gap-3.5 2xl:gap-4 px-4 py-3 lg:py-2.5 2xl:py-3 rounded-xl text-base lg:text-sm 2xl:text-base font-medium transition-all duration-200 active:scale-[0.98]',
                  isActive
                    ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] dark:from-white/[0.06] dark:to-white/[0.01] text-blue-600 dark:text-blue-400 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] border border-white/15 dark:border-white/[0.12] border-t-white/30 backdrop-blur-md'
                    : 'text-muted hover:bg-white/[0.04] dark:hover:bg-white/[0.03] hover:text-foreground border border-transparent hover:border-white/5',
                )}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[1px] top-0 bottom-0 w-8 rounded-l-xl border-l-[2.5px] border-t-[2.5px] border-b-[2.5px] border-blue-600 dark:border-blue-400 [filter:drop-shadow(-2px_0_6px_rgba(37,99,235,0.75))] dark:[filter:drop-shadow(-2px_0_8px_rgba(96,165,250,0.85))]"
                    style={{
                      WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                      maskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                    }}
                  />
                )}
                <item.icon
                  className={cn(
                    'w-5 h-5 2xl:w-6 2xl:h-6 shrink-0 transition-colors',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted',
                  )}
                />
                <span className={isActive ? 'text-foreground font-semibold' : ''}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          className="p-4 sm:p-5 2xl:p-6 border-t border-border/60 dark:border-white/[0.06] space-y-3 relative z-10"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)',
          }}
        >
          <div className="flex items-center gap-3.5 2xl:gap-4">
            <div className="w-10 h-10 2xl:w-11 2xl:h-11 bg-accent-muted rounded-full flex items-center justify-center shrink-0">
              <span className="text-base 2xl:text-lg font-semibold text-accent">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base lg:text-sm 2xl:text-base font-semibold text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs 2xl:text-sm text-muted capitalize truncate">{user?.role?.toLowerCase()}</p>
            </div>
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 lg:py-2 text-sm lg:text-xs 2xl:text-sm font-medium text-muted hover:text-destructive hover:bg-destructive/10 border border-border/60 dark:border-white/[0.08] hover:border-destructive/20 rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98] backdrop-blur-sm"
            title="Sair da conta"
            aria-label="Sair da conta"
          >
            <LogOut className="w-4 h-4 2xl:w-4.5 2xl:h-4.5 shrink-0" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
