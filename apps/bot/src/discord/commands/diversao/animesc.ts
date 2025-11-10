import { createCommand } from '#base';
import { logger, settings } from '#settings';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';
import { z } from 'zod';
import { menus } from 'discord/menus/index.js';
import { fetchAnimeSearch } from 'discord/services/anime/anime.service.js';

// regex simples
const safeStringRegex = /^[a-zA-Z0-9\s\-\_\.\:\/\(\)\?\!]+$/;

const schema = z.object({
  anime: z
    .string()
    .min(1, 'Digite um anime para pesquisar')
    .max(100, 'Máximo de 100 caracteres')
    .regex(safeStringRegex, 'Caracteres inválidos'),

  pagina: z
    .number()
    .pipe(
      z
        .number()
        .min(1, 'Pagina deve ser >= 1.')
        .max(500, 'Limite de 500 páginas para evitar abuso.')
    ),
});

export default createCommand({
  name: 'animesc',
  description: 'Pesquisar por animes',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'anime',
      description: 'Anime para pesquisar',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'pagina',
      description: 'Página',
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],

  async run(interaction): Promise<any> {
    await interaction.deferReply();

    const anime = interaction.options.getString('anime', true);
    const pagina = interaction.options.getNumber('pagina', true);

    const parsed = schema.safeParse({ anime, pagina });
    if (!parsed.success) {
      return interaction.editReply(
        `${settings.emojis.static.failed} - Falha ao validar parâmetros.`
      );
    }

    try {
      const data = await fetchAnimeSearch(anime, pagina);

      if (!data.results || data.results.length === 0) {
        return interaction.editReply(
          `${settings.emojis.static.failed} - Nada encontrado.`
        );
      }

      return interaction.editReply(
        menus.animeSearchMenu(data.results[0], data.currentPage)
      );
    } catch (err) {
      logger.error('Erro ao buscar anime:', err);
      return interaction.editReply(
        `${settings.emojis.static.failed} - Falha interna.`
      );
    }
  },
});
