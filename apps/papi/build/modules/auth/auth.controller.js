import { ClerkEventSchema } from './auth.schema.js';
import { AuthService } from './auth.service.js';
import { verifyClerkWebhook } from '../../lib/clerk.js';
import { logger } from '../../lib/logger.js';
export class AuthController {
    static async webhook(c) {
        const signature = c.req.header('Clerk-Signature');
        if (!signature)
            return c.json({ error: 'Missing signature' }, 400);
        try {
            const raw = c.req.raw;
            const verified = await verifyClerkWebhook(raw, signature);
            const parsed = ClerkEventSchema.parse(verified);
            await AuthService.handleWebhook(parsed);
            return c.json({ success: true });
        }
        catch (err) {
            logger.error({ err }, 'Webhook error');
            return c.json({ error: 'Invalid webhook' }, 400);
        }
    }
    static login(c) {
        const url = process.env.CLERK_SIGN_IN_URL ??
            `https://clerk.com/sign-in?redirect_url=${process.env.CLERK_REDIRECT_URL}`;
        return c.redirect(url);
    }
    static logout(c) {
        return c.body(null, 204);
    }
}
