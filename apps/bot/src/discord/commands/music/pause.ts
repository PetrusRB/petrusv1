import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';

export default createCommand({
  name: 'pause',
  description: 'Pausar a música atual',
  descriptionLocalizations: {
    'en-US': 'Pause the current song',
    'en-GB': 'Pause the current song',
    'es-ES': 'Pausar la canción actual',
    fr: 'Mettre en pause la musique actuelle',
    ja: '現在の音楽を一時停止',
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
          'commands.pause.errors.no_member_info'
        )}`,
      });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.pause.errors.not_in_voice'
        )}`,
      });
    }

    const player = interaction.client.music.players.get(guild.id);
    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.pause.errors.no_player'
        )}`,
      });
    }

    if (player.voiceId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.pause.errors.different_voice_channel'
        )}`,
      });
    }

    if (player.paused) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.pause.errors.already_paused'
        )}`,
      });
    }

    player.pause(true);

    const embed = createEmbed({
      color: settings.colors.warning,
      author: createEmbedAuthor(interaction.user),
      title: `⏸️ ${t(locale, 'commands.pause.success.title')}`,
      description: t(locale, 'commands.pause.success.description'),
      footer: {
        text: t(locale, 'commands.pause.fields.paused_by', {
          username: interaction.user.username,
        }),
      },
      timestamp: new Date(),
    });

    return interaction.editReply({ embeds: [embed] });
  },
});
