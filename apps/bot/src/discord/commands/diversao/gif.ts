import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from 'discord.js';
import ky from 'ky';
import { z } from 'zod';

interface MediaFormat {
  url: string;
  duration: number;
  preview: string;
  dims: [number, number];
  size: number;
}
interface TenorResult {
  id: number;
  title: string;
  media_formats: Record<string, MediaFormat>;
  created: number;
  content_description: string;
  itemurl: string;
  url: string;
  tags: string[];
  flags: string[];
  hasaudio: boolean;
  content_description_source: string;
}
interface TenorResponse {
  results: TenorResult[];
  next: string;
}

const schema = z.object({
  search: z
    .string()
    .min(1, { message: 'Minimo de 1 caracteres' })
    .max(100, { message: 'Minimo de 100 caracterias' }),
});

const API = 'https://tenor.googleapis.com/v2';
const API_KEY = process.env.TENOR_KEY;

const ERROR_MESSAGE = {
  FAILED_PARSE: `${settings.emojis.static.failed} - Hm... isso nem parece uma busca válida.`,
  API_DOWN: `${settings.emojis.static.failed} - Parece que o Tenor tirou um cochilo. Tenta de novo mais tarde.`,
  NOT_FOUND: `😕 - Não achei nada que combine com isso. Tenta outro termo!`,
  GENERIC: `💥 - Deu ruim aqui. Prometo que não foi culpa minha (dessa vez).`,
};
const localeMap: Record<string, { locale: string; country: string }> = {
  'pt-BR': { locale: 'pt_BR', country: 'BR' },
  'pt-PT': { locale: 'pt_PT', country: 'PT' },
  'en-US': { locale: 'en_US', country: 'US' },
  'es-ES': { locale: 'es_ES', country: 'ES' },
  fr: { locale: 'fr_FR', country: 'FR' },
};

export default createCommand({
  name: 'gif',
  description:
    'Mostrar gifs com base ao que usúario quer: /gif <qualquer_coisa>',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'search',
      description: 'Pesquisa do gif',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'aleatorio',
      description: 'Pegar gifs aleatoriamente ou não',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
  async run(interaction: ChatInputCommandInteraction): Promise<any> {
    const search = interaction.options.getString('search', true);
    const randomVal = interaction.options.getBoolean('aleatorio') || false;
    const parsed = schema.safeParse({ search });
    await interaction.deferReply({ ephemeral: false });

    if (!parsed.success) {
      return interaction.editReply({ content: ERROR_MESSAGE.FAILED_PARSE });
    }

    try {
      const parsedData = parsed.data;
      const userLocale = interaction.locale || 'pt-BR';
      const { locale, country } = localeMap[userLocale] || {
        locale: settings.default_locale,
        country: settings.default_country,
      };

      const params = new URLSearchParams({
        q: parsedData.search ?? 'aleatório',
        key: API_KEY ?? '',
        limit: '10',
        locale: locale,
        country: country,
        random: `${randomVal}`,
        media_filter: 'minimal',
        contentfilter: 'high',
      });

      const response = await ky
        .get(`${API}/search`, { searchParams: params })
        .json<TenorResponse>();

      const gifs = response.results;
      if (!gifs) {
        return interaction.editReply({ content: ERROR_MESSAGE.NOT_FOUND });
      }

      if (!Array.isArray(gifs) || gifs.length === 0) {
        return interaction.editReply({
          content: ERROR_MESSAGE.NOT_FOUND,
        });
      }

      // Escolhe um GIF aleatório
      const random = gifs[Math.floor(Math.random() * gifs.length)];
      const gifUrl = random.media_formats.gif?.url || random.url;

      const embed = createEmbed({
        title: random.title || '',
        author: createEmbedAuthor(interaction.user),
        image: gifUrl,
        url: random.itemurl,
        color: settings.colors.yellow,
      });

      // Editar a mensagem para incluir o embed com o meme
      return interaction.editReply({ content: '', embeds: [embed] });
    } catch (error: any) {
      console.error('Erro ao buscar memes:', error);

      return interaction.editReply({
        content: ERROR_MESSAGE.GENERIC,
      });
    }
  },
});
