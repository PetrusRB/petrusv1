import db from '@/database/db';
import { eq } from 'drizzle-orm';
import { usersTable, type User as DbUser } from '@/schemas/db.schema';
import { redis } from '@/lib/redis';

import { getCacheKey } from '@/lib/utils';
import type { User as ClerkUser } from '@clerk/nextjs/server';

export function extractClerkUserData(clerkUser: ClerkUser) {
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

export async function invalidateUserCache(
  clerkUserId: string,
  dbUserId?: string
) {
  const keys = [getCacheKey(`user_sync:${clerkUserId}`)];
  if (dbUserId) {
    keys.push(
      getCacheKey(`user:${dbUserId}`),
      getCacheKey(`user:${dbUserId}:*`)
    );
  }
  await Promise.all(keys.map((key) => redis.del(key)));
}

export async function upsertUser(
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
