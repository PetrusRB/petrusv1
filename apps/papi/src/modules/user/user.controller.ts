import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import db from '@/database/index.js';
import { usersTable } from '@/schemas/db.schema.js';
import { getUserId } from '@/middlewares/auth.js';
import { safeJSON } from '@/lib/crypto.js';
import { UpdateProfileSchema } from './user.schema.js';
import { logger } from '@/lib/logger.js';

export class UserController {
  // Cache simples para reduzir queries repetidas
  private static userCache = new Map<
    string,
    { data: any; timestamp: number }
  >();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  private static clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.userCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.userCache.delete(key);
      }
    }
  }

  static async getUser(c: Context) {
    const userId = c.req.query('id');
    if (!userId) return c.json({ error: 'ID is required' }, 400);

    // Verificar cache primeiro
    this.clearExpiredCache();
    const cacheKey = `user:${userId}`;
    const cached = this.userCache.get(cacheKey);
    if (cached) {
      logger.debug({ userId }, 'User data served from cache');
      return c.json({ user: safeJSON(cached.data) });
    }

    try {
      // seleciona apenas campos necessários
      const [user] = await db
        .select({
          id: usersTable.id,
          clerkUserId: usersTable.clerkUserId,
          email: usersTable.email,
          username: usersTable.username,
          displayName: usersTable.displayName,
          pictureUrl: usersTable.pictureUrl,
          bio: usersTable.bio,
          isActive: usersTable.isActive,
          role: usersTable.role,
          createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Armazenar no cache
      this.userCache.set(cacheKey, {
        data: user,
        timestamp: Date.now(),
      });

      return c.json({ user: safeJSON(user) });
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user');
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async getCurrentUser(c: Context) {
    const userId = getUserId(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    // Cache específico para usuário atual (mais frequente)
    this.clearExpiredCache();
    const cacheKey = `current:${userId}`;
    const cached = this.userCache.get(cacheKey);
    if (cached) {
      return c.json({ user: safeJSON(cached.data) });
    }

    try {
      const [user] = await db
        .select({
          id: usersTable.id,
          clerkUserId: usersTable.clerkUserId,
          email: usersTable.email,
          username: usersTable.username,
          displayName: usersTable.displayName,
          pictureUrl: usersTable.pictureUrl,
          bio: usersTable.bio,
          isActive: usersTable.isActive,
          role: usersTable.role,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
          lastLoginAt: usersTable.lastLoginAt,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Atualizar lastLoginAt em segundo plano (não bloquear a resposta)
      this.updateLastLogin(userId).catch((err) =>
        logger.error({ error: err, userId }, 'Failed to update last login')
      );

      // Armazenar no cache
      this.userCache.set(cacheKey, {
        data: user,
        timestamp: Date.now(),
      });

      return c.json({ user: safeJSON(user) });
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get current user');
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async updateCurrentUser(c: Context) {
    const userId = getUserId(c);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.json();
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }

    try {
      // Preparar dados com updatedAt atualizado
      const updateData = {
        ...parsed.data,
        updatedAt: new Date(),
      };

      const [updatedUser] = await db
        .update(usersTable)
        .set(updateData)
        .where(eq(usersTable.id, userId))
        .returning({
          id: usersTable.id,
          clerkUserId: usersTable.clerkUserId,
          email: usersTable.email,
          username: usersTable.username,
          displayName: usersTable.displayName,
          pictureUrl: usersTable.pictureUrl,
          bio: usersTable.bio,
          isActive: usersTable.isActive,
          role: usersTable.role,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
        });

      if (!updatedUser) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Limpar cache do usuário atualizado
      this.userCache.delete(`user:${userId}`);
      this.userCache.delete(`current:${userId}`);

      return c.json({ user: safeJSON(updatedUser) });
    } catch (error) {
      logger.error({ error, userId }, 'Failed to update user');

      // Tratar erros específicos do banco
      if (error instanceof Error) {
        // Violação de constraint única (username/email duplicado)
        if (error.message.includes('unique constraint')) {
          return c.json(
            {
              error: 'Username or email already exists',
            },
            409
          );
        }
      }

      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  // Método auxiliar para atualizar lastLogin (não-bloqueante)
  private static async updateLastLogin(userId: string) {
    try {
      await db
        .update(usersTable)
        .set({
          lastLoginAt: new Date(),
          updatedAt: new Date(), // Manter updatedAt consistente
        })
        .where(eq(usersTable.id, userId));
    } catch (error) {
      // Log mas não falha a requisição principal
      logger.warn({ userId }, 'Failed to update last login timestamp');
    }
  }

  // Método para limpar cache (útil para testes/webhooks)
  static clearUserCache(userId?: string) {
    if (userId) {
      this.userCache.delete(`user:${userId}`);
      this.userCache.delete(`current:${userId}`);
    } else {
      this.userCache.clear();
    }
  }
}
