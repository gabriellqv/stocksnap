'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Tags,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onOpenMenu: () => void;
}

const navItems = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/products', label: 'Produtos', icon: Package },
  { href: '/movements', label: 'Movimentar', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categorias', icon: Tags },
];

/**
 * @description Barra de navegação inferior (Bottom Tab Bar) para dispositivos móveis.
 * Proporciona ergonomia de toque na zona do polegar (Thumb Zone) e respeita as
 * áreas seguras de navegação (Safe Area Insets) de iPhones (Home Indicator)
 * e Androids com barra de navegação virtual por botões ou gestos.
 */
export function BottomNav({ onOpenMenu }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação móvel inferior"
      className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border/80 lg:hidden transition-colors"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.375rem)',
      }}
    >
      {/* Barrinha divisora superior: azul mais escuro e sóbrio no meio, perdendo força em direção às pontas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-600/85 to-transparent"
      />
      {/* Brilho suave sutil no tom azul profundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px left-1/2 -translate-x-1/2 w-1/2 max-w-xs h-[1.5px] bg-gradient-to-r from-transparent via-blue-600/25 to-transparent blur-[0.5px]"
      />

      <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 select-none touch-manipulation',
                isActive
                  ? 'text-accent font-semibold'
                  : 'text-muted hover:text-foreground active:scale-95',
              )}
            >
              <div
                className={cn(
                  'p-1 rounded-lg transition-colors',
                  isActive && 'bg-accent-muted',
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Botão de Menu para Acessar Perfil, Tema e Logout */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-muted hover:text-foreground active:scale-95 transition-all duration-200 select-none touch-manipulation cursor-pointer"
          aria-label="Abrir menu e configurações"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
