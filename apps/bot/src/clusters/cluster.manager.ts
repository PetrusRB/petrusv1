import {
  ClusterManager,
  ReClusterManager,
  HeartbeatManager,
} from 'discord-hybrid-sharding';

import { Bridge, Client as BridgeClient } from 'discord-cross-hosting';
import { logger } from '#settings';

const botFile = `${process.cwd()}/src/clusters/cluster.client.ts`;

export const config = {
  token: process.env.BOT_TOKEN!,
  shardsPerCluster: 8,
  heartBeatInterval: 2000,

  bridgePort: 4444,
  bridgeAuth: process.env.BR_AUTH_TOKEN!,
};

export class Manager extends ClusterManager {
  bridgeServer: Bridge | null = null;
  bridgeClient: BridgeClient | null = null;

  constructor() {
    super(botFile, {
      token: config.token,
      totalShards: 'auto',
      shardsPerClusters: config.shardsPerCluster,
      mode: 'process',
      execArgv: Array.from(process.execArgv),
    });

    this.extend(new ReClusterManager());
    this.extend(
      new HeartbeatManager({
        interval: 2000, // Heartbeat a cada 2s
        maxMissedHeartbeats: 5, // Tolera 5 heartbeats perdidos
      })
    );
    this.on('clusterCreate', (cluster) => {
      logger.log(`[MANAGER] Cluster ${cluster.id} criado`);

      cluster.on('message', (message) => {
        if (message === 'cluster_ready') {
          logger.log(`[MANAGER] ✅ Cluster ${cluster.id} pronto`);
        }
      });

      cluster.on('error', (error) => {
        logger.error(`[MANAGER] ❌ Erro no Cluster ${cluster.id}:`, error);
      });
    });

    this.on('debug', (msg) => console.log('[MANAGER]', msg));

    this.start();
  }

  async start() {
    await this.initBridgeServer();
    await this.initBridgeClient();
    await this.spawn({ timeout: -1 });
  }

  async initBridgeServer() {
    this.bridgeServer = new Bridge({
      port: config.bridgePort,
      authToken: config.bridgeAuth,
      token: config.token,
      shardsPerCluster: config.shardsPerCluster,
      totalShards: 'auto',
      totalMachines: 1,
    });

    return this.bridgeServer.start();
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
}
