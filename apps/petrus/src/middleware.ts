import {
  clerkMiddleware,
  type ClerkMiddlewareAuth,
} from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Verifica se a rota é privada
 * - /privado/*
 * - /(privado)/*
 */
const isPrivateRoute = (pathname: string): boolean =>
  /^\/(?:\(privado\)|privado)(?:\/.*)?$/.test(pathname);

/**
 * Middleware Clerk-friendly e totalmente tipada
 *
 * Observação: usamos ReturnType<NextMiddleware> para corresponder ao tipo
 * que o Clerk espera para retornos de middleware (NextMiddlewareReturn).
 */
export default clerkMiddleware(
  async (auth: ClerkMiddlewareAuth, request: NextRequest) => {
    const { userId }: { userId: string | null } = await auth();

    // Se for rota privada e o usuário não estiver autenticado, vai redireciona-lo para /
    if (isPrivateRoute(request.nextUrl.pathname) && !userId) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      console.log('Testando... Middleware');
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }
);

/**
 * Config do middleware (matcher)
 */
export const config: { matcher: string[] } = {
  matcher: [
    '/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(en|pt-br)/:path*',
    '/',
    '/(privado)(.*)',
    '/(privado)',
  ],
};
