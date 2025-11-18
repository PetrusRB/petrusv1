import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { ApplicationCommandType } from 'discord.js';
import { db } from '#database';
export default createCommand({
  name: 'ping',
  description: 'Mostra o ping atual do bot: /ping',
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const sent = await interaction.reply({
      content: `${settings.emojis.anim.loading} Calculando ping...`,
      fetchReply: true,
    });
    const ping = sent.createdTimestamp - interaction.createdTimestamp;
    const apiPing = Math.round(interaction.client.ws.ping);

    const embed = createEmbed({
      author: createEmbedAuthor(interaction.user),
      color: settings.colors.yellow,
      description: 'Aqui estão as latências atuais:',
      fields: [
        {
          name: '📶 Latência do Bot',
          value: `\`${ping}ms\``,
          inline: true,
        },
        {
          name: '⚡ Latência da API',
          value: `\`${apiPing}ms\``,
          inline: true,
        },
      ],
    });
    await interaction.editReply({
      content: '',
      embeds: [embed],
    });
  },
});
