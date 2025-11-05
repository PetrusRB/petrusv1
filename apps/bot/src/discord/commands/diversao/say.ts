import { createCommand } from '#base';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { z } from 'zod';
import { sanitizeMessage } from 'discord/utils/safe.js';

// Sanitizador simples e seguro

const memberCanPostLinks = (interaction: ChatInputCommandInteraction) => {
  return interaction.memberPermissions?.has('EmbedLinks');
};

const messageSchema = z
  .string()
  .min(1, { message: 'A mensagem não pode ser vazia' })
  .max(4000, { message: 'Mensagem muito longa.' })
  .transform((raw) => {
    return sanitizeMessage(raw, { allowLinks: false });
  })
  .refine((s) => s.length, { message: 'Mensagem vazia após sanitização' });

export default createCommand({
  name: 'say',
  description: 'O bot fala o que o usuário manda',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'message',
      description: 'Algo pro bot falar',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async run(interaction: ChatInputCommandInteraction): Promise<any> {
    const message = interaction.options.getString('message', true);
    const parsed = messageSchema.safeParse(message);
    await interaction.deferReply({ ephemeral: false });
    if (!parsed.success) {
      return interaction.editReply({
        content: `⚠️ ${parsed.error.errors[0]?.message}`,
      });
    }
    let safeMsg = parsed.data as string;
    if (memberCanPostLinks(interaction)) {
      safeMsg = sanitizeMessage(message, {
        allowLinks: true,
        maxLen: 2000,
      });
    }
    return interaction.editReply({ content: safeMsg });
  },
});
