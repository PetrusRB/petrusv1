import { z } from 'zod';

export const ServerSchema = z.object({
  type: z.enum(['user.created', 'user.updated', 'user.deleted']),
  data: z.object({
    id: z.string(),
    email_addresses: z
      .array(z.object({ email_address: z.string() }))
      .optional(),
    first_name: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    username: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
  }),
});

export type Server = z.infer<typeof ServerSchema>;
