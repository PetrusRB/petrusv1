import { z } from "zod";

export const envSchema = z.object({
    BOT_TOKEN: z.string({ description: "Token do bot é obrigatória" }).min(1),
    WEBHOOK_LOGS_URL: z.string().url().optional(),
    MONGO_URI: z.string({ description: "URL do banco de dados é obrigatória" }).min(1),
    SECRET_KEY: z.string({ description: "Key secretinha é obrigatória" })
});
