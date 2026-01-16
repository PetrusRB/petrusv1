import { createEvent } from '#base';
import { db } from '#database';
import { logger } from '#settings';
import { DMChannel, GuildChannel } from 'discord.js';

export default createEvent({
  name: 'Channel Delete',
  event: 'channelDelete',
  async run(channel) {
    try {
      // Ignora canais DM
      if (channel instanceof DMChannel || !channel.guild) {
        return;
      }

      const guildChannel = channel as GuildChannel;
      const guildId = guildChannel.guild.id;
      const channelId = guildChannel.id;

      // Carrega os dados da guild
      const guildData = await db.guilds.get(guildId);

      // Verifica se é o canal de verificação
      const isVerificationChannel = guildData.canais?.verificado === channelId;

      if (!isVerificationChannel) {
        // Não é o canal de verificação, não faz nada
        return;
      }

      // Limpa os dados de verificação apenas se necessário
      const needsUpdate =
        guildData.canais?.verificado ||
        guildData.verification?.channelId ||
        guildData.verification?.messageId;

      if (needsUpdate) {
        await db.guilds.updateOne(
          { _id: guildData._id },
          {
            $set: {
              'canais.verificado': '',
              'verification.channelId': '',
              'verification.messageId': '',
            },
          }
        );

        logger.log(
          `[ChannelDelete] Canal de verificação deletado na guild ${guildChannel.guild.name} (${guildId})`
        );
      }
    } catch (error) {
      logger.error(
        '[ChannelDelete] Erro ao processar deleção de canal:',
        error
      );
    }
  },
});
