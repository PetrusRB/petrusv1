import { db } from '#database';
import { logger, settings } from '#settings';
import {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  Role,
  Snowflake,
} from 'discord.js';
import { ModuleBase } from 'discord/interfaces/module.interface.ts';
type ModerationConfig = {
  enabled: boolean;
  moderatorRole?: string; // cargo de mods
  unverifiedRole?: string; // cargo aplicado a não verificados (legacy)
  memberRole?: string; // cargo membro
  rulesChannel?: string; // canal para logs
  filters?: {
    swearList?: string[]; // palavras proibidas (strings simples / regex strings)
    blockInvites?: boolean;
    blockLinks?: boolean;
    maxMentions?: number;
    shortAccountDays?: number; // detecta conta criadas há menos de X dias
    punishments?: {
      deleteMessage?: boolean;
      warn?: boolean;
      kick?: boolean;
      muteRoleId?: string | null;
      muteDurationSec?: number | null;
      tempBanDays?: number | null;
    };
  };
};
export class Moderation implements ModuleBase {
  public id = 'moderation';
  public static cache = new Map<string, ModerationConfig>();
  private static watching = false;
  private static watcher: any = null;

  public constructor() {
    this.startWatcher(); // ativa o auto-reload uma única vez
  }

  private startWatcher() {
    if (Moderation.watching) return;
    Moderation.watching = true;

    try {
      // Pipeline para apenas mudanças relevantes
      Moderation.watcher = db.guilds.watch([], {
        fullDocument: 'updateLookup',
      });

      Moderation.watcher.on('change', (change: any) => {
        const guildId = change.documentKey?._id || change.fullDocument?.id;
        if (!guildId) return;

        Moderation.cache.delete(guildId);
        logger.log(`[Moderation] Cache invalidado para guild ${guildId}`);
      });

      Moderation.watcher.on('error', (error: any) => {
        logger.error('[Moderation] Erro no ChangeStream:', error);
        Moderation.watching = false;
        // Tenta reconectar após 5 segundos
        setTimeout(() => this.startWatcher(), 5000);
      });

      logger.log('[Moderation] ChangeStream ativo');
    } catch (err) {
      logger.error('[Moderation] ChangeStream não disponível:', err);
    }
  }
  /**
   * Para o watcher (útil para cleanup)
   */
  public stopWatcher() {
    if (Moderation.watcher) {
      Moderation.watcher.close();
      Moderation.watching = false;
      logger.log('[Moderation] ChangeStream fechado');
    }
  }

  /**
   * Carrega a config do servidor do banco
   */
  private async loadConfig(guildId: string): Promise<ModerationConfig> {
    // Retorna do cache se existir
    if (Moderation.cache.has(guildId)) {
      return Moderation.cache.get(guildId)!;
    }

    // Busca apenas os campos necessários
    const data = await db.guilds.findOne(
      { id: guildId },
      {
        projection: {
          'modules.moderation': 1,
          moderation: 1,
          'cargos.admin': 1,
          'cargos.naoverificado': 1,
          'cargos.membro': 1,
          'canais.regras': 1,
          'modules.moderation.filters': 1,
        },
      }
    );
    const cfgDoc = data?.moderation ?? {};

    const config: ModerationConfig = {
      enabled: data?.modules?.moderation ?? false,
      moderatorRole: data?.cargos?.admin ?? '',
      unverifiedRole: data?.cargos?.naoverificado ?? '',
      memberRole: data?.cargos?.membro ?? '',
      rulesChannel: data?.canais?.regras ?? '',
      filters: {
        swearList: cfgDoc?.filters?.antiswear?.words ?? [
          'puta',
          'foda',
          'caralho',
          'cp',
          'nsfw',
        ],
        blockInvites: cfgDoc?.filters?.blockInvites ?? true,
        blockLinks: cfgDoc?.filters?.blockLinks ?? false,
        maxMentions: cfgDoc?.filters?.maxMentions ?? 5,
        shortAccountDays: cfgDoc?.filters?.shortAccountDays ?? 3,
        punishments: {
          deleteMessage: cfgDoc?.filters?.punishments?.deleteMessage ?? true,
          warn: cfgDoc?.filters?.punishments?.warn ?? true,
          muteRoleId: cfgDoc?.filters?.punishments?.muteRoleId ?? null,
          muteDurationSec:
            cfgDoc?.filters?.punishments?.muteDurationSec ?? 3600,
          tempBanDays: cfgDoc?.filters?.punishments?.tempBanDays ?? null,
        },
      },
    };

    Moderation.cache.set(guildId, config);
    return config;
  }

  // Reload manual
  public async refresh(guildId: string) {
    Moderation.cache.delete(guildId);
    await this.loadConfig(guildId);
    logger.log(`[Moderation] Cache recarregado manualmente para ${guildId}`);
  }
  /**
   * Função para validar a configuração
   */
  public validateConfig(config: ModerationConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    if (!config.enabled)
      return { valid: false, errors: ['Módulo desativado.'] };
    if (!config.moderatorRole)
      errors.push('Cargo de moderação (`cargos.mod`) não configurado.');
    if (!config.memberRole)
      errors.push('Cargo de membro (`cargos.membro`) não configurado.');
    if (!config.rulesChannel)
      errors.push('Canal de regras (`canais.regras`) não configurado.');
    return { valid: errors.length === 0, errors };
  }
  /**
   * Limpa todo o cache (útil para manutenção)
   */
  public clearCache() {
    Moderation.cache.clear();
    logger.log('[Moderation] Cache limpo completamente');
  }
  /**
   * Recupera o cargo do ID com validação
   */
  public getRole(guild: Guild, id?: string): Role | null {
    if (!id) return null;
    return guild.roles.cache.get(id) || null;
  }
  /**
   * Recupera canal de texto com validação
   */
  private getTextChannel(
    guild: Guild,
    id?: string
  ): GuildTextBasedChannel | null {
    if (!id) return null;
    const ch = guild.channels.cache.get(id);
    if (!ch?.isTextBased()) return null;
    return ch;
  }

  /**
   * Verifica se membro é um 'moderador'
   */
  public isModerator(member: GuildMember, roleId?: string) {
    if (!roleId) return false;
    return member.roles.cache.has(roleId);
  }

  /**
   * Marca membro como não verificado
   */
  public async applyUnverified(
    member: GuildMember,
    roleId: string
  ): Promise<boolean> {
    try {
      await member.roles.add(roleId);
      return true;
    } catch (err) {
      console.error(`[Moderation] Falhou ao aplicar unverified:`, err);
      return false;
    }
  }

  /**
   * Gerencia as mensagems e verifica se são apropriadas
   */
  public async handleMessage(message: Message) {
    try {
      if (!message.guild || message.author?.bot) return; // ignore bots e DMs

      const config = await this.loadConfig(message.guild.id);
      if (!config.enabled) return;

      // quick skip para mods
      if (
        message.member &&
        config.moderatorRole &&
        this.isModerator(message.member, config.moderatorRole)
      )
        return;

      // checagens
      const violations: string[] = [];

      if (config.filters) {
        if (this.containsSwear(message.content, config.filters.swearList)) {
          violations.push('swear');
        }

        if (
          config.filters.blockInvites &&
          this.containsInvite(message.content)
        ) {
          violations.push('invite');
        }

        if (config.filters.blockLinks && this.containsLink(message.content)) {
          violations.push('link');
        }

        if (this.excessiveMentions(message, config.filters.maxMentions)) {
          violations.push('mentions');
        }

        if (
          message.member &&
          this.isShortLivedAccount(
            message.member,
            config.filters.shortAccountDays
          )
        ) {
          violations.push('short_account');
        }
      }

      if (violations.length === 0) return;

      await this.handleViolation(message, violations, config);
    } catch (err) {
      logger.error('[Moderation] Erro em handleMessage:', err);
    }
  }

  private containsSwear(content: string, swearList?: string[]) {
    if (!swearList || swearList.length === 0) return false;
    const normalized = content.toLowerCase();
    for (const term of swearList) {
      // se for possível usar regex (se o admin salvou regex)
      try {
        const re = new RegExp(term, 'i');
        if (re.test(content)) return true;
      } catch {
        if (normalized.includes(term.toLowerCase())) return true;
      }
    }
    return false;
  }

  private containsInvite(content: string) {
    const reInvite =
      /(discord\.gg|discord(?:app)?\.com\/invite)\/[A-Za-z0-9-]+/i;
    return reInvite.test(content);
  }

  private containsLink(content: string) {
    const reUrl = /https?:\/\/[^\s]+/i;
    return reUrl.test(content);
  }

  private excessiveMentions(message: Message, max?: number) {
    if (!max || max <= 0) return false;
    return (
      message.mentions.users.size > max || message.mentions.roles.size > max
    );
  }

  private isShortLivedAccount(member: GuildMember, days?: number) {
    if (!days || days <= 0) return false;
    const created = member.user.createdTimestamp;
    const ageMs = Date.now() - created;
    const thresholdMs = days * 24 * 60 * 60 * 1000;
    return ageMs < thresholdMs;
  }

  /*
    Ações ao detectar violação
  */

  private async handleViolation(
    message: Message,
    violations: string[],
    config: ModerationConfig
  ) {
    const v = violations.join(', ');
    logger.log(
      `[Moderation] Violation (${v}) from ${message.author.tag} in ${
        message.guild!.name
      }`
    );

    const filters = config.filters!;
    const punish = filters.punishments!;

    // delete message
    if (punish.deleteMessage) {
      try {
        await message.delete();
      } catch (err) {
        logger.error('[Moderation] Falha ao deletar mensagem:', err);
      }
    }

    // registrar warning no DB
    if (punish.warn) {
      try {
        await this.addWarning(message.guild!.id, message.author.id, {
          reason: v,
          timestamp: new Date(),
          messageId: message.id,
        });
      } catch (err) {
        logger.error('[Moderation] Falha ao salvar warning:', err);
      }
    }

    // aplicar mute role temporário se configurado e disponível
    if (punish.muteRoleId) {
      try {
        const guildMember = await message.guild!.members.fetch(
          message.author.id
        );
        if (guildMember && !guildMember.user.bot) {
          await guildMember.roles.add(punish.muteRoleId as Snowflake);
          logger.log(`[Moderation] Applied mute role to ${message.author.tag}`);
          if (punish.muteDurationSec && punish.muteDurationSec > 0) {
            setTimeout(async () => {
              try {
                const fresh = await message.guild!.members.fetch(
                  message.author.id
                );
                if (fresh && fresh.roles.cache.has(punish.muteRoleId!)) {
                  await fresh.roles
                    .remove(punish.muteRoleId as Snowflake)
                    .catch(() => {});
                  logger.log(
                    `[Moderation] Removed mute role from ${message.author.tag}`
                  );
                }
              } catch (err) {
                logger.error(
                  '[Moderation] Erro ao remover mute role (timeout):',
                  err
                );
              }
            }, punish.muteDurationSec * 1000);
          }
        }
      } catch (err) {
        logger.error('[Moderation] Erro ao aplicar mute role:', err);
      }
    }

    // log no canal de regras, se configurado
    try {
      const ch = this.getTextChannel(message.guild!, config.rulesChannel);
      if (ch && ch.isSendable()) {
        await ch.send({
          content: `🛡️ **AutoMod** — ${message.author.tag} (${
            message.author.id
          })\nServidor: **${message.guild!.name}**\nCanal: <#${
            message.channelId
          }>\nMotivos: ${v}\nMensagem removida: ${
            punish.deleteMessage ? 'Sim' : 'Não'
          }`,
        });
      }
    } catch (err) {
      logger.error('[Moderation] Falha ao logar no canal de regras:', err);
    }

    // expulsar (se configurado)
    if (punish.kick) {
      try {
        await message.guild!.members.kick(message.author.id, `AutoMod: ${v}`);
        logger.log(`[Moderation] Usuário expulso: ${message.author.tag}`);
      } catch (error) {
        logger.error('[Moderation] Falha ao expulsar:', error);
      }
    }
    // ban temporário (se configurado)
    if (punish.tempBanDays && punish.tempBanDays > 0) {
      try {
        await message.guild!.members.ban(message.author.id, {
          deleteMessageSeconds: Math.min(7, punish.tempBanDays),
          reason: `AutoMod: ${v}`,
        });
        // logs
        logger.log(
          `[Moderation] Usuário banido temporariamente: ${message.author.tag}`
        );
      } catch (err) {
        logger.error('[Moderation] Falha ao aplicar temp ban:', err);
      }
    }
  }

  // Armazenamento de warnings.
  private async addWarning(guildId: string, userId: string, payload: any) {
    try {
      await db.guilds.updateOne(
        { guildId, userId },
        { $push: { mod_warnings: payload }, $setOnInsert: { guildId, userId } },
        { upsert: true }
      );
    } catch (err) {
      logger.error('[Moderation] addWarning error:', err);
    }
  }

  /**
   * Desabilita o sistema de moderação
   */
  public async disable(guild: Guild) {
    const config = await this.loadConfig(guild.id);
    try {
      if (config.enabled) {
      }
    } catch (err) {}
  }
  /**
   * Trigger da verificação
   */
  public async trigger(guild: Guild, member: GuildMember) {}

  /**
   * Função principal para configurar o módulo
   */
  public async setup(guild: Guild, bot: GuildMember, member: GuildMember) {
    const config = await this.loadConfig(guild.id);
    const validation = this.validateConfig(config);

    if (!validation.valid) {
      logger.warn(
        `[Moderation] Configuração inválida no servidor ${guild.name}`,
        validation.errors
      );
      try {
        await member.send(
          `${
            settings.emojis.static.failed
          } - Falha no setup do AutoMod: ${validation.errors.join('; ')}`
        );
      } catch {}
      return;
    }

    const memberRole = this.getRole(guild, config.memberRole);
    if (!memberRole) {
      logger.warn(`[Moderation] Cargo membro inválido em ${guild.name}`);
      return;
    }

    try {
      await member.send(
        `${settings.emojis.static.moderador} Sistema de moderação ativado em **${guild.name}**`
      );
      logger.log(`[Moderation] Setup finalizado em ${guild.name}`);
    } catch (err) {
      logger.error('[Moderation] Erro no setup:', err);
    }
  }
}
