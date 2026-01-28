import { redis } from '@/lib/redis.js';
import { logger } from '@/lib/logger.js';
import type { ClerkEvent } from './auth.schema.js';
import { UserSyncSchema } from '@/modules/user/user.schema.js';
import { sessionsTable, usersTable } from '@/schemas/db.schema.js';
import { eq, and, gt } from 'drizzle-orm';
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
        target: usersTable.clerkUserId,
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
  static async getOrCreateUser(clerkUserId: string): Promise<any> {
    try {
      // Primeiro tenta encontrar o usuário
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.clerkUserId, clerkUserId))
        .limit(1);

      if (existingUser.length > 0) {
        return existingUser[0];
      }

      // Se não existir, busca informações do Clerk e cria o usuário
      // Nota: Em produção, você precisaria de um método para buscar do Clerk
      // Por enquanto, criamos um usuário básico
      const userId = createId();
      const now = new Date();

      const [newUser] = await db
        .insert(usersTable)
        .values({
          id: userId,
          clerkUserId,
          email: `user-${clerkUserId}@example.com`, // Placeholder
          username: `user_${clerkUserId.substring(0, 8)}`,
          displayName: `User ${clerkUserId.substring(0, 4)}`,
          isActive: true,
          role: 'USER',
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return newUser;
    } catch (error) {
      logger.error({ error, clerkUserId }, 'Failed to get or create user');
      throw new Error('Failed to get or create user');
    }
  }

  static async createLocalSession(sessionData: {
    clerkUserId: string;
    email?: string;
    name?: string;
    avatar?: string;
    metadata?: any;
  }): Promise<any> {
    try {
      // Encontra o usuário pelo clerkUserId
      const user = await this.getOrCreateUser(sessionData.clerkUserId);

      const sessionId = createId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      // Cria a sessão no banco de dados
      const [session] = await db
        .insert(sessionsTable)
        .values({
          id: sessionId,
          userId: user.id,
          expiresAt,
          userAgent: null, // Poderia ser extraído do request
          ipAddress: null, // Poderia ser extraído do request
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      // Armazena no Redis para acesso rápido
      await redis.set(
        `session:${sessionId}`,
        JSON.stringify({
          id: sessionId,
          userId: user.id,
          clerkUserId: sessionData.clerkUserId,
          expiresAt: expiresAt.toISOString(),
        }),
        { ex: 7 * 24 * 60 * 60 }
      ); // 7 dias em segundos

      return session;
    } catch (error) {
      logger.error({ error }, 'Failed to create local session');
      throw new Error('Failed to create session');
    }
  }

  static async getSession(sessionId: string): Promise<any | null> {
    try {
      // Primeiro tenta do Redis
      const cached = await redis.get(`session:${sessionId}`);
      if (cached) {
        return JSON.parse(cached as string);
      }

      // Se não estiver no Redis, busca do banco
      const sessions = await db
        .select()
        .from(sessionsTable)
        .where(
          and(
            eq(sessionsTable.id, sessionId),
            gt(sessionsTable.expiresAt, new Date())
          )
        )
        .limit(1);

      if (sessions.length === 0) {
        return null;
      }

      const session = sessions[0];

      // Armazena no Redis para próximas consultas
      await redis.set(
        `session:${sessionId}`,
        JSON.stringify({
          id: session.id,
          userId: session.userId,
          expiresAt: session.expiresAt.toISOString(),
        }),
        { ex: Math.floor((session.expiresAt.getTime() - Date.now()) / 1000) }
      );

      return session;
    } catch (error) {
      logger.error({ error, sessionId }, 'Failed to get session');
      return null;
    }
  }

  static async getUser(userId: string): Promise<any | null> {
    try {
      // Cache no Redis
      const cached = await redis.get(`user:${userId}`);
      if (cached) {
        return JSON.parse(cached as string);
      }

      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      if (users.length === 0) {
        return null;
      }

      const user = users[0];

      // Armazena no Redis (1 hora de cache)
      await redis.set(`user:${userId}`, JSON.stringify(user), { ex: 3600 });

      return user;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user');
      return null;
    }
  }

  static async revokeLocalSession(sessionId: string): Promise<boolean> {
    try {
      // Remove do Redis
      await redis.del(`session:${sessionId}`);

      // Remove do banco de dados
      await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));

      logger.info({ sessionId }, 'Session revoked');
      return true;
    } catch (error) {
      logger.error({ error, sessionId }, 'Failed to revoke session');
      return false;
    }
  }

  static async refreshSession(sessionId: string): Promise<any | null> {
    try {
      const session = await this.getSession(sessionId);

      if (!session) {
        return null;
      }

      const now = new Date();
      const newExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Atualiza no banco
      const [updatedSession] = await db
        .update(sessionsTable)
        .set({
          expiresAt: newExpiresAt,
          updatedAt: now,
        })
        .where(eq(sessionsTable.id, sessionId))
        .returning();

      if (!updatedSession) {
        return null;
      }

      // Atualiza no Redis
      await redis.set(
        `session:${sessionId}`,
        JSON.stringify({
          id: updatedSession.id,
          userId: updatedSession.userId,
          expiresAt: updatedSession.expiresAt.toISOString(),
        }),
        { ex: 7 * 24 * 60 * 60 }
      );

      return updatedSession;
    } catch (error) {
      logger.error({ error, sessionId }, 'Failed to refresh session');
      return null;
    }
  }
  static async getUserByClerkId(clerkUserId: string): Promise<any | null> {
    try {
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.clerkUserId, clerkUserId))
        .limit(1);

      return users.length > 0 ? users[0] : null;
    } catch (error) {
      logger.error({ error, clerkUserId }, 'Failed to get user by Clerk ID');
      return null;
    }
  }

  static async getActiveSessions(userId: string): Promise<any[]> {
    try {
      const sessions = await db
        .select()
        .from(sessionsTable)
        .where(
          and(
            eq(sessionsTable.userId, userId),
            gt(sessionsTable.expiresAt, new Date())
          )
        )
        .orderBy(sessionsTable.createdAt);

      return sessions;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get active sessions');
      return [];
    }
  }

  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date();

      // Busca sessões expiradas
      const expiredSessions = await db
        .select({ id: sessionsTable.id })
        .from(sessionsTable)
        .where(gt(sessionsTable.expiresAt, now));

      // Remove do Redis
      const redisKeys = expiredSessions.map((s) => `session:${s.id}`);
      if (redisKeys.length > 0) {
        await redis.del(...redisKeys);
      }

      // Remove do banco
      const result = await db
        .delete(sessionsTable)
        .where(gt(sessionsTable.expiresAt, now))
        .returning({ id: sessionsTable.id });

      logger.info({ count: result.length }, 'Expired sessions cleaned up');
      return result.length;
    } catch (error) {
      logger.error({ error }, 'Failed to cleanup expired sessions');
      return 0;
    }
  }
}
