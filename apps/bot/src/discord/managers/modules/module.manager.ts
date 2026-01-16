import { logger } from '#settings';
import { ModuleBase } from 'discord/interfaces/module.interface.ts';

export class ModuleManager {
  private modules = new Map<string, ModuleBase>();

  register(module: ModuleBase) {
    if (this.modules.has(module.id)) {
      logger.log(`[ModuleManager] Re-registrando módulo ${module.id}`);
    }
    this.modules.set(module.id, module);
    try {
      if (module.init) {
        module.init();
      }
    } catch (e) {
      logger.error('[ModuleManager] init:', e);
    }
  }

  get(id: string) {
    return this.modules.get(id) ?? null;
  }

  list() {
    return Array.from(this.modules.keys());
  }

  /**
   * Recarrega todos os módulos para uma guild de forma performática.
   * Executa reload() (ou refresh()) em paralelo e retorna um resumo.
   */
  async reloadGuildModules(guildId: string) {
    const mods = Array.from(this.modules.values());

    const results = await Promise.allSettled(
      mods.map(async (m) => {
        try {
          if (m.reload) {
            await m.reload(guildId);
            return { id: m.id, ok: true };
          }

          // fallback para módulos antigos com "refresh"
          const anyM = m as any;
          if (anyM.refresh) {
            await anyM.refresh(guildId);
            return { id: m.id, ok: true, fallback: true };
          }

          return { id: m.id, ok: false, reason: 'no-reload' };
        } catch (err: any) {
          return { id: m.id, ok: false, reason: err?.message ?? String(err) };
        }
      })
    );

    return results.map((r) =>
      r.status === 'fulfilled'
        ? (r.value as any)
        : {
            id: 'unknown',
            ok: false,
            reason: (r as any).reason?.message || String((r as any).reason),
          }
    );
  }
}
export const moduleManager = new ModuleManager();
