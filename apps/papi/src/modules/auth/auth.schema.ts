// auth.schema.ts
import { z } from 'zod';

// Clerk Webhook Schema
export const ClerkEventSchema = z.object({
  type: z.enum([
    'user.created',
    'user.updated',
    'user.deleted',
    'session.created',
    'session.ended',
  ]),
  data: z.object({
    id: z.string(),
    email_addresses: z
      .array(
        z.object({
          email_address: z.string().email(),
          id: z.string(),
          verification: z
            .object({
              status: z.enum(['verified', 'unverified']).optional(),
              strategy: z.string().optional(),
            })
            .optional(),
        })
      )
      .optional(),
    first_name: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    username: z.string().optional().nullable(),
    image_url: z.string().url().optional().nullable(),
    primary_email_address_id: z.string().optional(),
    primary_phone_number_id: z.string().optional().nullable(),
    primary_web3_wallet_id: z.string().optional().nullable(),
    profile_image_url: z.string().url().optional(),
    has_image: z.boolean().optional(),
    public_metadata: z.record(z.unknown()).optional(),
    private_metadata: z.record(z.unknown()).optional(),
    unsafe_metadata: z.record(z.unknown()).optional(),
    external_id: z.string().optional().nullable(),
    created_at: z.number().optional(),
    updated_at: z.number().optional(),
    last_sign_in_at: z.number().optional().nullable(),
    banned: z.boolean().optional(),
    locked: z.boolean().optional(),
    lockout_expires_in_seconds: z.number().optional().nullable(),
    verification_attempts_remaining: z.number().optional(),
    last_active_at: z.number().optional().nullable(),
  }),
});

// Clerk Session Schema (para verificação de token)
export const ClerkSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.enum(['active', 'ended', 'expired', 'removed']),
  lastActiveAt: z.number(),
  expireAt: z.number(),
  abandonAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  user: z
    .object({
      id: z.string(),
      emailAddresses: z
        .array(
          z.object({
            emailAddress: z.string().email(),
            verification: z
              .object({
                status: z.string(),
              })
              .optional(),
          })
        )
        .optional(),
      firstName: z.string().optional().nullable(),
      lastName: z.string().optional().nullable(),
      imageUrl: z.string().url().optional().nullable(),
      primaryEmailAddressId: z.string().optional(),
      primaryPhoneNumberId: z.string().optional().nullable(),
      primaryWeb3WalletId: z.string().optional().nullable(),
      username: z.string().optional().nullable(),
      profileImageUrl: z.string().url().optional(),
      publicMetadata: z.record(z.unknown()).optional(),
      privateMetadata: z.record(z.unknown()).optional(),
      unsafeMetadata: z.record(z.unknown()).optional(),
      externalId: z.string().optional().nullable(),
      createdAt: z.number().optional(),
      updatedAt: z.number().optional(),
      lastSignInAt: z.number().optional().nullable(),
      banned: z.boolean().optional(),
      locked: z.boolean().optional(),
      lockoutExpiresInSeconds: z.number().optional().nullable(),
      verificationAttemptsRemaining: z.number().optional(),
      lastActiveAt: z.number().optional().nullable(),
    })
    .optional(),
});

// User Session Schema (para resposta da API)
export const UserSessionSchema = z.object({
  id: z.string(),
  clerkUserId: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().url().optional().nullable(),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).default('USER'),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});

// Login Redirect Schema
export const LoginRedirectSchema = z.object({
  redirect_url: z
    .string()
    .url()
    .optional()
    .refine(
      (url) => {
        if (!url) return true;
        try {
          const urlObj = new URL(url);
          // Permite apenas URLs do seu domínio ou domínios permitidos
          const allowedDomains = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.APP_URL,
          ].filter(Boolean);

          const allowed = allowedDomains.some(
            (domain) => domain && urlObj.origin === new URL(domain).origin
          );
          return allowed;
        } catch {
          return false;
        }
      },
      { message: 'Redirect URL must be from an allowed domain' }
    ),
});

// Login Response Schema
export const LoginResponseSchema = z.object({
  success: z.boolean(),
  session_id: z.string().optional(),
  user: UserSessionSchema.optional(),
  redirect_url: z.string().url().optional(),
});

// Logout Request Schema
export const LogoutRequestSchema = z.object({
  session_id: z.string().optional(),
  redirect_url: z.string().url().optional(),
});

// Refresh Token Request Schema
export const RefreshTokenRequestSchema = z.object({
  session_id: z.string().optional(),
});

// Auth Error Response Schema
export const AuthErrorResponseSchema = z.object({
  error: z.string(),
  code: z
    .enum([
      'INVALID_TOKEN',
      'SESSION_EXPIRED',
      'USER_NOT_FOUND',
      'INVALID_REDIRECT_URL',
      'UNAUTHORIZED',
      'RATE_LIMITED',
      'INTERNAL_ERROR',
    ])
    .optional(),
  details: z.record(z.unknown()).optional(),
});

// Webhook Verification Schema
export const WebhookVerificationSchema = z.object({
  signature: z.string(),
  payload: z.record(z.unknown()),
});

// Clerk Token Verification Schema
export const ClerkTokenSchema = z.object({
  token: z.string(),
  redirect_url: z.string().url().optional(),
});

// User Metadata Schema
export const UserMetadataSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
  plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).optional(),
  trial_ends_at: z.string().datetime().optional().nullable(),
  subscription_id: z.string().optional().nullable(),
  custom_fields: z.record(z.unknown()).optional(),
});

// Session Creation Request Schema
export const SessionCreationSchema = z.object({
  clerkUserId: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  avatar: z.string().url().optional().nullable(),
  metadata: UserMetadataSchema.optional(),
});

// Cookies Schema
export const AuthCookiesSchema = z.object({
  session_id: z.string().optional(),
  user_id: z.string().optional(),
});

// Rate Limiting Schema
export const RateLimitSchema = z.object({
  key: z.string(),
  limit: z.number(),
  window: z.number(), // em segundos
  remaining: z.number(),
  reset: z.number(), // timestamp
});

// Export Types
export type ClerkEvent = z.infer<typeof ClerkEventSchema>;
export type ClerkSession = z.infer<typeof ClerkSessionSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;
export type LoginRedirect = z.infer<typeof LoginRedirectSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type AuthErrorResponse = z.infer<typeof AuthErrorResponseSchema>;
export type WebhookVerification = z.infer<typeof WebhookVerificationSchema>;
export type ClerkToken = z.infer<typeof ClerkTokenSchema>;
export type UserMetadata = z.infer<typeof UserMetadataSchema>;
export type SessionCreation = z.infer<typeof SessionCreationSchema>;
export type AuthCookies = z.infer<typeof AuthCookiesSchema>;
export type RateLimit = z.infer<typeof RateLimitSchema>;

// Helper function para criar respostas padronizadas
export const createAuthResponse = <T extends z.ZodType>(data: z.infer<T>) => ({
  success: true as const,
  timestamp: new Date().toISOString(),
  data,
});

export const createAuthError = (
  error: string,
  code?: AuthErrorResponse['code'],
  details?: Record<string, unknown>
) => ({
  error,
  code,
  details,
  timestamp: new Date().toISOString(),
});
