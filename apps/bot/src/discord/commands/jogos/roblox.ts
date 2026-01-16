import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed } from '@magicyan/discord';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { RobloxClient } from '../../clients/robloxClient.js';

import { z } from 'zod';

interface ImageResponse {
  data: Array<{
    targetId: number;
    state: 'Completed' | 'Pending' | 'Blocked';
    imageUrl: string | null;
  }>;
}

// API
const schema = z.object({
  jogador: z.string({
    error: 'A nome de usuário do jogador é obrigatória',
  }),
});
import * as noblox from 'noblox.js';

const client = new RobloxClient({
  useNoblox: false, // true -> ativa noblox fallback (precisa de cookie)
  nobloxModule: noblox as unknown as typeof noblox,
  cookie: process.env.ROBLOX_COOKIE,
});

// Mensagems constantes
const ERROR_MESSAGES = {
  INVALID_CHANNEL: `${settings.emojis.static.failed} Este comando só pode ser executado em canais de texto`,
  BOT_PERMISSIONS: `${settings.emojis.static.failed} Não tenho permissão para gerenciar mensagems`,
  VALIDATION_ERROR: `${settings.emojis.static.failed} Erro de validação:`,
  NO_RESPONSE: `${settings.emojis.static.failed} Não obteve resposta com o servidor`,
  USER_NOT_FOUND: `${settings.emojis.static.failed} Usuário não encontrado`,
  FETCH_ERROR: `${settings.emojis.static.failed} Erro ao buscar dados`,
  MISSING_PERMISSIONS: `${settings.emojis.static.failed} Não tenho permissão para mostrar informações neste canal!`,
} as const;
const SUCCESS_MESSAGES = {
  SEARCHING: `${settings.emojis.anim.loading} Pesquisando...`,
  SUCCESS_TITLE: `${settings.emojis.static.search} Concluido!`,
} as const;

export default createCommand({
  name: 'robinfo',
  description: 'Mostra informações do Roblox',
  options: [
    {
      name: 'jogador',
      description: 'Nome do Jogador ',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  type: ApplicationCommandType.ChatInput,
  async run(interaction: ChatInputCommandInteraction): Promise<any> {
    await interaction.deferReply();

    const jogadorOption = interaction.options.getString('jogador', true);
    const parsed = schema.safeParse({ jogador: jogadorOption });
    if (!parsed.success) {
      await interaction.editReply({ content: ERROR_MESSAGES.VALIDATION_ERROR });
      return;
    }

    try {
      const validadedData = parsed.data;
      const { jogador } = validadedData;
      const lookup = await client.lookupByUsername(jogador);
      const aggregated = await client.aggregateUserFull(lookup.id as number, {
        concurrency: 6,
      });
      const imageResponse = await fetch(
        `https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${lookup.id}&size=48x48&format=png`
      );
      const imageData = (await imageResponse.json()) as ImageResponse;

      // Extrair imageUrl com segurança de tipo
      const imageUrl =
        imageData.data[0]?.imageUrl ??
        `https://www.roblox.com/headshot-thumbnail/image?userId=${lookup.id}&width=150&height=150`;

      // Criar embed
      const embed = createEmbed({
        title: `👤 ${lookup.displayName || lookup.name}`,
        color: settings.colors.developer,
        thumbnail: {
          url: imageUrl,
        },
        fields: [
          { name: '🆔 ID', value: `${lookup.id}`, inline: true },
          { name: '🧾 Nome', value: lookup.name, inline: true },
          { name: '📛 Exibição', value: lookup.displayName, inline: true },
          {
            name: '📅 Criado em',
            value: (aggregated.details?.created
              ? new Date(aggregated.details.created).toLocaleString()
              : '—') as string,
            inline: true,
          },
          {
            name: `👥 Grupos (${aggregated.groups.length})`,
            value: (aggregated.groups.length
              ? aggregated.groups
                  .slice(0, 20)
                  .map((g) => `${g.group.name} (${g.role.name})`)
                  .join('\n')
              : 'Nenhum') as string,
          },
        ],
        footer: { text: `Roblox ID: ${lookup.id}` },
        timestamp: new Date(),
      });

      await interaction.editReply({
        embeds: [embed],
        content: SUCCESS_MESSAGES.SUCCESS_TITLE,
      });
    } catch (err) {
      console.error('Erro no robloxinfo:', err);
      await interaction.editReply({ content: ERROR_MESSAGES.FETCH_ERROR });
    }
  },
});
