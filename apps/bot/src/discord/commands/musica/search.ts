import { createCommand } from '#base';
import { logger, settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { ButtonBuilder, ButtonStyle, GuildMember } from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';
import { z } from 'zod';
import { t, getLocale } from 'i18n/index.js';
import { LoadTypes, Player, StateTypes, Track } from 'magmastream';
import { ActionRowBuilder } from 'discord.js';
import { formatDuration } from 'discord/utils/duration.js';

// ─────────────────────────────────────────
// Função auxiliar: Detectar tipo de busca
// ─────────────────────────────────────────
function detectEngine(query: string): 'spotify' | 'apple' {
  const q = query.toLowerCase();

  if (q.includes('open.spotify.com')) return 'spotify';
  if (q.includes('music.apple.com')) return 'apple';

  return 'spotify';
}

// ─────────────────────────────────────────
// Schema para validação
// ─────────────────────────────────────────
const schema = z.object({
  query: z
    .string()
    .min(1, { message: 'Minimo 1 caracteres' })
    .max(100, { message: 'Maximo 100 caracteres' }),
});

export default createCommand({
  name: 'search',
  nameLocalizations: {
    'pt-BR': 'pesquisar',
    'es-ES': 'buscar',
    fr: 'rechercher',
  },
  description: 'Pesquisa uma música: /search query:Lofi mix chill',
  descriptionLocalizations: {
    'en-US': 'Search a music',
    'es-ES': 'Buscando una canción',
    fr: 'Recherche une piste.',
    ja: '曲を探す',
  },
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'query',
      description: 'Nome de uma música',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });

    const { guild, member, client, channelId } = interaction;
    const locale = getLocale(interaction.locale);
    const query = interaction.options.getString('query', true);

    // ─────────────────────────────────────────
    // 1. Validar input
    // ─────────────────────────────────────────
    const parsed = schema.safeParse({ query });
    if (!parsed.success) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} - ${t(
          locale,
          'commands.play.errors.validation_failed'
        )}`,
      });
    }

    if (!(member instanceof GuildMember)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} - ${t(
          locale,
          'commands.play.errors.no_member_info'
        )}`,
      });
    }

    // ─────────────────────────────────────────
    // 2. Checar canal de voz
    // ─────────────────────────────────────────
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} - ${t(
          locale,
          'commands.play.errors.not_in_voice'
        )}`,
      });
    }

    const permissions = voiceChannel.permissionsFor(client.user!);
    if (!permissions?.has(['Connect', 'Speak'])) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} - ${t(
          locale,
          'commands.play.errors.no_permission'
        )}`,
      });
    }

    try {
      // ─────────────────────────────────────────
      // 3. Obter o manager com segurança
      // ─────────────────────────────────────────
      const manager = client.music;

      if (!manager || !manager.nodes) {
        console.error('❌ getMusicManager retornou algo inválido:', manager);
        return interaction.editReply({
          content: `${settings.emojis.static.failed} - Sistema de música indisponível.`,
        });
      }

      // ─────────────────────────────────────────
      // 6. Obter / criar player
      // ─────────────────────────────────────────
      let player = manager.players?.get(guild.id) as Player | undefined;

      // ─────────────────────────────────────────
      // 7. Verificar se o player existe
      // ─────────────────────────────────────────
      if (!player) {
        player = manager.create({
          guildId: guild.id,
          voiceChannelId: voiceChannel.id,
          textChannelId: channelId,
          selfDeafen: true,
          volume: 100,
        });
      } else {
        // Garantir canal correto antes de conectar
        if (player.voiceChannelId !== voiceChannel.id) {
          player.setVoiceChannelId(voiceChannel.id);
        }
      }
      // ─────────────────────────────────────────
      // 8. Buscar música
      // ─────────────────────────────────────────
      const engine = detectEngine(query);
      let result = await manager.search(query, {
        requester: interaction.user,
        engine: engine,
      });

      // ─────────────────────────────────────────
      // 9. Checa se há resultados na busca
      // ─────────────────────────────────────────
      if (
        result.loadType === LoadTypes.Empty ||
        result.loadType === LoadTypes.Error
      ) {
        return await interaction
          .editReply(`${t(locale, 'commands.search.errors.no_results')}`)
          .catch((error) =>
            console.log(
              `[ERROR] Failed to send message ${error.message} to channel: ${channelId}`
            )
          );
      }

      // ─────────────────────────────────────────
      // 10. Conectar se estiver conectado
      // ─────────────────────────────────────────
      if (player.state !== StateTypes.Connected) {
        await player.connect();
      }
      // ─────────────────────────────────────────
      // 11. Definir os resultados de busca
      // ─────────────────────────────────────────
      let tracks: Track[] = [];
      switch (result.loadType) {
        case LoadTypes.Track:
          tracks = [result.tracks[0] as Track];
          break;

        case LoadTypes.Search:
          tracks = result.tracks as Track[];
          break;

        case LoadTypes.Playlist:
          tracks = result.playlist?.tracks ?? (result.tracks as Track[]) ?? [];
          break;
      }

      // ─────────────────────────────────────────
      // 12. Verificar se a lista esta vazia
      // ─────────────────────────────────────────
      if (tracks.length === 0) {
        return interaction.editReply({
          content: `${settings.emojis.static.failed} ${t(
            locale,
            'commands.search.errors.no_results'
          )}`,
        });
      }

      // ─────────────────────────────────────────
      // 13. Enviar os embeds e definir o cache
      // ─────────────────────────────────────────
      switch (result.loadType) {
        case LoadTypes.Track:
        case LoadTypes.Search: {
          const top = tracks.slice(0, 5);
          const cacheKey = `${guild.id}:${interaction.user.id}`;

          client.searchCache.set(cacheKey, {
            tracks: top,
            expires: Date.now() + 30_000,
            guildId: guild.id,
            userId: interaction.user.id,
          });

          // buttons: 1..N + cancel
          const buttons = top.map((t, i) =>
            new ButtonBuilder()
              .setCustomId(`music/select/${interaction.user.id}/${i}`)
              .setLabel(String(i + 1))
              .setStyle(ButtonStyle.Primary)
          );

          const cancelBtn = new ButtonBuilder()
            .setCustomId(`music/cancel/${interaction.user.id}/0`)
            .setLabel(`${t(locale, 'commands.search.buttons.cancel')}`)
            .setStyle(ButtonStyle.Danger);

          // action rows (up to 5 buttons)
          const rows = [
            new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons),
            new ActionRowBuilder<ButtonBuilder>().addComponents(cancelBtn),
          ];

          const embed = createEmbed({
            color: settings.colors.primary,
            author: createEmbedAuthor(interaction.user),
            title: `${t(locale, 'commands.search.success.title')}`,
            description: top
              .map(
                (t, i) =>
                  `**${i + 1}.** ${t.title} — ${t.author} • ${formatDuration(
                    t.duration
                  )}`
              )
              .join('\n'),
          });

          return interaction.editReply({ embeds: [embed], components: rows });
        }

        case LoadTypes.Playlist: {
          const queueEmpty = player.queue.size.length === 0;
          const playingBefore = player.playing;

          player.queue.add(tracks);

          if (queueEmpty && !playingBefore) {
            await player.play();
          }

          const embedPlaylist = createEmbed({
            color: settings.colors.primary,
            author: createEmbedAuthor(interaction.user),
            title: `${settings.emojis.static.daftpunk} ${t(
              locale,
              'commands.play.success.playlist_added'
            )}`,
            description: `${t(locale, 'commands.play.fields.tracks_added', {
              count: tracks.length,
            })}`,
          });

          return interaction.editReply({ embeds: [embedPlaylist] });
        }
      }
    } catch (error) {
      logger.error('Erro ao tocar música:', error);
      return interaction.editReply({
        content: `${settings.emojis.static.failed} - ${t(
          locale,
          'commands.play.errors.generic_error'
        )}`,
      });
    }
  },
});
