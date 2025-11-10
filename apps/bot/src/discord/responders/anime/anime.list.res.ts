import { createResponder, ResponderType } from '#base';
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { menus } from 'discord/menus/index.js';
import {
  fetchAnimeDetails,
  fetchAnimeList,
} from 'discord/services/anime/anime.service.js';

createResponder({
  customId: 'anime/:action/:value',
  types: [ResponderType.Button, ResponderType.StringSelect],
  cache: 'cached',

  async run(interaction, { action, value }): Promise<any> {
    try {
      await interaction.deferUpdate().catch(() => {});

      const safeNumber = (n: any) => {
        const num = Number(n);
        return isNaN(num) || num < 1 ? 1 : num;
      };

      switch (action) {
        case 'list-prev': {
          const page = safeNumber(value) - 1;
          const data = await fetchAnimeList(page);

          return interaction.editReply(menus.animeListMenu(data.results, page));
        }

        case 'list-next': {
          const page = safeNumber(value) + 1;
          const data = await fetchAnimeList(page);

          return interaction.editReply(menus.animeListMenu(data.results, page));
        }

        case 'list-select': {
          const page = safeNumber(value);
          const data = await fetchAnimeList(page);

          if (!data?.results?.length) {
            return interaction.editReply({
              content: 'Nenhum anime disponível.',
              components: [],
            });
          }

          const select = new StringSelectMenuBuilder()
            .setCustomId(`anime/details/select`)
            .setPlaceholder('Selecione um anime…')
            .addOptions(
              data.results.slice(0, 25).map((a) => ({
                label: a.name.substring(0, 100),
                value: a.id,
              }))
            );

          return interaction.editReply({
            components: [
              new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                select
              ),
            ],
          });
        }

        case 'details': {
          const raw = interaction.isStringSelectMenu()
            ? interaction.values[0]
            : value;

          const [animeId] = raw.split(':');

          const anime = await fetchAnimeDetails(animeId);

          if (!anime) {
            return interaction.editReply({
              content: '❌ Detalhes não encontrados.',
              components: [],
            });
          }

          return interaction.editReply({
            embeds: [menus.animeDetails(anime)],
            components: [],
          });
        }

        default:
          return interaction.editReply({
            content: '⚠ Ação inválida.',
            components: [],
          });
      }
    } catch (err) {
      console.error('ERRO NO HANDLER:', err);

      return interaction
        .editReply({
          content: '⚠ Ocorreu um erro ao processar a interação.',
          components: [],
        })
        .catch(() => {});
    }
  },
});
