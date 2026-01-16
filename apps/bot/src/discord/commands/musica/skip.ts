import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';

export default createCommand({
  name: 'skip',
  nameLocalizations: {
    'pt-BR': 'pular',
    'es-ES': 'saltar',
    fr: 'passer',
  },
  description: 'Pular a música atual',
  descriptionLocalizations: {
    'en-US': 'Skip the current song',
    'es-ES': 'Saltar la canción actual',
    'en-GB': 'Skip the current song',
    fr: 'Sauter la chanson en cours',
    ja: '現在の曲をスキップします',
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
          'commands.skip.errors.no_member_info'
        )}`,
      });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.skip.errors.not_in_voice'
        )}`,
      });
    }

    const player = interaction.client.music.players.get(guild.id);

    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.skip.errors.no_player'
        )}`,
      });
    }

    if (player.voiceChannelId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.skip.errors.different_voice_channel'
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

    const currentTrack = await player.queue.getCurrent().catch(() => null);

    if (!currentTrack) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.skip.errors.no_track'
        )}`,
      });
    }

    player.stop();

    const embed = createEmbed({
      color: settings.colors.primary,
      author: createEmbedAuthor(interaction.user),
      title: `⏭️ ${t(locale, 'commands.skip.success.title')}`,
      description: t(locale, 'commands.skip.success.description', {
        track: currentTrack.title,
      }),
      footer: {
        text: t(locale, 'commands.skip.fields.skipped_by', {
          username: interaction.user.username,
        }),
      },
      timestamp: new Date(),
    });

    return interaction.editReply({ embeds: [embed] });
  },
});
