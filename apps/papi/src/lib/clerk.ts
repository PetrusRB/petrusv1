import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/backend';
import { createClerkClient, verifyToken } from '@clerk/backend';

import type { ClerkSession } from '@/modules/auth/auth.schema.js';

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

export const verifyClerkWebhook = async (
  req: Request,
  secret: string
): Promise<WebhookEvent> => {
  const payload = await req.text();

  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error('Missing Clerk webhook headers');
  }

  const wh = new Webhook(secret);
  return wh.verify(payload, {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  }) as WebhookEvent;
};
export async function verifySessionToken(
  token: string
): Promise<ClerkSession | null> {
  try {
    const cleanToken = token.replace(/^Bearer\s+/i, '');

    const verified = await verifyToken(cleanToken, {
      jwtKey: process.env.CLERK_JWT_KEY,
    });

    if (!verified) {
      return null;
    }

    // Verifica o token com a API do Clerk
    const session = await clerkClient.sessions.getSession(verified.sid);

    if (!session || session.status !== 'active') {
      return null;
    }

    // Busca os dados completos do usuário
    const user = await clerkClient.users.getUser(session.userId);

    return {
      id: session.id,
      userId: user.id,
      status: session.status,
      lastActiveAt: Math.floor(session.lastActiveAt / 1000),
      expireAt: Math.floor(session.expireAt / 1000),
      abandonAt: Math.floor(session.abandonAt / 1000),
      createdAt: Math.floor(session.createdAt / 1000),
      updatedAt: Math.floor(session.updatedAt / 1000),
      user: {
        id: session.userId,
        emailAddresses: user.emailAddresses?.map((email) => ({
          emailAddress: email.emailAddress,
          verification: email.verification
            ? {
                status: email.verification.status,
              }
            : undefined,
        })),
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        primaryEmailAddressId: user.primaryEmailAddressId ?? undefined,
        primaryPhoneNumberId: user.primaryPhoneNumberId ?? undefined,
        primaryWeb3WalletId: user.primaryWeb3WalletId ?? undefined,
        username: user.username,
        profileImageUrl: user.imageUrl,
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata,
        unsafeMetadata: user.unsafeMetadata,
        externalId: user.externalId,
        createdAt: user.createdAt
          ? Math.floor(user.createdAt / 1000)
          : undefined,
        updatedAt: user.updatedAt
          ? Math.floor(user.updatedAt / 1000)
          : undefined,
        lastSignInAt: user.lastSignInAt
          ? Math.floor(user.lastSignInAt / 1000)
          : undefined,
        banned: user.banned,
        locked: user.locked,
        lastActiveAt: user.lastActiveAt
          ? Math.floor(user.lastActiveAt / 1000)
          : undefined,
      },
    };
  } catch (error) {
    console.error('Error verifying session token:', error);
    return null;
  }
}
export const clerkApp = new Hono();

export function useClerk(app: Hono) {
  app.use('*', clerkMiddleware());
}

export function getClerkAuth(ctx: any) {
  // getAuth(ctx) retorna userId, sessionId e roles conforme SDK
  return getAuth(ctx);
}
