import { createCommand } from '#base';
import { logger, settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  GuildMember,
} from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';
import { formatDuration } from 'discord/utils/duration.js';
import { z } from 'zod';
import { t, getLocale } from 'i18n/index.js';
import { LoadTypes, Player, StateTypes } from 'magmastream';
import { createMusicButtons } from 'discord/responders/music/music.res.ts';

// ─────────────────────────────────────────
// Schema para validação
// ─────────────────────────────────────────
const schema = z.object({
  query: z
    .string()
    .min(1, { message: 'Minimo 1 caracteres' })
    .max(100, { message: 'Maximo 100 caracteres' }),
  platform: z
    .string()
    .min(1, { message: 'Minimo 1 caracteres' })
    .max(100, { message: 'Maximo 100 caracteres' })
    .optional(),
});

const musicChoices = ['spotify', 'youtube'] as const;

export default createCommand({
  name: 'play',
  description:
    'Tocar uma musiquinha legal. Ex: /play query: Let me go (jersey club)',
  nameLocalizations: {
    'pt-BR': 'tocar',
    'es-ES': 'tocar',
    fr: 'jouer',
  },
  descriptionLocalizations: {
    'en-US': 'Play a music',
    'es-ES': 'Pon una canción.',
    fr: 'Jouer une chanson',
    ja: '曲を演奏する',
  },
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'query',
      description: 'Nome ou link da música',
      descriptionLocalizations: {
        'en-US': 'Name or link of music',
        'es-ES': 'Nombre de la canción o enlace',
        fr: 'Nom ou lien de la chanson',
        ja: '曲名またはリンク',
      },
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'platform',
      description: 'Plataforma para tocar',
      descriptionLocalizations: {
        'en-US': 'Platform to play the music',
        'es-ES': 'Plataforma para reproducir música.',
        fr: 'Plateforme pour écouter de la musique',
        ja: '音楽を再生するプラットフォーム',
      },
      choices: musicChoices.map((plat) => ({ name: plat, value: plat })),
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });

    const { guild, member, client, channelId } = interaction;
    const locale = getLocale(interaction.locale);
    const query = interaction.options.getString('query', true);
    const platform =
      interaction.options.getString('platform', false) ||
      settings.default_platform;

    // ─────────────────────────────────────────
    // Validar input
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
    // Checar canal de voz e permissões
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
      // Obter o manager com segurança
      // ─────────────────────────────────────────
      const manager = client.music;

      if (!manager || !manager.nodes) {
        console.error('❌ getMusicManager retornou algo inválido:', manager);
        return interaction.editReply({
          content: `${settings.emojis.static.failed} - Sistema de música indisponível.`,
        });
      }

      // ─────────────────────────────────────────
      // Cria o player somente se não existe
      // ─────────────────────────────────────────
      let player = manager.players?.get(guild.id) as Player | undefined;

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
      // Buscar música e valida se NÃO esta vazia
      // ─────────────────────────────────────────
      let result = await manager.search(query, {
        requester: interaction.user,
        engine: platform,
      });

      if (
        result.loadType === LoadTypes.Empty ||
        result.loadType === LoadTypes.Error
      ) {
        return await interaction
          .editReply('No results found.')
          .catch((error) =>
            console.log(
              `[ERROR] Failed to send message ${error.message} to channel: ${channelId}`
            )
          );
      }
      // ─────────────────────────────────────────
      // Conectar se estiver conectado
      // ─────────────────────────────────────────
      if (player.state !== StateTypes.Connected) {
        await player.connect();
      }

      // ─────────────────────────────────────────
      // Lidar com tipos de resultados
      // ─────────────────────────────────────────
      switch (result.loadType) {
        case LoadTypes.Track:
        case LoadTypes.Search:
          const track = result.tracks[0];

          // Verificar estado da fila ANTES de adicionar
          const queueWasEmpty = player.queue.size.length === 0;
          const wasPlaying = player.playing;
          player.queue.add(track);

          // Toca a musica se a queue estiver vazia
          if (queueWasEmpty && !wasPlaying) {
            await player.play();
            const queueSize = await player.queue.size();
            const buttons = await createMusicButtons(
              interaction.user.id,
              player,
              locale
            );

            const embed = createEmbed({
              color: settings.colors.primary,
              author: createEmbedAuthor(interaction.user),
              title: `${settings.emojis.anim.recordspin} ${t(
                locale,
                'commands.play.fields.playing'
              )} ${track.title}`,

              description: `${t(locale, 'commands.play.fields.tracks_added', {
                count: queueSize > 0 ? queueSize : 0,
              })}`,
              thumbnail: {
                url: `${
                  track.artworkUrl ??
                  'https://ik.imagekit.io/9k3mcoolader/vynl.png?updatedAt=1700408300417'
                }`,
              },
              fields: [
                {
                  name: `${t(locale, 'commands.play.fields.duration')}`,
                  value: `${formatDuration(track.duration)}`,
                },
                {
                  name: 'Autor',
                  value: `${track.author}`,
                },
              ],
              footer: {
                text: `${t(locale, 'commands.play.fields.requested_by', {
                  username: interaction.user.username,
                })}`,
              },
              timestamp: new Date(),
            });
            const message = await interaction.editReply({
              embeds: [embed],
              components: buttons,
            });
            if (message && 'id' in message) {
              player.set('currentMessageId', message.id);
            }
            return message;
          }

          // Caso já esteja tocando → apenas adicionada à fila
          const buttons = await createMusicButtons(
            interaction.user.id,
            player,
            locale
          );
          const embedQueued = createEmbed({
            color: settings.colors.primary,
            author: createEmbedAuthor(interaction.user),
            title: `${settings.emojis.static.queue} ${t(
              locale,
              'commands.play.success.added_to_queue'
            )}`,
            thumbnail: {
              url:
                track.artworkUrl ??
                'https://ik.imagekit.io/9k3mcoolader/vynl.png?updatedAt=1700408300417',
            },
            fields: [
              {
                name: `${t(locale, 'commands.play.fields.duration')}`,
                value: formatDuration(track.duration),
              },
              {
                name: `${t(locale, 'commands.play.fields.author')}`,
                value: track.author,
              },
            ],
            footer: {
              text: `${t(locale, 'commands.play.fields.requested_by', {
                username: interaction.user.username,
              })}`,
            },
            timestamp: new Date(),
          });

          const message = await interaction.editReply({
            embeds: [embedQueued],
            components: buttons,
          });
          if (message && 'id' in message) {
            player.set('currentMessageId', message.id);
          }
          return message;
        case LoadTypes.Playlist:
          const playlist = result.playlist;
          const tracks = playlist?.tracks || result.tracks;
          if (!tracks || tracks.length === 0) {
            return interaction.editReply({
              content: `${settings.emojis.static.failed} - Playlist vazia.`,
            });
          }
          const playerListButtons = await createMusicButtons(
            interaction.user.id,
            player,
            locale
          );
          await interaction.editReply({
            content: `${settings.emojis.static.kagamine} Playlist adicionada`,
            components: playerListButtons,
          });

          // Verificar estado da fila ANTES de adicionar
          const queueWasEmptyPl = player.queue.size.length === 0;
          const wasPlayingPl = player.playing;
          player.queue.add(tracks);

          // Toca a musica se a queue estiver vazia
          if (queueWasEmptyPl && !wasPlayingPl) await player.play();

          const embedPlaylist = createEmbed({
            color: settings.colors.primary,
            author: createEmbedAuthor(interaction.user),
            title: `${settings.emojis.static.kagamine} Playlist adicionada`,
            description: `${result.tracks.length} músicas adicionadas à fila`,
            fields: [],
            footer: {
              text: `${t(locale, 'commands.play.fields.requested_by', {
                username: interaction.user.username,
              })}`,
            },
            timestamp: new Date(),
          });

          const messagePlaylist = await interaction.editReply({
            embeds: [embedPlaylist],
            components: playerListButtons,
          });
          if (messagePlaylist && 'id' in messagePlaylist) {
            player.set('currentMessageId', messagePlaylist.id);
          }
          return messagePlaylist;
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
