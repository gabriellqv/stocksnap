'use client';

import { useAuthStore } from '../stores/auth-store';
import { Button } from './ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * @description Barra superior do layout do dashboard.
 * Exibe o nome do usuário autenticado e um botão de logout.
 * Consome o estado de autenticação diretamente do Zustand auth store.
 */
export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <UserIcon className="w-4 h-4" />
            <span>{user.name}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </header>
  );
}
