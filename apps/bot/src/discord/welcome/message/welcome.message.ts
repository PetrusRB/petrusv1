import { db } from '#database';
import { GuildMember, TextChannel } from 'discord.js';
import { logger } from '#settings';
import { settings } from '#settings';
import { createEmbed } from '@magicyan/discord';

export const SendWelcomeMessage = async (member: GuildMember) => {
  try {
    const guildId = member.guild.id;

    // buscar configuração do servidor
    const guildConfig = await db.guilds.findOne({ id: guildId });
    if (!guildConfig?.welcome?.message === true) {
      logger.warn`Não esta ativádo a enviar mensagem de boas vindas pro membro`;
      return;
    }
    if (!guildConfig?.canais?.bemvindo) {
      logger.warn`Canal de boas-vindas não configurado para o servidor ${member.guild.name}`;
      return;
    }

    const channelId = guildConfig.canais.bemvindo;
    const channel = member.guild.channels.cache.get(channelId) as TextChannel;

    if (!channel || !channel.isTextBased()) {
      logger.error`Canal ${channelId} não encontrado ou não é de texto no servidor ${member.guild.name}`;
      return;
    }

    const embed = createEmbed({
      title: `${settings.emojis.static.wave} Bem-vindo(a) ao servidor!`,
      color: settings.colors.yellow,
      description:
        `Olá ${member}, seja muito bem-vindo(a) a nossa querida comunidade!\n\n` +
        `Agora somos **${member.guild.memberCount}** membros!`,
      thumbnail: member.user.displayAvatarURL({ size: 256 }),
      timestamp: new Date(),
      footer: {
        text: `ID: ${member.id}`,
        iconURL: member.guild.iconURL() || undefined,
      },
    });

    await channel.send({
      content: `${member}`,
      embeds: [embed],
    });

    logger.success`Mensagem de boas-vindas enviada para ${member.user.tag}`;
    return true;
  } catch (error) {
    logger.error`Erro ao enviar mensagem de boas-vindas: ${error}`;
    return false;
  }
};
