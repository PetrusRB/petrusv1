import { createEvent } from '#base';
import { logger } from '#settings';
import { SendWelcomeMessage } from 'discord/welcome/message/welcome.message.js';
import { AddWelcomeRole } from 'discord/welcome/role/welcome.role.js';

createEvent({
  name: 'Join Handler',
  event: 'guildMemberAdd',
  async run(member) {
    try {
      if (member.user.id === member.client.user.id) {
        logger.warn`O novo membro é o petrus, ignorando...`;
        return;
      }
      logger.success`Novo membro entrou: ${member.user.tag} no servidor ${member.guild.name}`;

      // adiciona cargo de membro
      await AddWelcomeRole(member);

      // manda uma mensagem de boas vindas
      await SendWelcomeMessage(member);
    } catch (error) {
      logger.error`Erro no handler de entrada de membro: ${error}`;
    }
  },
});
