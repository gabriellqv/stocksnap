import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy para proteção de rotas.
 *
 * Roda no Edge Runtime (antes da página carregar) e verifica
 * se o cookie/localStorage tem token. Como localStorage não é
 * acessível no Edge, usamos uma abordagem baseada em cookies.
 *
 * Alternativa simples: verificar no client-side via Zustand store.
 *
 * Migrado de middleware.ts -> proxy.ts (Next.js 16).
 */

// Rotas que NÃO precisam de autenticação
const publicPaths = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas - deixar passar
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verificar token no cookie (setado pelo login)
  const token = request.cookies.get('stocksnap-token')?.value;

  if (!token) {
    // Redirecionar para login se não autenticado
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Aplicar proxy apenas nas rotas do app (não em _next, imagens, etc.)
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
