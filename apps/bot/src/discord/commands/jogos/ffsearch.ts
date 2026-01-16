import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { z } from 'zod';
import ky from 'ky';

import type {
  FFPlayerSearchResponse,
  FFPlayerSearchResult,
} from 'discord/types/fftypes.js';

const API_BASE_URL = 'https://searchbynicknameapi.onrender.com';

const kyInstance = ky.create({
  timeout: 10_000,
  retry: { limit: 1 },
});

const schema = z.object({
  jogador: z.string().min(1, 'O ID do jogador é obrigatório'),
  region: z
    .string()
    .min(2, 'Regĩao do jogador precisa pelo menos ser 2 caracteres'),
});

// Idiomas suportados
const regions = ['br', 'sg', 'us'] as const;

const ERROR_MESSAGES = {
  INVALID_CHANNEL: `${settings.emojis.static.failed} Este comando só pode ser executado em canais de texto`,
  BOT_PERMISSIONS: `${settings.emojis.static.failed} Não tenho permissão para gerenciar mensagens`,
  VALIDATION_ERROR: `${settings.emojis.static.failed} Erro de validação:`,
  NO_RESPONSE: `${settings.emojis.static.failed} Não obtive resposta do servidor`,
  USER_NOT_FOUND: `${settings.emojis.static.failed} Usuário não encontrado`,
  FETCH_ERROR: `${settings.emojis.static.failed} Erro ao buscar dados`,
  MISSING_PERMISSIONS: `${settings.emojis.static.failed} Não tenho permissão para mostrar informações neste canal!`,
} as const;

const SUCCESS_MESSAGES = {
  SEARCHING: `${settings.emojis.anim.loading} Pesquisando...`,
  SUCCESS_TITLE: `${settings.emojis.static.search} Concluído!`,
} as const;

export default createCommand({
  name: 'ffsearch',
  description: 'Pesquisa Jogadores do Free Fire',
  options: [
    {
      name: 'jogador',
      description: 'Nome do jogador (qualquer um)',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'região',
      description: 'Região para pesquisar o jogador: (br, us, sg)',
      type: ApplicationCommandOptionType.String,
      choices: regions.map((reg) => ({ name: reg, value: reg })),
    },
  ],
  type: ApplicationCommandType.ChatInput,

  async run(interaction: ChatInputCommandInteraction): Promise<any> {
    await interaction.deferReply();

    const jogadorOption = interaction.options.getString('jogador', true);
    const regionOption = interaction.options.getString('região', false) ?? 'br';
    const parsed = schema.safeParse({
      jogador: jogadorOption,
      region: regionOption,
    });

    if (!parsed.success) {
      const err = parsed.error.issues.map((e) => e.message).join(', ');
      await interaction.editReply({
        content: `${ERROR_MESSAGES.VALIDATION_ERROR} ${err}`,
      });
      return;
    }

    try {
      await interaction.editReply({ content: SUCCESS_MESSAGES.SEARCHING });

      const { jogador, region } = parsed.data;
      const response = await kyInstance.get(`${API_BASE_URL}/search`, {
        searchParams: { name: jogador, region: region },
      });

      if (!response.ok) {
        await interaction.editReply({ content: ERROR_MESSAGES.NO_RESPONSE });
        return;
      }

      const data = (await response.json()) as FFPlayerSearchResponse;

      if (!data.result || data.result.length === 0) {
        await interaction.editReply({ content: ERROR_MESSAGES.USER_NOT_FOUND });
        return;
      }

      // Mostrar até 50 jogadores encontrados
      const playersToShow = data.result.slice(0, 50);

      const embed = createEmbed({
        title: `🎮 Resultados da busca por: "${jogador}"`,
        author: createEmbedAuthor(interaction.user),
        color: settings.colors.orange,
        fields: playersToShow.map((p: FFPlayerSearchResult, index) => ({
          name: `${index + 1}. ${p.nickname} [${p.region}]`,
          value: `🆔 **ID:** ${p.account_id}\n🔼 **Nível:** ${
            p.level
          }\n💬 **Bio:** ${p.bio || '_Sem bio_'}\n🏛️ **Clã:** ${
            p.clan_name || '_Nenhum_'
          }\n🔖 **Versão:** ${p.release_version || '_Desconhecida_'}`,
        })),
        timestamp: new Date(),
      });

      await interaction.editReply({ content: '', embeds: [embed] });
    } catch (err) {
      console.error('Erro no comando ffsearch:', err);
      await interaction.editReply({ content: ERROR_MESSAGES.FETCH_ERROR });
    }
  },
});
