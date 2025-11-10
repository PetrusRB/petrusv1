import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed } from '@magicyan/discord';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { z } from 'zod';
import ky from 'ky';

import type { FFPlayerData } from './../../types/fftypes.js'; // ajusta o caminho conforme seu projeto

const API_BASE_URL = 'https://info-ob49.vercel.app';

const kyInstance = ky.create({
  timeout: 10_000,
  retry: { limit: 1 },
});

const schema = z.object({
  jogador: z.string().min(1, 'O ID do jogador é obrigatório'),
});

const ERROR_MESSAGES = {
  INVALID_CHANNEL: `${settings.emojis.static.failed} Este comando só pode ser executado em canais de texto`,
  BOT_PERMISSIONS: `${settings.emojis.static.failed} Não tenho permissão para gerenciar mensagens`,
  VALIDATION_ERROR: `${settings.emojis.static.failed} Erro de validação:`,
  NO_RESPONSE: `${settings.emojis.static.failed} Não obtive resposta do servidor`,
  USER_NOT_FOUND: `${settings.emojis.static.failed} Usuário não encontrado`,
  FETCH_ERROR: `${settings.emojis.static.failed} Erro ao buscar dados`,
  MISSING_PERMISSIONS: `${settings.emojis.static.failed} Não tenho permissão para mostrar informações neste canal!`,
} as const;

const formatTimeActive = (
  time: string | undefined
): '🌙 Noite' | '🌞 Dia' | '❔ Indefinido' => {
  if (!time) return '❔ Indefinido';
  const normalized = time.toUpperCase();
  if (normalized.includes('NIGHT')) return '🌙 Noite';
  if (normalized.includes('DAY')) return '🌞 Dia';
  return '❔ Indefinido';
};

const SUCCESS_MESSAGES = {
  SEARCHING: `${settings.emojis.anim.loading} Pesquisando...`,
  SUCCESS_TITLE: `${settings.emojis.static.search} Concluído!`,
} as const;

export default createCommand({
  name: 'ffinfo',
  description: 'Mostra informações de usuário do Free Fire',
  options: [
    {
      name: 'jogador',
      description: 'ID do jogador no Free Fire',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'regiao',
      description: 'Região do jogador (ex: br, sg, us)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  type: ApplicationCommandType.ChatInput,
  async run(interaction: ChatInputCommandInteraction): Promise<any> {
    await interaction.deferReply();

    const jogadorOption = interaction.options.getString('jogador', true);
    const regiaoOption =
      interaction.options.getString('regiao')?.toLowerCase() ?? 'br';

    const parsed = schema.safeParse({ jogador: jogadorOption });
    if (!parsed.success) {
      const err = parsed.error.errors.map((e) => e.message).join(', ');
      await interaction.editReply({
        content: `${ERROR_MESSAGES.VALIDATION_ERROR} ${err}`,
      });
      return;
    }

    try {
      await interaction.editReply({ content: SUCCESS_MESSAGES.SEARCHING });

      const { jogador } = parsed.data;
      const response = await kyInstance.get(`${API_BASE_URL}/api/account/`, {
        searchParams: {
          uid: jogador,
          region: regiaoOption,
        },
      });

      if (!response.ok) {
        await interaction.editReply({ content: ERROR_MESSAGES.NO_RESPONSE });
        return;
      }

      const data = (await response.json()) as FFPlayerData;

      // Pegando alguns campos para exibir
      const b = data.basicInfo;
      const socialInfo = data.socialInfo;
      const clan = data.clanBasicInfo;
      const clanLevelKey = `level${
        clan?.clanLevel || 0
      }` as keyof typeof settings.emojis.static;
      const clanLevelEmoji = settings.emojis.static[clanLevelKey] ?? '🏆'; // fallback caso não exista

      const embed = createEmbed({
        title: `🎮 ${b.nickname} ${b.rank ? `• ${b.rank}` : ''}`,
        color: settings.colors.orange,
        description: `${
          settings.emojis.static.freefire
        } Informações do jogador **${
          b.nickname
        }** na região **${b.region.toUpperCase()}**.`,

        fields: [
          {
            name: '📋 Informações da Conta',
            value: `🆔 **ID:** ${
              b.accountId ?? b.accountId
            }\n 🪙 **Tenhe Passe** ${
              b.hasElitePass ? 'Sim' : 'Não'
            }\n 🔼 **Nível:** ${b.level}\n💎 **Curtidas:** ${
              b.liked ?? b.liked
            }\n ✈️ **Rank no BR** ${
              b.rank + '/' + b.maxRank
            } \n 🔫 **Rank no CS** ${b.csRank + '/' + b.csMaxRank}\n`,
            inline: true,
          },
          {
            name: '💬 Social',
            value: `🕐 **Ativo:** ${formatTimeActive(
              socialInfo?.timeActive
            )}\n🖋️ **Bio:** ${
              socialInfo?.signature || '_Sem biografia definida_'
            }`,
            inline: true,
          },
          ...(clan?.clanId
            ? [
                {
                  name: '🏛️ Clã',
                  value: `**${clan.clanName}**\n👥 Membros: ${clan.memberNum}\n 🏟️ Capacidade: ${clan.capacity}\n ${clanLevelEmoji} Nivél: ${clan.clanLevel}`,
                  inline: false,
                },
              ]
            : []),
        ],
        timestamp: new Date(),
        footer: {
          text: `🌎 Região: ${b.region.toUpperCase()} • 🔖 Versão: ${
            b.releaseVersion ?? 'Desconhecida'
          }`,
        },
      });

      await interaction.editReply({ content: '', embeds: [embed] });
    } catch (err) {
      console.error('Erro no comando ffinfo:', err);
      await interaction.editReply({ content: ERROR_MESSAGES.FETCH_ERROR });
    }
  },
});
