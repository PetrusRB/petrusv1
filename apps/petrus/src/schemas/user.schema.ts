import { z } from 'zod';
export const UserPublicSchema = z.object({
  id: z.string(),
  clerkUserId: z.string().nullable(),
  email: z.string().email().nullable(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  pictureUrl: z.string().url().nullable(),
  isActive: z.boolean(),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']),
});

export const UserSyncSchema = UserPublicSchema.omit({
  id: true,
  role: true,
}).extend({
  clerkUserId: z.string(), // aqui é obrigatório
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  pictureUrl: z.string().url().optional(),
});

export type UserPublic = z.infer<typeof UserPublicSchema>;
