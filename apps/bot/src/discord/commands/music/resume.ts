import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';

export default createCommand({
  name: 'resume',
  description: 'Retomar a música pausada',
  descriptionLocalizations: {
    'en-US': 'Resume the paused song',
    'es-ES': 'Reanudar la canción pausada',
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
          'commands.resume.errors.no_member_info'
        )}`,
      });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.resume.errors.not_in_voice'
        )}`,
      });
    }

    const player = interaction.client.music.players.get(guild.id);
    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.resume.errors.no_player'
        )}`,
      });
    }

    if (player.voiceId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.resume.errors.different_voice_channel'
        )}`,
      });
    }

    if (!player.paused) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.resume.errors.not_paused'
        )}`,
      });
    }

    player.pause(false);

    const embed = createEmbed({
      color: settings.colors.success,
      author: createEmbedAuthor(interaction.user),
      title: `▶️ ${t(locale, 'commands.resume.success.title')}`,
      description: t(locale, 'commands.resume.success.description'),
      footer: {
        text: t(locale, 'commands.resume.fields.resumed_by', {
          username: interaction.user.username,
        }),
      },
      timestamp: new Date(),
    });

    return interaction.editReply({ embeds: [embed] });
  },
});
