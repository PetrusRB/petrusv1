import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.login(process.env.BOT_TOKEN);

// carregar o bot
import '../structures/bot.js';
