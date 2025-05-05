import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";

export default createCommand({
	name: "ping",
	description: "Mostra o ping atual do bot: /ping",
	type: ApplicationCommandType.ChatInput,
	async run(interaction){
		const sent = await interaction.reply({ content: `${settings.emojis.anim.loading} Calculando ping...`, fetchReply: true });
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
		const embed = createEmbed({
			author: createEmbedAuthor(interaction.user),
			title: `🏓 Pong!\nLatência do bot: ${ping}ms\nLatência da API: ${Math.round(interaction.client.ws.ping)}ms`,
			color: settings.colors.yellow,
		});
		await interaction.editReply({
            content: '',
			embeds: [embed]
        });
	}
});