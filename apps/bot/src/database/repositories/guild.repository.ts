import { db } from '../index.ts';
import { cacheGet, cacheSet, cacheDel } from '../db.helper.ts';
import type { GuildSchema } from '../index.ts';

const TTL = 60 * 5; // 5 minutos por padrão

const key = (guildId: string) => `guild:${guildId}`;

export const GuildRepository = {
  async getById(guildId: string): Promise<GuildSchema | null> {
    return cacheGet<GuildSchema | null>(
      key(guildId),
      async () => {
        return await db.guilds.findOne({ id: guildId }).lean().exec();
      },
      TTL
    );
  },

  // BLACK LIST SYSTEM
  /**
   * Adicionar um membro ao blacklist na DB
   * @param guildId
   * @param userId
   * @returns updated data
   */
  async addToBlacklistUser(guildId: string, userId: string) {
    await db.guilds
      .updateOne(
        { id: guildId },
        { $addToSet: { 'blacklist.users': userId } },
        { upsert: true }
      )
      .exec();

    // Busca documento atualizado e atualiza cache (mais seguro e simples)
    const updated = await db.guilds.findOne({ id: guildId }).lean().exec();
    if (updated) await cacheSet<GuildSchema>(key(guildId), updated, TTL);
    return updated;
  },
  /**
   * Remove o membro da lista de blacklist do DB
   * @param guildId
   * @param userId
   * @returns updated data
   */
  async removeFromBlacklistUser(guildId: string, userId: string) {
    await db.guilds
      .updateOne({ id: guildId }, { $pull: { 'blacklist.users': userId } })
      .exec();
    const updated = await db.guilds.findOne({ id: guildId }).lean().exec();
    if (updated) await cacheSet<GuildSchema>(key(guildId), updated, TTL);
    return updated;
  },

  // DB UTILITIES
  /**
   * Seta um determinado documento ao DB
   * @param guildId
   * @param data
   * @returns updated data
   */
  async set(guildId: string, data: Partial<GuildSchema>) {
    await db.guilds.updateOne(
      { id: guildId },
      { $set: data },
      { upsert: true }
    );

    const updated = await db.guilds
      .findOne({ id: guildId })
      .lean<GuildSchema>()
      .exec();

    if (updated) await cacheSet(key(guildId), updated, TTL);
    return updated;
  },
  /**
   * Atualiza e seta de forma segura o documento.
   * @param guildDoc
   * @returns updated data
   */
  async upsert(guildDoc: Partial<GuildSchema>) {
    await db.guilds
      .updateOne({ id: guildDoc.id }, { $set: guildDoc }, { upsert: true })
      .exec();
    // ler a versão atualizada e atualizar cache
    const updated = await db.guilds.findOne({ id: guildDoc.id }).lean().exec();
    if (updated)
      await cacheSet<GuildSchema>(key(updated.id as string), updated, TTL);
    return updated;
  },

  /** substitui tudo (array) */
  async setArray(path: string, guildId: string, items: string[]) {
    return this.set(guildId, {
      [path]: items,
    } as any);
  },

  /** add sem duplicar (array) */
  async addToArray(path: string, guildId: string, items: string[]) {
    await db.guilds.updateOne(
      { id: guildId },
      { $addToSet: { [path]: { $each: items } } },
      { upsert: true }
    );

    const updated = await db.guilds
      .findOne({ id: guildId })
      .lean<GuildSchema>()
      .exec();

    if (updated) await cacheSet(key(guildId), updated, TTL);
    return updated;
  },

  /** remove itens (array) */
  async removeFromArray(path: string, guildId: string, items: string[]) {
    await db.guilds.updateOne({ id: guildId }, { $pullAll: { [path]: items } });

    const updated = await db.guilds
      .findOne({ id: guildId })
      .lean<GuildSchema>()
      .exec();

    if (updated) await cacheSet(key(guildId), updated, TTL);
    return updated;
  },

  async invalidate(guildId: string) {
    await cacheDel(key(guildId));
  },
};
