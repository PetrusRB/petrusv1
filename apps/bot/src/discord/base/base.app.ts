import { baseErrorHandler, env, logger } from '#settings';
import { Client, ClientOptions, version as djsVersion } from 'discord.js';
import { CustomItents, CustomPartials } from '@magicyan/discord';
import {
  baseAutocompleteHandler,
  baseCommandHandler,
  baseRegisterCommands,
} from './base.command.js';
import { baseStorage } from './base.storage.js';
import { baseRegisterEvents } from './base.event.js';
import { baseResponderHandler } from './base.responder.js';
import { BASE_VERSION, runtimeDisplay } from './base.version.js';
import ck from 'chalk';
import glob from 'fast-glob';
import { getInfo } from 'discord-hybrid-sharding';

interface BootstrapOptions extends Partial<ClientOptions> {
  meta: ImportMeta;
  /**
   * A list of paths that will be imported to load the project's structure classes
   *
   * The paths are relative to the **workdir** folder
   */
  directories?: string[];
  /** Send load logs in terminal */
  loadLogs?: boolean;
  /** Run before load directories */
  beforeLoad?(client: Client): void;
  /** Run when client is ready */
  whenReady?(client: Client<true>): void;
}
export async function bootstrap(options: BootstrapOptions) {
  const client = createClient(env.BOT_TOKEN, options);
  options.beforeLoad?.(client);

  console.log('[DEBUG] Workdir usado:', options.meta.dirname);
  await loadModules(options.meta.dirname, options.directories);

  if (options.loadLogs ?? true) {
    loadLogs();
  }
  logger.log();
  logger.log(ck.blue(`★ Petrus Base ${ck.reset.dim(BASE_VERSION)}`));
  logger.log(
    `${ck.hex('#fbe72b')('◌ discord.js')} ${ck.dim(djsVersion)}`,
    '|',
    runtimeDisplay
  );

  baseRegisterEvents(client);

  client.login();

  return { client };
}

async function loadModules(workdir: string, directories: string[] = []) {
  const pattern = '**/*.{js,ts,jsx,tsx}';
  const files = await glob(
    [
      `!./discord/index.*`,
      `!./discord/base/**/*`,
      `./discord/${pattern}`,
      directories.map((path) => `./${path.replaceAll('\\', '/')}/${pattern}`),
    ].flat(),
    { absolute: true, cwd: workdir }
  );

  await Promise.all(files.map((path) => import(`file://${path}`)));
}

function createClient(token: string, options: BootstrapOptions) {
  const client = new Client({
    intents: options.intents ?? CustomItents.All,
    shards: getInfo().SHARD_LIST,
    shardCount: getInfo().TOTAL_SHARDS,
    partials: options.partials ?? CustomPartials.All,
    failIfNotExists: options.failIfNotExists ?? false,
  });
  client.token = token;

  client.on('ready', async (client) => {
    registerErrorHandlers(client);

    await client.guilds.fetch().catch(() => null);

    const clusterId = client.cluster?.id ?? 0;
    const totalClusters = getInfo().CLUSTER_COUNT ?? 1;

    logger.log(
      ck.green`● ${ck.greenBright.underline(client.user.username)} online ✓` +
        ck.dim` [Cluster ${clusterId}/${totalClusters - 1}]`
    );

    // adiciona delay antes de registrar comandos
    // isso garante que todos os clusters estejam prontos (espero que sim)
    if (clusterId === 0) {
      const delayMs = Math.min(totalClusters * 2000, 10000); // Max 10s
      logger.log(
        ck.cyan(
          `[Cluster ${clusterId}] Aguardando ${delayMs}ms para sincronizar clusters...`
        )
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await baseRegisterCommands(client);
    }

    if (options.whenReady) {
      options.whenReady(client);
    }
  });
  client.on('interactionCreate', async (interaction) => {
    switch (true) {
      case interaction.isAutocomplete(): {
        baseAutocompleteHandler(interaction);
        return;
      }
      case interaction.isCommand(): {
        baseCommandHandler(interaction);
        return;
      }
      default:
        baseResponderHandler(interaction);
        return;
    }
  });

  return client;
}

function loadLogs() {
  const logs = [
    baseStorage.loadLogs.commands,
    baseStorage.loadLogs.responders,
    baseStorage.loadLogs.events,
  ].flat();
  logs.forEach((text) => logger.log(text));
}

function registerErrorHandlers(client?: Client<true>) {
  if (client) {
    process.removeListener('uncaughtException', baseErrorHandler);
    process.removeListener('unhandledRejection', baseErrorHandler);

    process.on('uncaughtException', (err) => baseErrorHandler(err, client));
    process.on('unhandledRejection', (err) => baseErrorHandler(err, client));
    return;
  }
  process.on('uncaughtException', baseErrorHandler);
  process.on('unhandledRejection', baseErrorHandler);
}

registerErrorHandlers();
