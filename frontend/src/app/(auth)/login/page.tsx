'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';

/**
 * @description Página de autenticação do sistema (rota `/login`).
 * Renderiza o formulário de login com validação client-side e
 * feedback visual de erros provido pelo Zustand auth store.
 * Após autenticação bem-sucedida, redireciona para o dashboard.
 */
export default function LoginPage() {
  const router = useRouter();

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      router.push('/');
    } catch {
      // Omitindo erro intencionalmente, já lidamos com ele de forma global na store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl border border-border p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="w-8 h-8 text-accent" />
              <h1 className="text-3xl font-bold text-foreground">StockSnap</h1>
            </div>
            <p className="text-muted">Entre na sua conta</p>
          </div>

          {error && (
            <div className="bg-destructive-muted text-destructive px-4 py-3 rounded-lg mb-6 text-sm border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none transition-all duration-200"
                placeholder="admin@stocksnap.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none transition-all duration-200"
                placeholder="******"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full mt-2">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-background rounded-lg border border-border">
            <p className="text-xs text-muted font-medium">Conta de teste:</p>
            <p className="text-xs text-muted">admin@stocksnap.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
