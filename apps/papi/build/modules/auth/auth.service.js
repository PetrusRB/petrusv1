import { prisma } from '../../lib/index.js';
import { redis } from '../../lib/redis.js';
import { logger } from '../../lib/logger.js';
export class AuthService {
    static async handleWebhook(event) {
        const { type, data } = event;
        const eventId = `clerk:event:${data.id}:${type}`;
        // Idempotência: evita reprocessar
        const already = await redis.get(eventId);
        if (already) {
            logger.warn({ event }, 'Webhook already processed');
            return;
        }
        const email = data.email_addresses?.[0]?.email_address ?? null;
        const displayName = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() ||
            data.username ||
            null;
        switch (type) {
            case 'user.created': {
                await prisma.user.create({
                    data: {
                        clerkUserId: data.id,
                        email,
                        displayName,
                        pictureUrl: data.image_url,
                        isActive: true,
                    },
                });
                break;
            }
            case 'user.updated': {
                await prisma.user.update({
                    where: { clerkUserId: data.id },
                    data: {
                        email,
                        displayName,
                        pictureUrl: data.image_url,
                    },
                });
                break;
            }
            case 'user.deleted': {
                await prisma.user.update({
                    where: { clerkUserId: data.id },
                    data: { isActive: false },
                });
                break;
            }
        }
        // Marca como processado por 24h
        await redis.set(eventId, '1', { ex: 60 * 60 * 24 });
        logger.info({ event }, 'Webhook processed successfully');
    }
}
