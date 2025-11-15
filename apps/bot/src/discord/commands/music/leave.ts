import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';
import { PlayerState } from 'kazagumo';

export default createCommand({
  name: 'leave',
  description: 'Disconecta o bot do canal de voz',
  descriptionLocalizations: {
    'en-US': 'Disconnect bot from voice channel',
    'es-ES': 'Desconectar el bot del canal de voz',
    'en-GB': 'Disconnect bot from voice channel',
    fr: 'Déconnecter le bot du canal vocal',
    ja: 'ボイスのチャンネルからボットを切断します',
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
          'commands.loop.errors.no_member_info'
        )}`,
      });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.loop.errors.not_in_voice'
        )}`,
      });
    }

    const player = interaction.client.music.players.get(guild.id);
    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.loop.errors.no_player'
        )}`,
      });
    }

    if (player.voiceId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.loop.errors.different_voice_channel'
        )}`,
      });
    }
    if (player.state !== PlayerState.CONNECTED) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.leave.errors.not_connected'
        )}`,
      });
    }
    player.disconnect();

    const embed = createEmbed({
      color: settings.colors.primary,
      author: createEmbedAuthor(interaction.user),
      title: `🔁 ${t(locale, 'commands.leave.success.title')}`,
      description: t(locale, 'commands.leave.success.description'),
      timestamp: new Date(),
    });

    return interaction.editReply({ embeds: [embed] });
  },
});
