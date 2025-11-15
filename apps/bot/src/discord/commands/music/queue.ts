import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';

export default createCommand({
  name: 'queue',
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

    if (player.voiceId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.queue.errors.different_voice_channel'
        )}`,
      });
    }

    const queue = player.queue;
    if (!queue || queue.size === 0) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.queue.errors.empty_queue'
        )}`,
      });
    }
    const currentTrack = player.queue.current; // faixa atual
    if (!currentTrack && queue.size === 0) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.queue.errors.empty_queue'
        )}`,
      });
    }

    const upcomingTracks = queue
      .slice(0, 10)
      .map(
        (track: any, index: number) =>
          `**${index + 1}.** ${track.info.title} — *${track.info.author}*`
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
        upcomingTracks
          ? `📜 **${t(
              locale,
              'commands.queue.fields.next_tracks'
            )}:**\n${upcomingTracks}`
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
