import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import {
  GuildMember,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from 'discord.js';
import { t, getLocale } from 'i18n/index.js';

export default createCommand({
  name: 'volume',
  description: 'Ajustar o volume da música atual',
  descriptionLocalizations: {
    'en-US': 'Adjust the current song volume',
    'es-ES': 'Ajustar el volumen de la canción actual',
    'en-GB': 'Adjust the current song volume',
    fr: 'Ajuster le volume de la chanson en cours',
    ja: '現在の曲の音量を調整します',
  },
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'level',
      description: 'Volume (0–100)',
      descriptionLocalizations: {
        'en-US': 'Volume (0–100)',
        'es-ES': 'Volumen (0–100)',
        fr: 'Volume (0–100)',
        ja: '音量 (0–100)',
      },
      type: ApplicationCommandOptionType.Integer,
      minValue: 0,
      maxValue: 100,
      required: true,
    },
  ],

  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });
    const { guild, member } = interaction;
    const locale = getLocale(interaction.locale);

    // verifica se é membro válido
    if (!(member instanceof GuildMember)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.volume.errors.no_member_info'
        )}`,
      });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.volume.errors.not_in_voice'
        )}`,
      });
    }

    const player = interaction.client.music.players.get(guild.id);
    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.volume.errors.no_player'
        )}`,
      });
    }

    if (player.voiceId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.volume.errors.different_voice_channel'
        )}`,
      });
    }

    const level = interaction.options.getInteger('level', true);

    if (level < 0 || level > 100) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.volume.errors.invalid_volume'
        )}`,
      });
    }

    try {
      // define o volume no player
      player.setVolume(level);

      const embed = createEmbed({
        color: settings.colors.primary,
        author: createEmbedAuthor(interaction.user),
        title: `🔊 ${t(locale, 'commands.volume.success.title')}`,
        description: t(locale, 'commands.volume.success.description', {
          volume: level,
        }),
        footer: {
          text: t(locale, 'commands.volume.fields.changed_by', {
            username: interaction.user.username,
          }),
        },
        timestamp: new Date(),
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.volume.errors.generic_error'
        )}`,
      });
    }
  },
});
