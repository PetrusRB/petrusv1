import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createRouter } from '@/utils/router.utils';
import { getCacheKey } from '@/lib/utils';
import db from '@/database/db';
import { eq, sql } from 'drizzle-orm';
import {
  getJsonFromCache,
  getOrSet,
  redis,
  validateObjectId,
  withRateLimit,
} from '@/lib/redis';
import { usersTable } from '@/schemas/db.schema';

const router = createRouter();

// Schemas de validação
const UserQuerySchema = z.object({
  identifier: z.string().min(1).max(100), // Pode ser ID, username, email, ou clerkId
  includeRelations: z.coerce.boolean().default(false),
  cacheOnly: z.coerce.boolean().default(false),
});

// Interfaces
interface CachedUser {
  id: string;
  clerkUserId: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  pictureUrl: string | null;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

// Helper para construir query de usuário
const buildUserSelect = (includeRelations = false) => {
  const baseSelect = {
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
  };

  if (includeRelations) {
    return {
      ...baseSelect,
      // exampleParamPurchases: count(purchasesTable.id).as('totalPurchases'),
    };
  }

  return baseSelect;
};
const searchRateLimit = withRateLimit({
  keyPrefix: 'user_search',
  points: 10, // 10 requisições
  duration: 60, // por minuto
});

// Helper para validar o cached user
// function isValidCachedUser(data: any): data is CachedUser {
//   return (
//     data &&
//     typeof data === 'object' &&
//     typeof data.id === 'string' &&
//     typeof data.clerkUserId === 'string' &&
//     typeof data.isActive === 'boolean' &&
//     typeof data.role === 'string' &&
//     data.createdAt
//   );
// }

/**
 * ROTAS
 */
router.get(
  '/user/:identifier',
  zValidator('param', z.object({ identifier: z.string() })),
  zValidator(
    'query',
    UserQuerySchema.pick({ includeRelations: true, cacheOnly: true })
  ),
  async (c) => {
    const { identifier } = c.req.valid('param');
    const { includeRelations, cacheOnly } = c.req.valid('query');

    // Rate limiting baseado no IP ou usuário
    const clientId = c.req.header('x-forwarded-for') || 'anonymous';
    await searchRateLimit.consume(clientId);

    // Chave de cache composta
    const cacheKey = getCacheKey(`user:${identifier}:${includeRelations}`);
    const cacheKeyAlias = getCacheKey(`user_alias:${identifier}`);

    try {
      // cache direto (cacheOnly=true)
      if (cacheOnly) {
        const cached = await getJsonFromCache<CachedUser | null>(cacheKey);

        if (cached) {
          return c.json({
            success: true,
            type: 'USER_FOUND',
            source: 'cache',
            user: cached,
          });
        }

        return c.json(
          {
            success: false,
            type: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado em cache',
          },
          404
        );
      }

      // cache com fallback para banco
      const user = await getOrSet<CachedUser | null>(
        cacheKey,
        async () => {
          // Verificar se temos um alias em cache (username -> id)
          const alias = await redis.get(cacheKeyAlias);
          const effectiveIdentifier = alias || identifier;

          // Converter para string segura para operações
          const identifierStr = String(effectiveIdentifier).trim();

          if (!identifierStr) {
            return null;
          }

          // Determinar tipo de busca baseado no formato
          let whereCondition;
          const lowerIdentifier = identifierStr.toLowerCase();

          if (validateObjectId(identifierStr)) {
            // Busca por ID interno
            whereCondition = eq(usersTable.id, identifierStr);
          } else if (identifierStr.startsWith('user_')) {
            // Busca por Clerk ID
            whereCondition = eq(usersTable.clerkUserId, identifierStr);
          } else if (identifierStr.includes('@')) {
            // Busca por email (case-insensitive)
            whereCondition = eq(
              sql`LOWER(${usersTable.email})`,
              lowerIdentifier
            );
          } else {
            // Busca por username (case-insensitive)
            whereCondition = eq(
              sql`LOWER(${usersTable.username})`,
              lowerIdentifier
            );
          }

          // Executar query
          const [userData] = await db
            .select(buildUserSelect(includeRelations))
            .from(usersTable)
            .where(whereCondition)
            .limit(1);

          if (!userData) {
            // Cache de negativo por 5 minutos para evitar buscas repetidas
            await redis.setex(cacheKey, 300, JSON.stringify(null));
            return null;
          }

          // Converter para formato cacheável
          const cacheableUser: CachedUser = {
            id: userData.id,
            clerkUserId: userData.clerkUserId ?? '',
            email: userData.email,
            username: userData.username,
            displayName: userData.displayName,
            pictureUrl: userData.pictureUrl,
            isActive: userData.isActive ?? false,
            role: userData.role ?? 'USER',
            createdAt:
              userData.createdAt instanceof Date
                ? userData.createdAt
                : new Date(userData.createdAt),
            updatedAt:
              userData.updatedAt instanceof Date
                ? userData.updatedAt
                : new Date(userData.updatedAt),
            lastLoginAt: userData.lastLoginAt
              ? userData.lastLoginAt instanceof Date
                ? userData.lastLoginAt
                : new Date(userData.lastLoginAt)
              : null,
          };

          // Armazenar aliases para buscas futuras
          const aliasPromises = [
            redis.setex(
              getCacheKey(`user_alias:${cacheableUser.id}`),
              3600,
              cacheableUser.id
            ),
            redis.setex(
              getCacheKey(`user_alias:${cacheableUser.clerkUserId}`),
              3600,
              cacheableUser.id
            ),
          ];

          if (cacheableUser.username) {
            aliasPromises.push(
              redis.setex(
                getCacheKey(
                  `user_alias:${cacheableUser.username.toLowerCase()}`
                ),
                3600,
                cacheableUser.id
              )
            );
          }

          if (cacheableUser.email) {
            aliasPromises.push(
              redis.setex(
                getCacheKey(`user_alias:${cacheableUser.email.toLowerCase()}`),
                3600,
                cacheableUser.id
              )
            );
          }

          await Promise.all(aliasPromises);

          return cacheableUser;
        },
        300 // TTL de 5 minutos para dados de usuário
      );

      if (!user) {
        return c.json(
          {
            success: false,
            type: 'USER_NOT_FOUND',
            message: 'Usuário não encontrado',
          },
          404
        );
      }

      // Incrementar contador de acessos (para popularidade)
      await redis.zincrby('user:access:count', 1, user.id);

      return c.json({
        success: true,
        type: 'USER_FOUND',
        source: 'database',
        user: user,
        cacheHit: !!(await redis.exists(cacheKey)),
      });
    } catch (error: any) {
      // Rate limit exceeded
      if (
        error instanceof Error &&
        error.message.includes('Rate limit exceeded')
      ) {
        return c.json(
          {
            success: false,
            type: 'RATE_LIMIT_EXCEEDED',
            message: 'Muitas requisições. Tente novamente em alguns instantes.',
          },
          429
        );
      }

      console.error('Erro ao buscar usuário:', error);

      return c.json(
        {
          success: false,
          type: 'INTERNAL_ERROR',
          message: 'Erro interno ao processar a requisição',
          error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        500
      );
    }
  }
);
export default router;
