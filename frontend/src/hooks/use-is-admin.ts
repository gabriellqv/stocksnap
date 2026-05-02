import { useAuthStore } from '@/stores/auth-store';

/**
 * @description Hook utilitário para verificação de papel (role) do usuário autenticado.
 * Retorna `true` se o usuário logado possuir o papel `ADMIN`.
 *
 * Utilizado para controle de acesso baseado em papéis (RBAC) no frontend,
 * ocultando ações de criação, edição e exclusão para usuários `OPERATOR`.
 *
 * @returns {boolean} `true` se o usuário autenticado for administrador.
 */
export function useIsAdmin(): boolean {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'ADMIN';
}
