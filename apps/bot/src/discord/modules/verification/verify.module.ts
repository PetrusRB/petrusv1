import { db } from '#database';
import { logger, settings } from '#settings';
import {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  Role,
} from 'discord.js';
import { ModuleBase } from 'discord/interfaces/module.interface.ts';
type VerificationConfig = {
  enabled: boolean;
  unverifiedRole?: string;
  memberRole?: string;
  rulesChannel?: string;
};
export class Verification implements ModuleBase {
  public id = 'verification';
  public static cache = new Map<string, VerificationConfig>();
  private static watching = false;
  private static watcher: any = null;

  public constructor() {
    this.startWatcher(); // ativa o auto-reload uma única vez
  }

  init?: (() => Promise<void> | void) | undefined;
  reload?: ((guildId: string) => Promise<void>) | undefined;

  private startWatcher() {
    if (Verification.watching) return;
    Verification.watching = true;

    try {
      // Pipeline para apenas mudanças relevantes
      Verification.watcher = db.guilds.watch([], {
        fullDocument: 'updateLookup',
      });

      Verification.watcher.on('change', (change: any) => {
        const guildId = change.documentKey?._id || change.fullDocument?.id;
        if (!guildId) return;

        Verification.cache.delete(guildId);
        logger.log(`[Verification] Cache invalidado para guild ${guildId}`);
      });

      Verification.watcher.on('error', (error: any) => {
        logger.error('[Verification] Erro no ChangeStream:', error);
        Verification.watching = false;
        // Tenta reconectar após 5 segundos
        setTimeout(() => this.startWatcher(), 5000);
      });

      logger.log('[Verification] ChangeStream ativo');
    } catch (err) {
      logger.error('[Verification] ChangeStream não disponível:', err);
    }
  }
  /**
   * Para o watcher (útil para cleanup)
   */
  public stopWatcher() {
    if (Verification.watcher) {
      Verification.watcher.close();
      Verification.watching = false;
      logger.log('[Verification] ChangeStream fechado');
    }
  }

  /**
   * Carrega a config do servidor do banco
   */
  private async loadConfig(guildId: string): Promise<VerificationConfig> {
    // Retorna do cache se existir
    if (Verification.cache.has(guildId)) {
      return Verification.cache.get(guildId)!;
    }

    // Busca apenas os campos necessários
    const data = await db.guilds.findOne(
      { id: guildId },
      {
        projection: {
          'modules.verification': 1,
          'cargos.naoverificado': 1,
          'cargos.membro': 1,
          'canais.regras': 1,
        },
      }
    );

    const config: VerificationConfig = {
      enabled: data?.modules?.verification ?? false,
      unverifiedRole: data?.cargos?.naoverificado ?? '',
      memberRole: data?.cargos?.membro ?? '',
      rulesChannel: data?.canais?.regras ?? '',
    };

    Verification.cache.set(guildId, config);
    return config;
  }

  // Reload manual
  public async refresh(guildId: string) {
    Verification.cache.delete(guildId);
    await this.loadConfig(guildId);
    logger.log(`[Verification] Cache recarregado manualmente para ${guildId}`);
  }
  /**
   * Função para validar a configuração
   */
  public validateConfig(config: VerificationConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    if (!config.enabled) {
      return { valid: false, errors: ['Módulo desativado.'] };
    }
    if (!config.unverifiedRole) {
      errors.push('Cargo de não verificado não configurado');
    }
    if (!config.memberRole) {
      errors.push('Cargo `cargos.member` não configurado.');
    }
    if (!config.rulesChannel) {
      errors.push('Cargo `canais.regras` não configurado!');
    }
    return { valid: errors.length === 0, errors };
  }
  /**
   * Limpa todo o cache (útil para manutenção)
   */
  public clearCache() {
    Verification.cache.clear();
    logger.log('[Verification] Cache limpo completamente');
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
   * Verifica se membro está "não verificado"
   */
  public isUnverified(member: GuildMember, roleId?: string) {
    return roleId ? member.roles.cache.has(roleId) : false;
  }

  /**
   * Gerenciar mensagems
   */

  public async handleMessage(message: Message) {}

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
      console.error(`[Verification] Falhou ao aplicar unverified:`, err);
      return false;
    }
  }

  /**
   * Marca membro como verificado
   */
  public async applyVerified(
    member: GuildMember,
    roleId: string
  ): Promise<boolean> {
    const data = await db.guilds.findOne({ id: member.guild.id });
    if (!data) {
      logger.error(`[Verification] Falhou ao carregar as configurações`);
      return false;
    }

    if (!data.modules?.verification) {
      logger.error(`[Verification] Modulo de verificação não ativado!`);
      return false;
    }
    try {
      await member.roles.add(roleId);
      return true;
    } catch (err) {
      console.error(`[Verification] Falhou ao aplicar verified:`, err);
      return false;
    }
  }
  /**
   * Remove cargo de verificado
   */
  public async removeVerified(member: GuildMember, roleId: string) {
    if (!member.roles.cache.has(roleId)) return;
    try {
      await member.roles.remove(roleId);
    } catch (err) {
      console.error(`[Verification] Falhou ao remover member:`, err);
    }
  }
  /**
   * Remove cargo de não verificado
   */
  public async removeUnverified(member: GuildMember, roleId: string) {
    if (!member.roles.cache.has(roleId)) return;
    try {
      await member.roles.remove(roleId);
    } catch (err) {
      console.error(`[Verification] Falhou ao remover unverified:`, err);
    }
  }
  /**
   * Desabilita completamente o sistema de verificação
   * Remove o cargo de não verificado de todos os membros
   */
  public async disable(guild: Guild) {
    const config = await this.loadConfig(guild.id);
    if (!config.unverifiedRole) return;

    const unverifiedRole = guild.roles.cache.get(config.unverifiedRole);
    if (!unverifiedRole) return;

    try {
      // Busca apenas membros com o cargo (mais eficiente)
      const members = await guild.members.fetch();
      const membersWithRole = members.filter(
        (m) => !m.user.bot && m.roles.cache.has(unverifiedRole.id)
      );

      logger.log(
        `[Verification] Removendo cargo de ${membersWithRole.size} membros em ${guild.name}`
      );

      // Processa em lotes de 10 para evitar rate limit
      const batchSize = 10;
      const memberArray = Array.from(membersWithRole.values());

      for (let i = 0; i < memberArray.length; i += batchSize) {
        const batch = memberArray.slice(i, i + batchSize);

        await Promise.all(
          batch.map((member) =>
            member.roles.remove(unverifiedRole.id).catch((err) => {
              logger.error(
                `[Verification] Erro ao remover cargo de ${member.user.tag}:`,
                err
              );
            })
          )
        );

        // Delay entre lotes para evitar rate limit
        if (i + batchSize < memberArray.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      console.log(`[Verification] Sistema desabilitado em ${guild.name}`);
    } catch (err) {
      console.error(`[Verification] Erro ao desabilitar módulo:`, err);
    }
  }
  /**
   * Trigger da verificação
   */
  public async trigger(guild: Guild, member: GuildMember) {}
  /**
   * Função principal para configurar o sistema de verificação
   */
  public async setup(guild: Guild, bot: GuildMember, member: GuildMember) {
    const config = await this.loadConfig(guild.id);
    const validation = this.validateConfig(config);

    if (!validation.valid) {
      logger.warn(
        `[Verification] Configuração inválida no servidor ${guild.name}`,
        validation.errors
      );
      if (member.dmChannel?.isSendable()) {
        member.dmChannel.send({
          content: `${settings.emojis.static.failed} - Falha ao tentar fazer o setup do sistema de verificação no servidor: ${guild.name}, causado por configurações inválidas`,
        });
      }
      return;
    }

    const unverifiedRole = this.getRole(guild, config.unverifiedRole);
    const memberRole = this.getRole(guild, config.memberRole);
    const rulesChannel = this.getTextChannel(guild, config.rulesChannel);
    if (!unverifiedRole || !memberRole || !rulesChannel) {
      logger.warn(
        `[Verification] Falha ao carregar cargos/canais necessários no servidor ${guild.name}`
      );

      if (member.dmChannel?.isSendable()) {
        member.dmChannel.send({
          content: `${settings.emojis.static.failed} - Falha ao tentar fazer o setup do sistema de verificação no servidor: ${guild.name}, não foi possivel obter cargos/canais configurados (INVALID_CONFIG)`,
        });
      }
      return;
    }
    try {
      const members = await guild.members.fetch();
      const membersToProcess = members.filter(
        (m) =>
          !m.user.bot &&
          !m.roles.cache.has(unverifiedRole.id) &&
          !m.roles.cache.has(memberRole.id)
      );

      logger.log(
        `[Verification] Aplicando cargo de não verificado em ${membersToProcess.size} membros de ${guild.name}`
      );

      // Processa em lotes de 10
      const batchSize = 10;
      const memberArray = Array.from(membersToProcess.values());

      for (let i = 0; i < memberArray.length; i += batchSize) {
        const batch = memberArray.slice(i, i + batchSize);

        await Promise.all(
          batch.map((m) =>
            this.applyUnverified(m, unverifiedRole.id).catch(() => {})
          )
        );

        // Delay entre lotes
        if (i + batchSize < memberArray.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      try {
        await member.send({
          content: `${settings.emojis.static.moderador} Sistema de verificação ativado em **${guild.name}**`,
        });
      } catch {
        // Ignorar se não conseguir enviar DM
      }

      logger.log(
        `[Verification] Módulo ativo em ${guild.name} (ID: ${guild.id})`
      );
    } catch (err) {
      logger.error(`[Verification] Erro no setup em ${guild.name}:`, err);
    }
  }
}
