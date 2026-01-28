import { createEvent } from '#base';
import { logger } from '#settings';
import { ActivityType } from 'discord.js';
import { initializeDatabase } from '#database';
import { getInfo } from 'discord-hybrid-sharding';

createEvent({
  name: 'Ready Handler',
  event: 'ready',
  async run(client) {
    const info = getInfo();

    client.user.setPresence({
      activities: [
        {
          name: `Cluster ${info.CLUSTER} Shards ${info.SHARD_LIST.join(
            ','
          )} / ${info.TOTAL_SHARDS}`,
          type: ActivityType.Watching,
        },
        {
          name: `/ajuda para mais comandos`,
          type: ActivityType.Custom,
        },
      ],
      status: 'idle',
    });
    const dbStarted = initializeDatabase();
    if (!dbStarted) {
      logger.error('Database not started');
      return;
    }

    logger.success(`Logged in as ${client.user.tag} 🤖`);
  },
});
