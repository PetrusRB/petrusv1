import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
export const withClerk = clerkMiddleware();
export const requireAuth = async (c, next) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('userId', auth.userId);
    return await next();
};
export const getUserId = (c) => c.get('userId');
