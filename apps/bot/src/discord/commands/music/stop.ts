import { createCommand } from '#base';
import { logger, settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember } from 'discord.js';
import { ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';

export default createCommand({
  name: 'stop',
  nameLocalizations: {
    'pt-BR': 'parar',
    'es-ES': 'detener',
    fr: 'arrêter',
  },
  description: 'Parar a música e limpar a fila',
  descriptionLocalizations: {
    'en-US': 'Stop the music and clear the queue',
    'en-GB': 'Stop the music and clear the queue',
    'es-ES': 'Para música y despejar la línea',
    fr: 'Pour la musique et dégager la ligne',
    ja: '音楽のために、そしてラインをクリアしてください',
  },
  type: ApplicationCommandType.ChatInput,

  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });
    const { guild, member, client } = interaction;
    const locale = getLocale(interaction.locale);

    // Verificar se o membro está em um GuildMember
    if (!(member instanceof GuildMember)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.stop.errors.no_member_info'
        )}`,
      });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.stop.errors.not_in_voice'
        )}`,
      });
    }

    // Verificar se existe um player ativo
    const player = client.music.players.get(guild.id);
    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.stop.errors.no_player'
        )}`,
      });
    }

    // Verificar se o bot está no mesmo canal de voz que o usuário
    if (player.voiceChannelId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.stop.errors.different_voice_channel'
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

    try {
      // Limpar a fila e destruir o player
      if (player.queueRepeat) player.setQueueRepeat(false);
      if (player.trackRepeat) player.setTrackRepeat(false);
      player.queue.clear();
      player.stop();

      const embed = createEmbed({
        color: settings.colors.success,
        author: createEmbedAuthor(interaction.user),
        title: `⏹️ ${t(locale, 'commands.stop.success.title')}`,
        description: t(locale, 'commands.stop.success.description'),
        footer: {
          text: t(locale, 'commands.stop.fields.stopped_by', {
            username: interaction.user.username,
          }),
        },
        timestamp: new Date(),
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error('Erro ao parar música:', error);
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.stop.errors.generic_error'
        )}`,
      });
    }
  },
});
