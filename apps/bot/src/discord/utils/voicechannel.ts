import { Client } from 'discord.js';
import { Player } from 'magmastream';
export function isVoiceChannelEmpty(client: Client, player: Player) {
  if (!player.voiceChannelId) return true;

  const channel = client.channels.cache.get(player.voiceChannelId);
  if (!channel || !channel.isVoiceBased()) return true;

  const humanos = channel.members.filter((m) => !m.user.bot);
  return humanos.size === 0;
}
