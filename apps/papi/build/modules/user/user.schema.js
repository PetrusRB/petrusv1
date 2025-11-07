import { z } from 'zod';
export const UpdateProfileSchema = z.object({
    displayName: z.string().min(2).max(50).optional(),
    picture: z.string().url().optional(),
});
