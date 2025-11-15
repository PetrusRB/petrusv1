import { logger } from '#settings';
import { Client } from 'discord.js';
import Spotify from 'kazagumo-spotify';

import { Kazagumo, KazagumoOptions } from 'kazagumo';
import { Connectors } from 'shoukaku';

// Singleton - garante que só existe uma instância
let managerInstance: Kazagumo | null = null;
let isInitialized = false;

export function getMusicManager(): Kazagumo {
  if (!managerInstance) {
    throw new Error(
      '[MusicManager] Manager não foi criado ainda! Chame setupMusicManager() primeiro.'
    );
  }
  return managerInstance;
}

export function isMusicManagerReady(): boolean {
  return isInitialized && managerInstance !== null;
}

export function setupMusicManager(client: Client): Kazagumo {
  // Se já existe, retorna a instância existente
  if (managerInstance) {
    console.log('[MusicManager] ⚠️ Manager já existe, reutilizando...');
    return managerInstance;
  }

  console.log('[MusicManager] 🎵 Criando novo manager...');

  const nodes = [
    {
      name: 'Principal',
      url: `${process.env.LAVA_HOST ?? 'localhost:2333'}`,
      auth: process.env.LAVA_PASS ?? 'youshallnotpass',
      secure: process.env.LAVA_SECURE === 'true',
    },
  ];

  managerInstance = new Kazagumo(
    {
      defaultSearchEngine: 'youtube',
      send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      },
      plugins: [
        new Spotify({
          clientId: process.env.SPOTIFY_CLIENT_ID!,
          clientSecret: process.env.SPOTIFY_SECRET_ID!,
          playlistPageLimit: 1,
          albumPageLimit: 1,
        }),
      ],
    } as KazagumoOptions,
    new Connectors.DiscordJS(client),
    nodes
  );

  // Configurar eventos
  setupEvents(managerInstance);

  console.log('[MusicManager] ✅ Manager criado com sucesso');
  return managerInstance;
}

export function initializeMusicManager(): void {
  if (!managerInstance) {
    throw new Error(
      '[MusicManager] Manager não foi criado! Chame setupMusicManager() primeiro.'
    );
  }

  if (isInitialized) {
    console.log('[MusicManager] ⚠️ Manager já foi inicializado');
    return;
  }

  console.log('[MusicManager] 🚀 Inicializando manager...');
  managerInstance.search = managerInstance.search.bind(managerInstance);
  isInitialized = true;
  console.log('[MusicManager] ✅ Manager inicializado');
}

function setupEvents(manager: Kazagumo): void {
  manager.shoukaku.on('ready', (name) => {
    logger.log(`✅ Node ${name || 'Desonhecido'} conectado`);
  });

  manager.shoukaku.on('disconnect', (name) => {
    const players = [...manager.shoukaku.players.values()].filter(
      (p) => p.node.name === name
    );
    players.map((player) => {
      manager.destroyPlayer(player.guildId);
      player.destroy();
    });
    console.warn(`Lavalink ${name}: Disconnected`);
  });
  manager.shoukaku.on('close', (name, code, reason) => {
    logger.error(
      `❌ Node ${name} está fechado, CÓDIGO ${code} CAUSADO por ${reason}`
    );
  });

  manager.shoukaku.on('error', (name, error) => {
    logger.error(`❌ Erro no node ${name || 'Desonhecido'}:`, error);
  });

  manager.on('playerStart', (player, track) => {
    logger.log(`▶️ Tocando: ${track.title} (Guild: ${player.guildId})`);
  });

  manager.on('playerEnd', () => {
    logger.log(`⏹️ Música Finalizada`);
  });

  manager.on('playerResolveError', (player, track, message) => {
    logger.error(
      `❌ Erro na música ${track.title || 'Desconhecido'}:`,
      message
    );
  });

  manager.on('playerEmpty', (player) => {
    console.log(`📭 Fila vazia: ${player.guildId}`);
    setTimeout(() => {
      const p = manager.players.get(player.guildId);
      if (p && (!p.queue || p.queue.size === 0)) {
        console.log(`🗑️ Destruindo player: ${player.guildId}`);
        manager.destroyPlayer(player.guildId);
      }
    }, 300000);
  });
}
