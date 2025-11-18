import { ClusterClient } from 'discord-hybrid-sharding';
import { Manager } from 'magmastream';
declare module 'discord.js' {
  interface Client {
    cluster: ClusterClient<Client>;
    music: Manager;
    searchCache: Map<
      string,
      {
        tracks: any[];
        expires: number;
        guildId?: string;
        userId?: string;
      }
    >;
  }
}
