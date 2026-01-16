import { createCommand } from '#base';
import { logger, settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';

export default createCommand({
  name: 'shuffle',
  nameLocalizations: {
    'pt-BR': 'embaralhar',
    'es-ES': 'barajar',
    fr: 'mélanger',
  },
  description: 'Embaralhar a fila de músicas',
  descriptionLocalizations: {
    'en-US': 'Shuffle the music queue',
    'es-ES': 'Mezclar la cola de canciones',
    'en-GB': 'Shuffle the music queue',
    fr: "Mélangez la file d'attente des chansons",
    ja: '曲のキューをシャッフルします',
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
          'commands.shuffle.errors.no_member_info'
        )}`,
      });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.shuffle.errors.not_in_voice'
        )}`,
      });
    }

    const player = interaction.client.music.players.get(guild.id);
    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.shuffle.errors.no_player'
        )}`,
      });
    }

    if (player.voiceChannelId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.shuffle.errors.different_voice_channel'
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

    // Verifica se há algo na fila para embaralhar
    const queue = player.queue ?? [];
    if (!queue || queue.size.length === 0) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.shuffle.errors.empty_queue'
        )}`,
      });
    }

    try {
      // Embaralhar a fila
      player.queue.shuffle();
      const embed = createEmbed({
        color: settings.colors.success,
        author: createEmbedAuthor(interaction.user),
        title: `🔀 ${t(locale, 'commands.shuffle.success.title')}`,
        description: t(locale, 'commands.shuffle.success.description'),
        footer: {
          text: t(locale, 'commands.shuffle.fields.shuffled_by', {
            username: interaction.user.username,
          }),
        },
        timestamp: new Date(),
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      // se houver um e retorna a mensagem genérica.
      logger.error(err);
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.shuffle.errors.generic_error'
        )}`,
      });
    }
  },
});
