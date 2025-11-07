import { prisma } from '../../lib/index.js';
import { getUserId } from '../../middlewares/auth.js';
import { safeJSON } from '../../lib/crypto.js';
import { UpdateProfileSchema } from './user.schema.js';
export class UserController {
    static async getUser(c) {
        const userId = c.req.query('id');
        if (!userId)
            return c.json({ error: 'ID is required' }, 500);
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json({ user: safeJSON(user) });
    }
    static async getCurrentUser(c) {
        const userId = getUserId(c);
        if (!userId)
            return c.json({ error: 'ID is required' }, 500);
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json({ user: safeJSON(user) });
    }
    static async updateCurrentUser(c) {
        const userId = getUserId(c);
        const body = await c.req.json();
        const parsed = UpdateProfileSchema.safeParse(body);
        if (!parsed.success) {
            return c.json({ error: parsed.error.flatten() }, 400);
        }
        const updated = await prisma.user.update({
            where: { id: userId },
            data: parsed.data,
        });
        return c.json({ user: safeJSON(updated) });
    }
}
