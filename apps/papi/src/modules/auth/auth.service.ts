import { redis } from '@/lib/redis.js';
import { logger } from '@/lib/logger.js';
import type { ClerkEvent } from './auth.schema.js';
import { UserSyncSchema } from '@/modules/user/user.schema.js';
import { usersTable } from '@/schemas/db.schema.js';
import { eq } from 'drizzle-orm';
import db from '@/database/index.js';
import { createId } from '@paralleldrive/cuid2';

// Cache para eventos recentemente processados (evita múltiplas chamadas ao Redis)
const recentEventCache = new Map<string, boolean>();

function mapClerkToUser(data: ClerkEvent['data']) {
  const email = data.email_addresses?.[0]?.email_address ?? null;
  const displayName =
    data.first_name || data.last_name
      ? `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim()
      : data.username || null;

  return {
    clerkUserId: data.id,
    email,
    username: data.username ?? null,
    displayName,
    pictureUrl: data.image_url ?? null,
    isActive: true,
  };
}

async function processUserUpsert(
  userData: ReturnType<typeof mapClerkToUser>,
  clerkId: string
) {
  const parsed = UserSyncSchema.safeParse(userData);
  if (!parsed.success) {
    logger.error(parsed.error, 'Invalid user payload from Clerk');
    return false;
  }

  // usa onConflictDoUpdate para UPSERT em uma única operação
  const now = new Date();

  try {
    await db
      .insert(usersTable)
      .values({
        ...parsed.data,
        id: createId(),
        createdAt: now,
        updatedAt: now,
        role: 'USER',
      })
      .onConflictDoUpdate({
        target: usersTable.clerkUserId, // Índice único
        set: {
          ...parsed.data,
          updatedAt: now,
        },
      });

    return true;
  } catch (error) {
    logger.error({ error, clerkId }, 'Failed to upsert user');
    return false;
  }
}

async function processUserDelete(clerkId: string) {
  try {
    await db
      .update(usersTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.clerkUserId, clerkId));

    return true;
  } catch (error) {
    logger.error({ error, clerkId }, 'Failed to soft delete user');
    return false;
  }
}

export class AuthService {
  static async handleWebhook(event: ClerkEvent) {
    const { type, data } = event;
    const eventId = `clerk:event:${data.id}:${type}`;

    // verificação em cache em memória primeiro
    if (recentEventCache.has(eventId)) {
      logger.debug({ eventId }, 'Event recently processed (memory cache)');
      return;
    }

    // verificação no Redis
    const already = await redis.get(eventId);
    if (already) {
      logger.warn({ eventId }, 'Webhook already processed');
      recentEventCache.set(eventId, true);
      // Expira do cache em memória após 5 minutos
      setTimeout(() => recentEventCache.delete(eventId), 5 * 60 * 1000);
      return;
    }

    let success = false;

    try {
      switch (type) {
        case 'user.created':
        case 'user.updated': {
          const mapped = mapClerkToUser(data);
          success = await processUserUpsert(mapped, data.id);
          break;
        }

        case 'user.deleted': {
          success = await processUserDelete(data.id);
          break;
        }

        default: {
          logger.warn({ type }, 'Unhandled webhook type');
          return;
        }
      }

      if (success) {
        // Marca como processado apenas se a operação foi bem-sucedida
        await redis.set(eventId, '1', { ex: 60 * 60 * 24 });
        recentEventCache.set(eventId, true);
        setTimeout(() => recentEventCache.delete(eventId), 5 * 60 * 1000);

        logger.info({ eventId, type }, 'Webhook processed successfully');
      }
    } catch (error) {
      logger.error({ error, eventId, type }, 'Failed to process webhook');
      // Não marca como processado em caso de erro
    }
  }

  // Método para processamento em lote (útil para múltiplos eventos)
  static async handleWebhookBatch(events: ClerkEvent[]) {
    const results = await Promise.allSettled(
      events.map((event) => this.handleWebhook(event))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed > 0) {
      logger.warn(
        { successful, failed },
        'Batch processing completed with errors'
      );
    }

    return { successful, failed };
  }
}
