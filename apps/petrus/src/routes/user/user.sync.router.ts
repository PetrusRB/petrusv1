// users.router.ts (refatorado)
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createRouter } from '@/utils/router.utils';
import db from '@/database/db';
import { eq } from 'drizzle-orm';
import { usersTable, type User as DbUser } from '@/schemas/db.schema';
import { getJsonFromCache, redis } from '@/lib/redis';
import { clerkClient } from '@/lib/clerk';
import { getCacheKey } from '@/lib/utils';
import type { User as ClerkUser } from '@clerk/nextjs/server';

// responses
type SuccessUserResponse = {
  success: true;
  user: DbUser;
  created?: boolean;
  cached?: boolean;
};
type ErrorResponse = {
  success: false;
  error: string;
  message?: string;
  action?: string;
};

const router = createRouter();

/**
 * SCHEMAS
 */
const SyncUserSchema = z.object({
  forceUpdate: z.coerce.boolean().default(false),
});

/**
 * HELPERS
 */
function extractClerkUserData(clerkUser: ClerkUser) {
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    '';

  const fullName =
    clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
      : null;

  return {
    clerkUserId: clerkUser.id,
    email: primaryEmail,
    username: clerkUser.username || `user_${clerkUser.id.slice(0, 8)}`,
    displayName: fullName || clerkUser.username || 'Usuário',
    pictureUrl: clerkUser.imageUrl || '/user.png',
  };
}

async function invalidateUserCache(clerkUserId: string, dbUserId?: string) {
  const keys = [getCacheKey(`user_sync:${clerkUserId}`)];
  if (dbUserId) {
    keys.push(
      getCacheKey(`user:${dbUserId}`),
      getCacheKey(`user:${dbUserId}:*`)
    );
  }
  await Promise.all(keys.map((key) => redis.del(key)));
}

async function upsertUser(
  clerkUser: ClerkUser
): Promise<{ user: DbUser; created: boolean }> {
  const userData = extractClerkUserData(clerkUser);

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, userData.clerkUserId))
    .limit(1);

  if (existingUser) {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        pictureUrl: userData.pictureUrl,
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      })
      .where(eq(usersTable.id, existingUser.id))
      .returning();

    await invalidateUserCache(userData.clerkUserId, updatedUser.id);
    return { user: updatedUser, created: false };
  }

  const [newUser] = await db
    .insert(usersTable)
    .values({
      ...userData,
      isActive: true,
      role: 'USER',
      lastLoginAt: new Date(),
    })
    .returning();

  await invalidateUserCache(userData.clerkUserId, newUser.id);
  return { user: newUser, created: true };
}

/**
 * ROTAS
 */
router.get('/me', async (c) => {
  try {
    const contextUser = c.get('user') as unknown as DbUser | null;

    if (!contextUser?.id) {
      const res: ErrorResponse = {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Usuário não autenticado',
      };
      return c.json(res, 401);
    }

    const [user] = await db
      .select({
        id: usersTable.id,
        clerkUserId: usersTable.clerkUserId,
        email: usersTable.email,
        username: usersTable.username,
        displayName: usersTable.displayName,
        pictureUrl: usersTable.pictureUrl,
        isActive: usersTable.isActive,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
        lastLoginAt: usersTable.lastLoginAt,
      })
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, contextUser.id))
      .limit(1);

    if (!user) {
      const res: ErrorResponse = {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado. Sincronização necessária.',
      };
      return c.json({ ...res, action: 'sync_required' }, 404);
    }

    // atualiza lastLoginAt de forma "fire-and-forget"
    db.update(usersTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(usersTable.id, user.id))
      .execute()
      .catch((err) => console.error('Erro ao atualizar lastLoginAt:', err));

    const res: SuccessUserResponse = { success: true, user };
    return c.json(res);
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    const res: ErrorResponse = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erro ao buscar informações do usuário',
    };
    return c.json(res, 500);
  }
});

// router.post('/sync', zValidator('json', SyncUserSchema), async (c) => {
//   try {
//     const { forceUpdate } = c.req.valid('json') as { forceUpdate: boolean };
//     const contextUser = c.get('user') as unknown as DbUser | null;

//     if (!contextUser?.id) {
//       const res: ErrorResponse = {
//         success: false,
//         error: 'UNAUTHORIZED',
//         message: 'Usuário não autenticado',
//       };
//       return c.json(res, 401);
//     }

//     const clerkUserId = contextUser.id;
//     const cacheKey = getCacheKey(`user_sync:${clerkUserId}`);

//     if (!forceUpdate) {
//       const cached = await getJsonFromCache<DbUser | null>(cacheKey);

//       if (cached) {
//         try {
//           const res: SuccessUserResponse & { cached: true } = {
//             success: true,
//             user: cached,
//             cached: true,
//           };
//           return c.json(res);
//         } catch {
//           await redis.del(cacheKey);
//         }
//       }
//     }

//     const clerkUser = await clerkClient.users
//       .getUser(clerkUserId)
//       .catch((err) => {
//         console.error('Erro ao buscar usuário no Clerk:', err);
//         return null;
//       });

//     if (!clerkUser) {
//       const res: ErrorResponse = {
//         success: false,
//         error: 'CLERK_USER_NOT_FOUND',
//         message: 'Usuário não encontrado no Clerk',
//       };
//       return c.json(res, 404);
//     }

//     const { user, created } = await upsertUser(clerkUser);
//     await redis.setex(cacheKey, 600, JSON.stringify(user));

//     const res: SuccessUserResponse & { created: boolean } = {
//       success: true,
//       user,
//       created,
//       cached: false,
//     };
//     return c.json(res);
//   } catch (error) {
//     console.error('Erro na sincronização do usuário:', error);
//     const message =
//       error instanceof Error ? error.message : 'Erro ao sincronizar usuário';
//     const res: ErrorResponse = { success: false, error: 'SYNC_ERROR', message };
//     return c.json(res, 500);
//   }
// });

// Webhook handler
router.post('/webhook/clerk', async (c) => {
  try {
    const payload: any = await c.req.json();
    const { type, data } = payload;

    console.log(`[Webhook Clerk] Evento recebido: ${type}`);

    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const clerkUser = await clerkClient.users.getUser(data.id);
        if (!clerkUser) {
          console.error(`[Webhook Clerk] Usuário ${data.id} não encontrado`);
          return c.json({ success: false, error: 'User not found' }, 404);
        }
        const { user, created } = await upsertUser(clerkUser);
        console.log(
          `[Webhook Clerk] Usuário ${created ? 'criado' : 'atualizado'}: ${
            user.email
          }`
        );
        return c.json({
          success: true,
          action: created ? 'created' : 'updated',
          userId: user.id,
        });
      }

      case 'user.deleted': {
        const clerkUserId = data.id;
        const [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.clerkUserId, clerkUserId))
          .limit(1);
        if (!user) {
          console.log(`[Webhook Clerk] Usuário ${clerkUserId} já foi removido`);
          return c.json({ success: true, action: 'already_deleted' });
        }

        await db
          .update(usersTable)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(usersTable.id, user.id));
        await invalidateUserCache(clerkUserId, user.id);
        console.log(`[Webhook Clerk] Usuário desativado: ${user.email}`);

        return c.json({
          success: true,
          action: 'deactivated',
          userId: user.id,
        });
      }

      default:
        console.log(`[Webhook Clerk] Evento não tratado: ${type}`);
        return c.json({ success: true, action: 'ignored' });
    }
  } catch (error) {
    console.error('[Webhook Clerk] Erro ao processar webhook:', error);
    return c.json(
      {
        success: false,
        error: 'WEBHOOK_ERROR',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      500
    );
  }
});

export default router;
