import { Kazagumo } from 'kazagumo';
declare module 'discord.js' {
  interface Client {
    music: Kazagumo;
  }
}
