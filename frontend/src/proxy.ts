import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection proxy execution.
 *
 * Runs on the Edge Runtime before page load to verify the presence of an
 * authentication token. Since `localStorage` is unavailable at the Edge,
 * this proxy relies exclusively on HttpOnly/Secure cookies.
 *
 * @note Migrated from `middleware.ts` to `proxy.ts` conforming to Next.js 16 standards.
 */

const publicPaths = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('stocksnap-token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
