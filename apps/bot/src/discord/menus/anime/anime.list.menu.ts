import {
  ButtonBuilder,
  ButtonStyle,
  type InteractionReplyOptions,
} from 'discord.js';
import { createEmbed, createRow, brBuilder } from '@magicyan/discord';
import { settings } from '#settings';
import { AnimeItem } from 'discord/types/anime.types.js';

export function animeListMenu<R>(items: AnimeItem[], page: number): R {
  let listDesc =
    items.length > 0
      ? items
          .map((anime, i) =>
            brBuilder(
              `**${(page - 1) * 10 + (i + 1)}. ${anime.name}**`,
              `📺 Episódios: \`${
                anime.episodes?.eps ?? anime.episodes?.sub ?? '??'
              }\``,
              anime.duration ? `⏳ Duração: \`${anime.duration}\`` : null,
              `🔞 Adulto: \`${anime.rated ? 'Sim' : 'Não'}\``,
              `🆔 \`${anime.id}\``
            )
          )
          .join('\n\n')
      : 'Nenhum anime encontrado.';
  if (listDesc.length > 4000) {
    listDesc = listDesc.slice(0, 4000) + '\n\n…';
  }

  const embed = createEmbed({
    color: settings.colors.primary,
    title: `📚 Lista de Animes — Página ${page}`,
    description: listDesc || 'Nenhum anime encontrado.',
    footer: { text: `Mostrando ${items.length} resultados` },
  });

  const components = [
    createRow(
      new ButtonBuilder()
        .setCustomId(`anime/list-prev/${page}`)
        .setLabel('⬅ Página Anterior')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 1),

      new ButtonBuilder()
        .setCustomId(`anime/list-next/${page}`)
        .setLabel('➡ Próxima Página')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`anime/list-select/${page}`)
        .setLabel('📄 Selecionar Anime')
        .setStyle(ButtonStyle.Secondary)
    ),
  ];
  return {
    embeds: [embed],
    components,
  } as InteractionReplyOptions as R;
}
