import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Verifica se a rota é privada
 * - /privado/*
 * - /(privado)/*
 */
const isProtectedRoute = createRouteMatcher(['/(privado)(.*)']);
/**
 * Middleware Clerk-friendly e totalmente tipada
 *
 * Observação: usamos ReturnType<NextMiddleware> para corresponder ao tipo
 * que o Clerk espera para retornos de middleware (NextMiddlewareReturn).
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Protege rotas não públicas
  return NextResponse.next();
});

/**
 * Config do middleware (matcher)
 */
export const config: { matcher: string[] } = {
  matcher: [
    '/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(en|pt-br)/:path*',
    '/',
    '/(api|trpc)(.*)',
    '/(privado)(.*)',
    '/(privado)',
  ],
};
