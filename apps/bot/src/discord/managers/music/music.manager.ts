import { logger } from '#settings';
import { Client } from 'discord.js';
import {
  AutoPlayPlatform,
  Manager,
  ManagerEventTypes,
  Node,
  NodeOptions,
  SearchPlatform,
  TrackPartial,
} from 'magmastream';

// Singleton - garante que só existe uma instância
let managerInstance: Manager | null = null;
let isInitialized = false;

export function getMusicManager(): Manager {
  if (!managerInstance) {
    throw new Error(
      '[MusicManager] manager não foi criado ainda! precisa ser chamada setupMusicManager() primeiro.'
    );
  }
  return managerInstance;
}

export function isMusicManagerReady(): boolean {
  return isInitialized && managerInstance !== null;
}

export function setupMusicManager(client: Client): Manager {
  // Se já existe, retorna a instância existente
  if (managerInstance) {
    console.log('[MusicManager] ⚠️ Manager já existe, reutilizando...');
    return managerInstance;
  }

  console.log('[MusicManager] 🎵 Criando novo manager...');

  const nodes: NodeOptions[] = [
    {
      host: process.env.LAVA_HOST || 'owo',
      identifier: 'Principal',
      password: process.env.LAVA_PASS || 'youhallpassword',
      port: parseInt(process.env.LAVA_PORT || '2333'),
      useSSL: process.env.LAVA_SECURE === 'true',
      maxRetryAttempts: 500,
      retryDelayMs: 300000,
      enableSessionResumeOption: true,
      sessionTimeoutSeconds: 300,
      apiRequestTimeoutMs: 20000,
    },
    {
      host: process.env.LAVA_TEST_HOST || 'owo',
      identifier: 'Segundo',
      password: process.env.LAVA_TEST_PASS || 'amogus',
      port: parseInt(process.env.LAVA_TEST_PORT || '2333'),
      useSSL: process.env.LAVA_TEST_SECURE === 'true',
      maxRetryAttempts: 500,
      retryDelayMs: 300000,
      enableSessionResumeOption: true,
      sessionTimeoutSeconds: 300,
      apiRequestTimeoutMs: 20000,
    },
    {
      host: process.env.LAVA_TREE_HOST || 'owo',
      identifier: 'Terceiro',
      password: process.env.LAVA_TREE_PASS || 'youhallpassword',
      port: parseInt(process.env.LAVA_TREE_PORT || '2333'),
      useSSL: process.env.LAVA_TREE_SECURE === 'true',
      maxRetryAttempts: 500,
      retryDelayMs: 300000,
      enableSessionResumeOption: true,
      sessionTimeoutSeconds: 300,
      apiRequestTimeoutMs: 20000,
    },
  ];

  managerInstance = new Manager({
    playNextOnEnd: true,
    enablePriorityMode: false,
    normalizeYouTubeTitles: true,
    clientName: 'Petrus',
    trackPartial: [
      TrackPartial.Author,
      TrackPartial.ArtworkUrl,
      TrackPartial.Duration,
      TrackPartial.Identifier,
      TrackPartial.PluginInfo,
      TrackPartial.Requester,
      TrackPartial.SourceName,
      TrackPartial.Title,
      TrackPartial.Track,
      TrackPartial.Uri,
    ],
    defaultSearchPlatform: SearchPlatform.Spotify,
    autoPlaySearchPlatforms: [
      AutoPlayPlatform.Spotify,
      AutoPlayPlatform.Deezer,
      AutoPlayPlatform.SoundCloud,
      AutoPlayPlatform.Tidal,
    ],
    nodes,
    send: (packet) => {
      const guild = client.guilds.cache.get(packet.d.guild_id);
      if (guild) guild.shard.send(packet);
    },
  });

  // Configurar eventos
  setupEvents(managerInstance);

  console.log('[MusicManager] ✅ Manager criado com sucesso');
  return managerInstance;
}

export function initializeMusicManager(client: Client): void {
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
  managerInstance.init({ clientId: client.user?.id });
  isInitialized = true;
  console.log('[MusicManager] ✅ Manager inicializado');
}

function setupEvents(manager: Manager): void {
  // ─────────────────────────────────────────
  // Eventos Node
  // ─────────────────────────────────────────
  manager.on(ManagerEventTypes.NodeConnect, (node) => {
    logger.log(
      `✅ Node ${node.options.identifier || 'Desconhecido'} conectado`
    );
    isInitialized = true;
  });

  manager.on(ManagerEventTypes.NodeError, (node, error) => {
    logger.error(
      `❌ Erro no node ${node.options.identifier || 'Desconhecido'}:`
    );
    console.error('Detalhes completos:', error);
  });

  manager.on(ManagerEventTypes.NodeDisconnect, (node, reason) => {
    logger.error(`⚠️ Node ${node.options.identifier} desconectado:`, reason);
  });
  manager.on(ManagerEventTypes.NodeDestroy, (node: Node) => {
    logger.error(
      `❌ Node ${node.options?.identifier || 'Desconhecido'} foi destruido`
    );
  });
  // ─────────────────────────────────────────
  // Eventos Player
  // ─────────────────────────────────────────
  manager.on(ManagerEventTypes.TrackStart, (player, track) => {
    logger.log(`▶️ Tocando: ${track.title} (Guild: ${player.guildId})`);
  });

  manager.on(ManagerEventTypes.TrackEnd, async () => {
    logger.log(`⏹️ Música Finalizada`);
  });

  manager.on(ManagerEventTypes.QueueEnd, async (player) => {
    console.log(`📭 Fila vazia: ${player.guildId}`);

    // Loop desligado → finalizar
    if (!player.queueRepeat) {
      console.log(`❌ QueueRepeat OFF — fila não será reiniciada`);
      return;
    }

    // Recuperar fila anterior
    const previousSongs = await player.queue.getPrevious().catch(() => null);

    if (!previousSongs || previousSongs.length === 0) {
      console.log(`❌ Nenhuma previous queue encontrada para repetir`);
      return;
    }

    // Repor a fila
    await player.queue.add([...previousSongs]);
    console.log(
      `🔁 QueueRepeat ON — fila reiniciada (${previousSongs.length} músicas)`
    );

    await player.play();
  });
}
