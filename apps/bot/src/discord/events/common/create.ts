import { createEvent } from '#base';
import { db } from '#database';
import { logger } from '#settings';

export default createEvent({
  name: 'Guild Create Handler',
  event: 'guildCreate',
  async run(guild) {
    try {
      // criar ou buscar documento do servidor
      await db.guilds.get(guild.id);
      logger.success`Bot adicionado ao servidor: ${guild.name}`;
    } catch (error) {
      logger.error`Erro ao criar documento do servidor: ${error}`;
    }
  },
});
