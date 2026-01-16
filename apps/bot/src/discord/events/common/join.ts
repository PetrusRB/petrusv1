import { createEvent } from '#base';
import { db } from '#database';
import { logger } from '#settings';
import { GuildMember } from 'discord.js';
import { Verification } from 'discord/modules/verification/verify.module.ts';
import { SendWelcomeMessage } from 'discord/welcome/message/welcome.message.js';
import { AddWelcomeRole } from 'discord/welcome/role/welcome.role.js';

const verificationLogic = async (
  member: GuildMember,
  guildData: any
): Promise<void> => {
  try {
    logger.log(`[Verification] Iniciando verificação para ${member.user.tag}`);

    // Verifica se o módulo está ativado
    if (!guildData.modules?.verification) {
      logger.log(`[Verification] Sistema desabilitado em ${member.guild.name}`);
      return;
    }

    const unverifiedRoleId = guildData.cargos?.naoverificado;
    const memberRoleId = guildData.cargos?.membro;

    if (!unverifiedRoleId) {
      logger.error(
        `[Verification] Cargo de não verificado não configurado em ${member.guild.name}`
      );
      return;
    }

    logger.log(`[Verification] Cargo não verificado ID: ${unverifiedRoleId}`);

    // Verifica se o cargo existe no servidor
    const unverifiedRole = member.guild.roles.cache.get(unverifiedRoleId);
    if (!unverifiedRole) {
      logger.error(
        `[Verification] Cargo não encontrado no servidor! ID: ${unverifiedRoleId}`
      );
      return;
    }

    logger.log(`[Verification] Cargo encontrado: ${unverifiedRole.name}`);

    // Verifica permissões do bot
    const botMember = member.guild.members.me;
    if (!botMember?.permissions.has('ManageRoles')) {
      logger.error(
        `[Verification] Bot não tem permissão de gerenciar cargos em ${member.guild.name}`
      );
      return;
    }

    // Verifica hierarquia de cargos
    if (unverifiedRole.position >= botMember.roles.highest.position) {
      logger.error(
        `[Verification] Cargo "${unverifiedRole.name}" está acima do cargo do bot!`
      );
      return;
    }

    // Verifica se o membro já tem algum dos cargos
    const hasUnverifiedRole = member.roles.cache.has(unverifiedRoleId);
    const hasMemberRole = memberRoleId
      ? member.roles.cache.has(memberRoleId)
      : false;

    logger.log(
      `[Verification] Status - Não verificado: ${hasUnverifiedRole}, Verificado: ${hasMemberRole}`
    );

    // Se já tem cargo de membro, não aplica o de não verificado
    if (hasMemberRole) {
      logger.log(
        `[Verification] ${member.user.tag} já está verificado, pulando...`
      );
      return;
    }

    // Se já tem cargo de não verificado, não faz nada
    if (hasUnverifiedRole) {
      logger.log(
        `[Verification] ${member.user.tag} já tem cargo de não verificado`
      );
      return;
    }

    // Aplica o cargo de não verificado
    logger.log(`[Verification] Aplicando cargo de não verificado...`);
    const verification = new Verification();
    const success = await verification.applyUnverified(
      member,
      unverifiedRoleId
    );

    if (success) {
      logger.log(
        `[Verification] ✅ ${member.user.tag} marcado como não verificado`
      );
    } else {
      logger.error(
        `[Verification] ❌ Falha ao marcar ${member.user.tag} como não verificado`
      );
    }
  } catch (error) {
    logger.error(`[Verification] Erro na lógica de verificação:`, error);
  }
};

const welcomeLogic = async (
  member: GuildMember,
  guildData: any
): Promise<void> => {
  try {
    if (member.user.id === member.client.user.id) {
      logger.log(`[Welcome] O novo membro é o petrus, ignorando...`);
      return;
    }

    logger.log(
      `[Welcome] Novo membro entrou: ${member.user.tag} no servidor ${member.guild.name}`
    );

    // Só adiciona cargo se verificação NÃO estiver ativa
    if (!guildData.modules?.verification) {
      await AddWelcomeRole(member);
    }

    // Manda uma mensagem de boas vindas
    await SendWelcomeMessage(member);

    logger.log(
      `[Welcome] ✅ Processo de boas-vindas concluído para ${member.user.tag}`
    );
  } catch (error) {
    logger.error(`[Welcome] Erro na lógica de boas-vindas:`, error);
  }
};

createEvent({
  name: 'Join Handler',
  event: 'guildMemberAdd',
  async run(member) {
    try {
      logger.log(`[JoinHandler] 🔔 Evento disparado para ${member.user.tag}`);

      // Ignora bots
      if (member.user.bot) {
        logger.log(`[JoinHandler] Bot detectado, ignorando...`);
        return;
      }
      const guildData = await db.guilds.get(member.guild.id);

      // chama as funções lógicas.
      await Promise.allSettled([
        verificationLogic(member, guildData),
        welcomeLogic(member, guildData),
      ]);

      logger.log(
        `[JoinHandler] ✅ Processamento completo para ${member.user.tag}`
      );
    } catch (error) {
      logger.error(
        `[JoinHandler] Erro no handler de entrada de membro:`,
        error
      );
    }
  },
});
