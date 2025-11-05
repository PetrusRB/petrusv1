import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { z } from "zod";
import crypto from "node:crypto";

// Config de segurança
const SECRET_KEY = crypto.createHash("sha256").update(process.env.CRYPTO_SECRET || "default_dev_key").digest(); // 32 bytes para AES-256

// Funções criptográficas
function encryptProcess(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", SECRET_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Junta IV + AuthTag + dados e códifica em base64
    return Buffer.concat([iv, authTag, encrypted]).toString("base64")
}

function decryptProcess(base64: string): string {
    try {
        const data = Buffer.from(base64, "base64");
        const iv = data.subarray(0, 12);
        const authTag = data.subarray(12, 28);
        const encryptedText = data.subarray(28);
        const decipher = crypto.createDecipheriv("aes-256-gcm", SECRET_KEY, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString("utf8");
    } catch {
        throw new Error("Falha ao descriptografar. O texto pode estar incorreto");
    }
}
const cryptSchema = z.object({
    texto: z.string().min(1, "O texto não pode estar vazio.").max(4096, "Texto muito longo (limite: 4096 caracteres)."),
    encrypt: z.boolean(),
})

export default createCommand({
    name: 'crypt',
    description: "Criptografa/descriptografa um texto",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "texto",
            description: "Texto para ser descriptografado/criptografado",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "encrypt",
            description: "Criptografar ou descriptografar?",
            type: ApplicationCommandOptionType.Boolean,
            required: true
        }
    ],
    async run(interaction) {
        const texto = interaction.options.getString("texto");
        const isEncrypting = interaction.options.getBoolean("encrypt");
        // Validação
        const parsed = cryptSchema.safeParse({ texto, encrypt: isEncrypting })
        if (!parsed.success) {
            interaction.reply({
                content: `${settings.emojis.static.no} ${parsed.error.issues[0].message}`,
                ephemeral: true,
            });
            return;
        }
        const { texto: input, encrypt } = parsed.data;
        await interaction.reply({ content: `${settings.emojis.anim.loading} ${encrypt ? "Criptografando" : "Descriptografando"}`, fetchReply: true });
        let result: string;
        try {
            result = encrypt ? encryptProcess(input) : decryptProcess(input);
        } catch (err: any) {
            interaction.editReply({
                content: `${settings.emojis.static.no} ${err.message || "Erro inesperado ao processar o texto}"}`
            });
            return;
        }

        const embed = createEmbed({
            author: createEmbedAuthor(interaction.user),
            title: encrypt ? `🔐 Texto criptografado` : `🔓 Texto Descriptografado`,
            description: `\`\`\`${result}\`\`\``,
            color: encrypt ? settings.colors.orange : settings.colors.magic,
        });
        await interaction.editReply({
            content: '',
            embeds: [embed]
        });
    }
});

