import { bootstrap } from '#base';

import { GatewayIntentBits } from 'discord.js';
import {
  initializeMusicManager,
  setupMusicManager,
} from 'discord/managers/music/music.manager.js';
await bootstrap({
  meta: import.meta,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
  async beforeLoad(client) {
    const manager = setupMusicManager(client);
    initializeMusicManager();
    client.music = manager;

    Object.assign(client, { manager });
  },
});
