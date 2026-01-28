import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import {
  ClerkEventSchema,
  UserSessionSchema,
  LoginRedirectSchema,
} from './auth.schema.js';
import { AuthService } from './auth.service.js';
import { verifyClerkWebhook, verifySessionToken } from '@/lib/clerk.js';
import { logger } from '@/lib/logger.js';

export class AuthController {
  static async webhook(c: Context) {
    const signature = c.req.header('Clerk-Signature');
    if (!signature) return c.json({ error: 'Missing signature' }, 400);

    try {
      const raw = c.req.raw;
      const verified = await verifyClerkWebhook(raw, signature);
      const parsed = ClerkEventSchema.parse(verified);
      await AuthService.handleWebhook(parsed);
      return c.json({ success: true });
    } catch (err) {
      logger.error({ err }, 'Webhook error');
      return c.json({ error: 'Invalid webhook' }, 400);
    }
  }

  static login(c: Context) {
    try {
      const query = LoginRedirectSchema.parse({
        redirect_url: c.req.query('redirect_url'),
      });

      const baseUrl =
        process.env.CLERK_SIGN_IN_URL ||
        `https://${process.env.CLERK_DOMAIN}/v1/sign-in`;

      const redirectUrl =
        query.redirect_url ||
        process.env.CLERK_REDIRECT_URL ||
        `${process.env.FRONTEND_URL}/auth/callback`;

      const clerkSignInUrl = new URL(baseUrl);
      clerkSignInUrl.searchParams.set('redirect_url', redirectUrl);

      return c.redirect(clerkSignInUrl.toString());
    } catch (err) {
      logger.error({ err }, 'Login redirect error');
      return c.json({ error: 'Invalid redirect URL' }, 400);
    }
  }

  static async callback(c: Context) {
    try {
      const token =
        c.req.query('token') ||
        c.req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return c.json({ error: 'Missing authentication token' }, 401);
      }

      // Verificar token com Clerk
      const session = await verifySessionToken(token);

      if (!session || !session.userId) {
        return c.json({ error: 'Invalid or expired session' }, 401);
      }

      // Obter ou criar usuário
      const user = await AuthService.getOrCreateUser(session.userId);

      // Criar sessão local
      const localSession = await AuthService.createLocalSession({
        clerkUserId: session.userId,
        email: session.user?.emailAddresses?.[0]?.emailAddress,
        name: `${session.user?.firstName || ''} ${
          session.user?.lastName || ''
        }`.trim(),
        avatar: session.user?.imageUrl || undefined,
        metadata: session.user?.publicMetadata,
      });

      // Definir cookies seguros
      const secure = process.env.NODE_ENV === 'production';
      const maxAge = 7 * 24 * 60 * 60; // 7 dias

      setCookie(c, 'session_id', localSession.id, {
        httpOnly: true,
        secure,
        sameSite: 'Strict',
        maxAge,
        path: '/',
      });

      setCookie(c, 'user_id', user.id, {
        secure,
        sameSite: 'Strict',
        maxAge,
        path: '/',
      });

      // Redirecionar para frontend ou retornar dados
      const redirectUrl =
        c.req.query('redirect_url') || process.env.FRONTEND_URL || '/';
      return c.redirect(`${redirectUrl}?session_id=${localSession.id}`);
    } catch (err) {
      logger.error({ err }, 'Auth callback error');
      return c.json({ error: 'Authentication failed' }, 401);
    }
  }

  static async logout(c: Context) {
    try {
      // Obter session_id do cookie
      const sessionId = getCookie(c, 'session_id');

      if (sessionId) {
        // Revogar sessão local
        await AuthService.revokeLocalSession(sessionId);
      }

      // Limpar cookies
      deleteCookie(c, 'session_id', { path: '/' });
      deleteCookie(c, 'user_id', { path: '/' });

      // Redirecionar para Clerk logout
      const clerkSignOutUrl =
        process.env.CLERK_SIGN_OUT_URL ||
        `https://${process.env.CLERK_DOMAIN}/v1/sign-out`;

      return c.redirect(clerkSignOutUrl);
    } catch (err) {
      logger.error({ err }, 'Logout error');
      return c.body(null, 204);
    }
  }

  static async me(c: Context) {
    try {
      const sessionId =
        getCookie(c, 'session_id') || c.req.header('X-Session-ID');

      if (!sessionId) {
        return c.json({ error: 'Not authenticated' }, 401);
      }

      const session = await AuthService.getSession(sessionId);

      if (!session || session.expiresAt < new Date()) {
        return c.json({ error: 'Session expired' }, 401);
      }

      const user = await AuthService.getUser(session.userId);

      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Retornar informações do usuário
      const userData = UserSessionSchema.parse({
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

      return c.json({ user: userData });
    } catch (err) {
      logger.error({ err }, 'Get user error');
      return c.json({ error: 'Failed to get user data' }, 500);
    }
  }

  static async refresh(c: Context) {
    try {
      const sessionId = getCookie(c, 'session_id');

      if (!sessionId) {
        return c.json({ error: 'No session to refresh' }, 401);
      }

      const newSession = await AuthService.refreshSession(sessionId);

      if (!newSession) {
        return c.json({ error: 'Failed to refresh session' }, 401);
      }

      // Atualizar cookie
      const secure = process.env.NODE_ENV === 'production';
      const maxAge = 7 * 24 * 60 * 60;

      setCookie(c, 'session_id', newSession.id, {
        httpOnly: true,
        secure,
        sameSite: 'Strict',
        maxAge,
        path: '/',
      });

      return c.json({ success: true, session_id: newSession.id });
    } catch (err) {
      logger.error({ err }, 'Refresh session error');
      return c.json({ error: 'Session refresh failed' }, 500);
    }
  }
}
