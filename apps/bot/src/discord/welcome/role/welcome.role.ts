import { db } from '#database';
import { GuildMember } from 'discord.js';
import { logger } from '#settings';
export const AddWelcomeRole = async (member: GuildMember) => {
  try {
    const guildId = member.guild.id;

    // Buscar configuração do servidor
    const guildConfig = await db.guilds.findOne({ id: guildId });

    if (!guildConfig?.welcome?.role === true) {
      logger.warn`Não esta ativádo a colocar cargo de membro quando entra`;
      return;
    }
    if (!guildConfig?.cargos?.membro) {
      logger.warn`Cargo de membro não configurado para o servidor ${member.guild.name}`;
      return;
    }

    const roleId = guildConfig.cargos.membro;
    const role = member.guild.roles.cache.get(roleId);

    if (!role) {
      logger.error`Cargo ${roleId} não encontrado no servidor ${member.guild.name}`;
      return;
    }

    // Adicionar o cargo ao membro
    await member.roles.add(role);
    logger.success`Cargo ${role.name} adicionado ao membro ${member.user.tag}`;

    return true;
  } catch (error) {
    logger.error`Erro ao adicionar cargo de boas-vindas: ${error}`;
    return false;
  }
};
