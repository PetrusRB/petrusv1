import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import { bootstrap } from '#base';
import { GatewayIntentBits } from 'discord.js';
import path from 'node:path';
import {
  initializeMusicManager,
  setupMusicManager,
} from 'discord/managers/music/music.manager.js';
import { logger } from '#settings';

const info = getInfo();
await bootstrap({
  meta: {
    ...import.meta,
    dirname: path.dirname(import.meta.dirname),
  },

  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
  directories: ['discord'],

  async beforeLoad(c) {
    const manager = setupMusicManager(c);
    c.music = manager;
    c.cluster = new ClusterClient(c);
    c.searchCache = new Map<
      string,
      { tracks: any[]; expires: number; guildId?: string; userId?: string }
    >();

    c.on('raw', (packet: any) => {
      if (['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(packet.t)) {
        c.music?.updateVoiceState?.(packet);
      }
    });

    Object.assign(c, { manager });
  },

  async whenReady(c) {
    initializeMusicManager(c);
    console.log(`Cluster ${info.CLUSTER} → pronto como ${c.user?.username}`);
  },
});
