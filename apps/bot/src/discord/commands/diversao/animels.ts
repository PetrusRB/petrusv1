import { createCommand } from '#base';
import { logger, settings } from '#settings';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';
import { z } from 'zod';
import { menus } from 'discord/menus/index.js';
import { fetchAnimeList } from 'discord/services/anime/anime.service.js';

const schema = z.object({
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
  name: 'animels',
  description: 'Listar animes por página',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'pagina',
      description: 'Página',
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],

  async run(interaction): Promise<any> {
    await interaction.deferReply();

    const pagina = interaction.options.getNumber('pagina', true);

    const parsed = schema.safeParse({ pagina });
    if (!parsed.success) {
      return interaction.editReply(
        `${settings.emojis.static.failed} - Parâmetros inválidos.`
      );
    }

    try {
      const data = await fetchAnimeList(pagina);

      if (!data.results || data.results.length === 0) {
        return interaction.editReply(
          `${settings.emojis.static.failed} - Nada encontrado.`
        );
      }
      return interaction.editReply(
        menus.animeListMenu(data.results, data.currentPage)
      );
    } catch (err) {
      logger.error('Erro ao listar animes:', err);
      return interaction.editReply(
        `${settings.emojis.static.failed} - Falha interna.`
      );
    }
  },
});
