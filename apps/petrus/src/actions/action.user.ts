'use server';

import { currentUser } from '@clerk/nextjs/server';

// ajuste os paths abaixo para os seus utilitários
import { getJsonFromCache, redis } from '@/lib/redis';
import { upsertUser } from '@/utils/db.utils';
import { type User as DbUser } from '@/schemas/db.schema';
import { getCacheKey } from '@/lib/utils';
import { clerkClient } from '@/lib/clerk';
import { UserPublic } from '@/schemas/user.schema';

/** Tipos de resposta (adeque aos seus tipos reais) */
type SuccessUserResponse = { success: true; user: UserPublic; cached: boolean };
type SuccessUserCreatedResponse = SuccessUserResponse & { created: boolean };
type ErrorResponse = { success: false; error: string; message: string };

/**
 * Sincronização de usuário com backend.
 */
export async function syncUserAction({
  forceUpdate = false,
}: {
  forceUpdate?: boolean;
} = {}): Promise<
  SuccessUserCreatedResponse | SuccessUserResponse | ErrorResponse
> {
  // Pega o usuário atual logado e verifica se existe ou não.
  const user = await currentUser();

  if (!user) {
    return {
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Usuário não autenticado',
    };
  }

  const userId = user.id;
  const cacheKey = getCacheKey(`user_sync:${userId}`);

  if (!forceUpdate) {
    const cached = await getJsonFromCache<DbUser | null>(cacheKey).catch(
      () => null
    );
    if (cached) {
      return {
        success: true,
        user: cached as unknown as UserPublic,
        cached: true,
      };
    }
  }

  const clerkUser = await clerkClient.users.getUser(userId).catch((err) => {
    console.error('Erro ao buscar usuário no Clerk:', err);
    return null;
  });

  if (!clerkUser) {
    return {
      success: false,
      error: 'CLERK_USER_NOT_FOUND',
      message: 'Usuário não encontrado no Clerk',
    };
  }

  const upsertResult = await upsertUser(clerkUser).catch((err) => {
    console.error('Erro no upsertUser:', err);
    return null;
  });

  if (!upsertResult || !upsertResult.user) {
    return {
      success: false,
      error: 'SYNC_ERROR',
      message: 'Erro ao sincronizar usuário',
    };
  }

  // grava cache (silenciosamente ignora falhas)
  await redis
    .setex(cacheKey, 600, JSON.stringify(upsertResult.user))
    .catch(() => {});

  return {
    success: true,
    user: upsertResult.user as UserPublic,
    created: Boolean(upsertResult.created),
    cached: false,
  };
}
