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

/** Lista de rotas públicas que ignoram o middleware de autenticação */
const publicPaths = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /** Libera acesso irrestrito para rotas estáticas ou de autenticação */
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  /** Extrai e valida o token JWT persistido nos cookies da requisição */
  const token = request.cookies.get('stocksnap-token')?.value;

  if (!token) {
    /** Intercepta acessos anônimos a rotas protegidas e redireciona ao login */
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /** Aplica as regras de middleware exclusivamente em páginas, ignorando assets e rotas internas do Next.js */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|api).*)'],
};
