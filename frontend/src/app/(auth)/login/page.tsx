'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

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
      // Intentionally suppressing errors as they are globally handled by the auth-store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl border border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="w-8 h-8 text-accent" />
              <h1 className="text-3xl font-bold text-foreground">StockSnap</h1>
            </div>
            <p className="text-muted">Entre na sua conta</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive-muted text-destructive px-4 py-3 rounded-lg mb-6 text-sm border border-destructive/20">
              {error}
            </div>
          )}

          {/* Form */}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
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
