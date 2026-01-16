import {
  ClusterManager,
  ReClusterManager,
  HeartbeatManager,
} from 'discord-hybrid-sharding';

import { Bridge, Client as BridgeClient } from 'discord-cross-hosting';
import { logger } from '#settings';
import { exec as ChildProcessExec } from 'child_process';

const botFile = `${process.cwd()}/src/clusters/cluster.client.ts`;

export const config = {
  token: process.env.BOT_TOKEN!,
  shardsPerCluster: 8,
  heartBeatInterval: 2000,
  totalShards: 1,
  bridgePort: 4444,
  bridgeAuth: process.env.BR_AUTH_TOKEN!,
};

export class Manager extends ClusterManager {
  bridgeServer: Bridge | null = null;
  bridgeClient: BridgeClient | null = null;

  constructor() {
    super(botFile, {
      token: config.token,
      totalShards: config.totalShards,
      shardsPerClusters: config.shardsPerCluster,
      mode: 'process',
      execArgv: Array.from(process.execArgv),
    });

    this.extend(
      new HeartbeatManager({
        interval: 2000, // Heartbeat a cada 2s
        maxMissedHeartbeats: 5, // Tolera 5 heartbeats perdidos
      })
    );
    // ReCluster somente em produção
    if (process.env.NODE_ENV === 'production') {
      this.extend(new ReClusterManager());
    }
    this.bindEvents();
    this.start();
  }
  bindEvents() {
    this.on('clusterCreate', (cluster) => {
      logger.log(`[MANAGER] Cluster ${cluster.id} criado.`);

      cluster.on('message', (msg) => {
        if (msg === 'cluster_ready') {
          logger.log(`[MANAGER] ✅ Cluster ${cluster.id} pronto`);
        }
      });

      cluster.on('error', (err) => {
        logger.error(`[MANAGER] ❌ Erro no Cluster ${cluster.id}:`);
        logger.error(err);
      });
    });

    this.on('debug', (msg) => logger.log(`[MANAGER] ${msg}`));
  }

  async start() {
    logger.log('[MANAGER] Iniciando Bridge Server...');
    await this.initBridgeServer();

    logger.log('[MANAGER] Iniciando Bridge Client...');
    await this.initBridgeClient();

    logger.log('[MANAGER] Iniciando Manager de stop...');
    this.listenStopManager();

    logger.log('[MANAGER] Spawn de clusters iniciado...');
    await this.spawn({ timeout: -1 });
  }

  async initBridgeServer() {
    this.bridgeServer = new Bridge({
      port: config.bridgePort,
      authToken: config.bridgeAuth,
      token: config.token,
      shardsPerCluster: config.shardsPerCluster,
      totalShards: config.totalShards,
      totalMachines: 1,
    });

    await this.bridgeServer.start();
    logger.log('[MANAGER] Bridge Server iniciado.');
  }

  async initBridgeClient() {
    this.bridgeClient = new BridgeClient({
      agent: 'bot',
      host: 'localhost',
      port: config.bridgePort,
      authToken: config.bridgeAuth,
      retries: 9999,
    });
    // @ts-ignore
    this.bridgeClient.on('debug', (d) => logger.log('[CLIENT]', d));
    this.bridgeClient.on('status', (status) =>
      logger.log(`[CLIENT] Status : ${status}`)
    );
    this.bridgeClient.on('close', (reason) =>
      logger.log('[CLIENT] Closed: ', String(reason))
    );
    this.bridgeClient.on('error', (error) => {
      logger.error('[CLIENT] Error: ');
      logger.error(String(error));
    });
    // @ts-ignore
    this.bridgeClient.listen(this);
    return this.bridgeClient.connect();
  }
  listenStopManager() {
    // terminate the program if needed
    ['SIGINT', 'SIGTERM', 'SIGUSR1', 'SIGUSR2'].forEach((signal) =>
      process.on(signal, () => {
        logger.log('Terminating main process...');
        process.exit();
      })
    );
    // terminate the childs if needed
    ['beforeExit', 'exit'].forEach((event) =>
      process.on(event, () => {
        logger.log('Terminating all the shard processes...');
        ChildProcessExec(`pkill -f "${botFile}" -SIGKILL`);
      })
    );
    return true;
  }
}
