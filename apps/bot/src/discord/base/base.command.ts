import { logger } from '#settings';
import { brBuilder } from '@magicyan/discord';
import ck from 'chalk';
import {
  ApplicationCommand,
  ApplicationCommandOptionChoiceData,
  ApplicationCommandType,
  AutocompleteInteraction,
  CacheType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
  Collection,
  CommandInteraction,
  MessageApplicationCommandData,
  MessageContextMenuCommandInteraction,
  UserApplicationCommandData,
  UserContextMenuCommandInteraction,
} from 'discord.js';
import { baseStorage } from './base.storage.js';
import { ContextName, SlashName } from './base.types.js';

/**
 * Helpers para shard/cluster-aware handling
 */

// calcula shardId a partir do guildId (Discord snowflake) usando bitshift
function shardIdFromGuildId(
  guildId: string | null | undefined,
  totalShards: number
) {
  if (!guildId) return null;
  try {
    // shift right 22 bits then modulo totalShards
    const sid = Number((BigInt(guildId) >> 22n) % BigInt(totalShards));
    return Number.isNaN(sid) ? null : sid;
  } catch {
    return null;
  }
}

function getTotalShardsFromClient(client: Client<true> | Client) {
  // prefer client.shard.count if disponível, fallback para 1
  // em alguns setups hybridd-sharding isso estará presente
  // cast to any para compatibilidade com versões
  const shardCount =
    (client.shard as any)?.count ?? (client.options?.shards as any) ?? 1;
  return Number(shardCount) || 1;
}

function clientOwnsShard(
  client: Client<true> | Client,
  shardId: number | null
) {
  if (shardId === null) return false;
  const ids = (client.shard as any)?.ids ?? client.options?.shards ?? null;
  if (Array.isArray(ids)) return ids.includes(shardId);
  // quando não souber, assume true (fallback)
  return true;
}

/**
 * Tipos e utilidades de comando
 */
type AutocompleteReturn = Promise<
  void | undefined | readonly ApplicationCommandOptionChoiceData[]
>;

export type CommandType = Exclude<
  ApplicationCommandType,
  ApplicationCommandType.PrimaryEntryPoint
>;
type Cache<D extends boolean> = D extends false ? 'cached' : CacheType;

type ApplicationCommandData<
  N extends string,
  D extends boolean,
  T extends CommandType
> = T extends ApplicationCommandType.User
  ? UserApplicationCommandData & {
      name: ContextName<N>;
      run(
        interaction: UserContextMenuCommandInteraction<Cache<D>>
      ): Promise<void>;
    }
  : T extends ApplicationCommandType.Message
  ? MessageApplicationCommandData & {
      name: ContextName<N>;
      run(
        interaction: MessageContextMenuCommandInteraction<Cache<D>>
      ): Promise<void>;
    }
  : ChatInputApplicationCommandData & {
      name: SlashName<N>;
      run(interaction: ChatInputCommandInteraction<Cache<D>>): Promise<void>;
      autocomplete?(
        interaction: AutocompleteInteraction<Cache<D>>
      ): AutocompleteReturn;
    };

export type CommandData<
  Name extends string,
  DmPermission extends boolean,
  Type extends CommandType
> = ApplicationCommandData<Name, DmPermission, Type> & {
  type?: Type;
  dmPermission?: DmPermission;
  global?: boolean;
};

export type GenericCommandData = CommandData<any, any, any>;

const cooldowns: Map<string, Map<string, number>> = new Map();

/**
 * baseCommandHandler — agora shard/cluster-aware
 */
export async function baseCommandHandler(interaction: CommandInteraction) {
  const { onNotFound, middleware, onError } = baseStorage.config.commands;
  const command = baseStorage.commands.get(interaction.commandName);

  // === proteção: determinar se este worker deve responder ===
  try {
    const client = interaction.client;
    const totalShards = getTotalShardsFromClient(client);
    const guildId = interaction.guildId ?? null;

    // se for DM (sem guild) — por segurança, só permita cluster 0/manualmente
    if (!guildId) {
      const clusterId = (client as any).cluster?.id ?? 0;
      if (clusterId !== 0) {
        // ignora DM em clusters diferentes de 0 (evita duplo handling)
        logger.log(
          ck.yellow(
            `[Cluster ${
              (client as any).cluster?.id ?? '?'
            }] Ignorando DM interaction`
          )
        );
        return;
      }
    } else {
      const expectedShard = shardIdFromGuildId(guildId, totalShards);
      // se pudermos determinar expectedShard e este client não o possui, ignorar
      if (expectedShard !== null && !clientOwnsShard(client, expectedShard)) {
        logger.log(
          ck.yellow(
            `[Cluster ${
              (client as any).cluster?.id ?? '?'
            }] Ignorando interaction do guild ${guildId} (shard ${expectedShard})`
          )
        );
        return;
      }
    }
  } catch (err) {
    // se algo falhar nessa checagem, não bloqueamos o comando — apenas log
    logger.log(
      ck.yellow(
        '[baseCommandHandler] falha ao verificar shard ownership — fallback para processar'
      )
    );
  }

  if (!command) {
    onNotFound && onNotFound(interaction);
    return;
  }

  const userId = interaction.user.id;
  const commandName = interaction.commandName;
  const COOLDOWN = 5000; // allow override

  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Map());
  }

  const userCooldowns = cooldowns.get(commandName)!;
  const lastUsed = userCooldowns.get(userId) ?? 0;
  const now = Date.now();
  const diff = now - lastUsed;

  if (diff < COOLDOWN) {
    const timeLeft = Math.ceil((COOLDOWN - diff) / 1000);

    // Responder cooldown sem causar double-ack:
    // se já respondeu/deferiu, apenas editReply; senão, defer+edit
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        await interaction.editReply(`⏳ Aguarde ${timeLeft}s.`).catch(() => {});
      } else {
        // se já foi deferido/replied, tenta apenas editar
        await interaction
          .editReply?.(`⏳ Aguarde ${timeLeft}s.`)
          .catch(() => {});
      }
    } catch {
      // swallow
    }
    return;
  }

  let block = false;
  if (middleware) await middleware(interaction, () => (block = true));
  if (block) return;

  try {
    // Executar o comando (comandos devem gerenciar seus próprios defer/reply)
    await command.run(interaction as never);
  } catch (error) {
    if (onError) onError(error, interaction);
    else throw error;
  } finally {
    // cooldown ativado APÓS execução
    userCooldowns.set(userId, Date.now());
  }
}

/**
 * baseAutocompleteHandler — também shard-aware (evita multiple responders)
 */
export async function baseAutocompleteHandler(
  interaction: AutocompleteInteraction
) {
  try {
    const client = interaction.client;
    const totalShards = getTotalShardsFromClient(client);
    const guildId = interaction.guildId ?? null;

    if (!guildId) {
      const clusterId = (client as any).cluster?.id ?? 0;
      if (clusterId !== 0) {
        return;
      }
    } else {
      const expectedShard = shardIdFromGuildId(guildId, totalShards);
      if (expectedShard !== null && !clientOwnsShard(client, expectedShard))
        return;
    }
  } catch {
    // fallback: continue
  }

  const command = baseStorage.commands.get(interaction.commandName);
  if (command && 'autocomplete' in command && command.autocomplete) {
    const choices = await command.autocomplete(
      interaction as AutocompleteInteraction
    );
    if (choices && Array.isArray(choices) && !interaction.responded) {
      interaction.respond(choices.slice(0, 25)).catch(() => {});
    }
  }
}

/**
 * baseRegisterCommands — mantém a regra: apenas cluster 0 registra,
 * mas com log mais claro para setups de múltiplos clusters
 */
export async function baseRegisterCommands(client: Client<true>) {
  const clusterId = (client as any).cluster?.id ?? 0;

  if (clusterId !== 0) {
    logger.log(
      ck.yellow(
        `[Cluster ${clusterId}] Pulando registro de comandos (apenas Cluster 0 registra)`
      )
    );
    return;
  }

  logger.log(
    ck.cyan(`[Cluster ${clusterId}] Iniciando registro de comandos...`)
  );
  const plural = (value: number) => (value > 1 ? 's' : '');

  const guilds = client.guilds.cache.filter(({ id }) =>
    baseStorage.config.commands.guilds.includes(id)
  );

  const messages: string[] = [];

  if (guilds?.size) {
    const [globalCommands, guildCommands] = baseStorage.commands
      .partition((c) => c.global === true)
      .map((c) => Array.from(c.values()));

    await client.application.commands.set(globalCommands).then((commands) => {
      if (!commands.size) return;
      messages.push(
        ck.greenBright(
          `└ ${commands.size} command${plural(
            commands.size
          )} successfully registered globally!`
        )
      );
      if (baseStorage.config.commands.verbose) {
        messages.push(...verbooseLogs(commands));
      }
    });
    for (const guild of guilds.values()) {
      await guild.commands.set(guildCommands).then((commands) => {
        messages.push(
          ck.greenBright(
            `└ ${commands.size} command${plural(
              commands.size
            )} registered in ${ck.underline(guild.name)} guild successfully!`
          )
        );
        if (baseStorage.config.commands.verbose) {
          messages.push(...verbooseLogs(commands));
        }
      });
    }
    logger.log(brBuilder(messages));
    return;
  }

  for (const guild of client.guilds.cache.values()) {
    guild.commands.set([]);
  }
  const commands = Array.from(baseStorage.commands.values());
  await client.application.commands.set(commands).then((commands) => {
    messages.push(
      ck.greenBright(
        `└ ${commands.size} command${plural(
          commands.size
        )} successfully registered globally!`
      )
    );
    if (baseStorage.config.commands.verbose) {
      messages.push(...verbooseLogs(commands));
    }
  });

  logger.log(brBuilder(messages));
}

/**
 * helpers de log/format
 */
function verbooseLogs(commands: Collection<string, ApplicationCommand>) {
  const u = ck.underline;
  return commands.map(
    ({ id, name, type: commandType, client, createdAt, guild }) => {
      const [icon] = getCommandTitle(commandType);

      return ck.dim.green(
        [
          ` └ ${icon}`,
          u.cyan(id),
          'CREATED',
          u.blue(name),
          ck.gray('>'),
          guild
            ? `${u.blue(guild.name)} guild`
            : `${u.blue(client.user.username)} application`,
          ck.gray('>'),
          'created at:',
          u.greenBright(createdAt.toLocaleTimeString()),
        ].join(' ')
      );
    }
  );
}

export function baseCommandLog(data: GenericCommandData) {
  const [icon, type] = getCommandTitle(data.type);

  baseStorage.loadLogs.commands.push(
    ck.green(
      `${icon} ${type} ${ck.gray('>')} ${ck.blue.underline(data.name)} ✓`
    )
  );
}

function getCommandTitle(type: ApplicationCommandType) {
  return type === ApplicationCommandType.Message
    ? ['{☰}', 'Message context menu']
    : type === ApplicationCommandType.User
    ? ['{☰}', 'User context menu']
    : ['{/}', 'Slash command'];
}
