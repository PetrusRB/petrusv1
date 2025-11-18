import { z } from 'zod';

export const envSchema = z.object({
  BOT_TOKEN: z.string({ message: 'Token do bot é obrigatória' }).min(1),
  WEBHOOK_LOGS_URL: z.string().url().optional(),
  MONGO_URI: z
    .string({ message: 'URL do banco de dados é obrigatória' })
    .min(1),
  SECRET_KEY: z.string({ message: 'Key secretinha é obrigatória' }),
});
