import { createCommand } from '#base';
import { logger, settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';
import ck from 'chalk';
import { Track } from 'magmastream';

export default createCommand({
  name: 'queue',
  nameLocalizations: {
    'pt-BR': 'fila',
    'es-ES': 'fila',
    fr: 'file',
  },
  description: 'Mostrar a fila atual de músicas',
  descriptionLocalizations: {
    'en-US': 'Show the current music queue',
    'es-ES': 'Mostrar la cola de canciones actual',
    'en-GB': 'Show the current music queue',
    fr: 'Afficher la file d’attente musicale actuelle',
    ja: '現在の音楽キューを表示します',
  },
  type: ApplicationCommandType.ChatInput,

  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });
    const { guild, member } = interaction;
    const locale = getLocale(interaction.locale);

    if (!(member instanceof GuildMember)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.queue.errors.no_member_info'
        )}`,
      });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.queue.errors.not_in_voice'
        )}`,
      });
    }

    const player = interaction.client.music.players.get(guild.id);
    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.queue.errors.no_player'
        )}`,
      });
    }

    if (player.voiceChannelId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.queue.errors.different_voice_channel'
        )}`,
      });
    }
    if (!player.playing) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.stop.errors.no_player'
        )}`,
      });
    }

    const queue = player.queue;
    if (!queue || queue.size.length === 0) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.queue.errors.empty_queue'
        )}`,
      });
    }
    // buscar current + slice em paralelo para reduzir latency
    let currentTrack: any = null;
    let upcomingTracks: Track[] = [];

    const [currentRes, sliceRes] = await Promise.allSettled([
      queue.getCurrent(),
      queue.getSlice(0, 10),
    ]);

    if (currentRes.status === 'fulfilled') {
      currentTrack = currentRes.value ?? null;
    } else {
      logger.error(
        ck.red(`Falha ao obter a música atual: ${currentRes.reason}`)
      );
    }

    if (sliceRes.status === 'fulfilled') {
      upcomingTracks = Array.isArray(sliceRes.value) ? sliceRes.value : [];
    } else {
      logger.error(
        ck.red(`Falha ao obter próximas faixas: ${sliceRes.reason}`)
      );
    }

    // se não houver nada tocando e não houver próximas faixas, retorna mensagem de fila vazia
    const hasCurrent = !!currentTrack;
    const hasUpcoming = upcomingTracks && upcomingTracks.length > 0;
    if (!hasCurrent && !hasUpcoming) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.queue.errors.empty_queue'
        )}`,
      });
    }

    // normaliza a string exibida para a track (aceita strings, objetos Track, etc.)
    const trackToString = (tack: any) => {
      if (!tack) return '';
      if (typeof tack === 'string') return tack;
      if (tack.info && tack.info.title) {
        const author = tack.info.author ? ` — *${tack.info.author}*` : '';
        return `${tack.info.title}${author}`;
      }
      // fallback
      return String(tack);
    };

    const mappedTracks = upcomingTracks
      .map(
        (track: any, index: number) =>
          `**${index + 1}.** ${trackToString(track)}`
      )
      .join('\n');

    const embed = createEmbed({
      color: settings.colors.primary,
      author: createEmbedAuthor(interaction.user),
      title: `🎵 ${t(locale, 'commands.queue.success.title')}`,
      description: [
        currentTrack
          ? `🎶 **${t(
              locale,
              'commands.queue.fields.now_playing'
            )}:** ${currentTrack}`
          : `🎶 ${t(locale, 'commands.queue.fields.nothing_playing')}`,
        '',
        mappedTracks
          ? `📜 **${t(
              locale,
              'commands.queue.fields.next_tracks'
            )}:**\n${mappedTracks}`
          : `💤 ${t(locale, 'commands.queue.fields.no_next_tracks')}`,
      ].join('\n'),
      footer: {
        text: t(locale, 'commands.queue.fields.requested_by', {
          username: interaction.user.username,
        }),
      },
      timestamp: new Date(),
    });

    return interaction.editReply({ embeds: [embed] });
  },
});
