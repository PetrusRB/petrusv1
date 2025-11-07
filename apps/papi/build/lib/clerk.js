import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { Webhook } from 'svix';
export const verifyClerkWebhook = async (req, secret) => {
    const payload = await req.text();
    const svix_id = req.headers.get('svix-id');
    const svix_timestamp = req.headers.get('svix-timestamp');
    const svix_signature = req.headers.get('svix-signature');
    if (!svix_id || !svix_timestamp || !svix_signature) {
        throw new Error('Missing Clerk webhook headers');
    }
    const wh = new Webhook(secret);
    return wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
    });
};
export const clerkApp = new Hono();
export function useClerk(app) {
    app.use('*', clerkMiddleware());
}
export function getClerkAuth(ctx) {
    // getAuth(ctx) retorna userId, sessionId e roles conforme SDK
    return getAuth(ctx);
}
