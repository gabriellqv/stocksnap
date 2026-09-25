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
          'fixed inset-y-0 left-0 z-50 w-64 2xl:w-72 3xl:w-80 bg-surface border-r border-border flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'lg:static lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-6 2xl:p-8 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-xl 2xl:text-2xl 3xl:text-3xl font-bold text-foreground flex items-center gap-2 2xl:gap-3">
              <Logo className="w-6 h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8 text-accent" />
              StockSnap
            </h1>
            <p className="text-sm 2xl:text-base text-muted mt-1">Controle de Estoque</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-border/50 lg:hidden cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 2xl:p-6 space-y-1.5 2xl:space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 2xl:gap-4 px-3 py-2.5 2xl:px-4 2xl:py-3.5 3xl:py-4 rounded-lg 2xl:rounded-xl text-sm 2xl:text-base font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent-muted text-accent font-semibold'
                    : 'text-muted hover:bg-border/50 hover:text-foreground',
                )}
              >
                <item.icon className="w-5 h-5 2xl:w-6 2xl:h-6" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 2xl:p-6 border-t border-border">
          <div className="flex items-center gap-3 2xl:gap-4">
            <div className="w-8 h-8 2xl:w-10 2xl:h-10 bg-accent-muted rounded-full flex items-center justify-center">
              <span className="text-sm 2xl:text-base font-medium text-accent">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm 2xl:text-base font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs 2xl:text-sm text-muted">{user?.role}</p>
            </div>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 2xl:p-2.5 text-muted hover:text-destructive transition-colors duration-200 cursor-pointer rounded-lg hover:bg-border/50"
              title="Sair"
            >
              <LogOut className="w-5 h-5 2xl:w-6 2xl:h-6" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
