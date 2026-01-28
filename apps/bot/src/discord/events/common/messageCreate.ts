import { createEvent } from '#base';
import { logger } from '#settings';
import { modulos } from 'discord/modules/index.ts';
import { Message } from 'discord.js';

createEvent({
  name: 'Message Send Handler',
  event: 'messageCreate',

  async run(message: Message) {
    if (!message.guild || message.author.bot) return;

    for (const module of modulos) {
      if (typeof module.handleMessage !== 'function') continue;

      try {
        await module.handleMessage(message);
      } catch (err) {
        logger.error(`[MessageHandler] Erro no módulo ${module.id}:`, err);
      }
    }
  },
});
