import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { Context, Next } from 'hono';

export const withClerk = clerkMiddleware();

export const requireAuth = async (c: Context, next: Next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', auth.userId);
  return await next();
};

export const getUserId = (c: Context) => c.get('userId') as string;
