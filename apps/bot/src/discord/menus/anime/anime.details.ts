import { settings } from '#settings';
import { brBuilder, createEmbed } from '@magicyan/discord';
import { AnimeItem } from 'discord/types/anime.types.js';

export function animeDetails(anime: AnimeItem) {
  return createEmbed({
    color: settings.colors.primary,
    title: `📺 ${anime.name}`,
    thumbnail: anime.img,
    description: brBuilder(
      `🧩 **Episódios:** \`${
        anime.episodes?.eps ?? anime.episodes?.sub ?? '??'
      }\``,
      `⏳ **Duração:** \`${anime.duration ?? 'Não informado'}\``,
      `🔞 **Adulto:** \`${anime.rated ? 'Sim' : 'Não'}\``,
      '',
      `📌 **ID:** \`${anime.id}\``
    ),
  });
}
