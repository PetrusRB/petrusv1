import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { createEmbed, createRow, brBuilder } from '@magicyan/discord';
import { settings } from '#settings';
import { AnimeItem } from 'discord/types/anime.types.js';

export function animeSearchMenu<R>(anime: AnimeItem, page: number): R {
  const desc = brBuilder(
    `🎬 **Título:** ${anime.name}`,
    `📄 **Página:** ${page}`,
    anime.duration ? `⏳ **Duração:** ${anime.duration}` : null,
    `🧩 **Episódios:** ${anime.episodes?.eps ?? anime.episodes?.sub ?? '??'}`,
    `🔞 **+18:** ${anime.rated ? 'Sim' : 'Não'}`
  ).substring(0, 3900); // limite

  const embed = createEmbed({
    color: settings.colors.primary,
    title: '🔎 Resultado da Pesquisa',
    description: desc,
  });

  const components = [
    createRow(
      new ButtonBuilder()
        .setCustomId(`anime/details/${anime.id}:${page}`)
        .setLabel('📘 Detalhes')
        .setStyle(ButtonStyle.Secondary)
    ),
  ];

  return {
    embeds: [embed],
    components,
  } as R;
}
