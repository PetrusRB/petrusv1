import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from "discord.js";


export default createCommand({
	name: "clear",
	description: "Limpa as mensagens do canal de texto: /clear quantidade: 10",
    options: [ 
        { 
            name: "quantidade", 
            description: "Quantidade de mensagens que vão ser deletadas", 
            type: ApplicationCommandOptionType.Integer,
            required
        } 
    ], 
	type: ApplicationCommandType.ChatInput,
	async run(interaction: ChatInputCommandInteraction) : Promise<any>{
        const {guild, channel} = interaction;
        const botMe = guild?.members.me;
        const loading = await interaction.reply({content: `${settings.emojis.anim.loading} Deletando...`, fetchReply: true, ephemeral: true})
        if (!botMe?.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.editReply({ content: `${settings.emojis.static.failed} Sem permissão para gerenciar mensagens!` });
        }
        const quantidade = interaction.options.getInteger('quantidade');
        if (quantidade === null || quantidade < 1 || quantidade > 100) {
            return interaction.editReply({
                content: `${settings.emojis.static.failed} Por favor, especifique um número entre 1 e 100.`
            });
        }
        try {
            if (channel?.isTextBased() && channel.type === 0) {
                const deleted = await (channel as TextChannel).bulkDelete(quantidade, true);
                const embed = createEmbed({
                    title: `${settings.emojis.anim.clean} Deletadas ${deleted?.size} mensagens!`,
                    color: settings.colors.yellow,
                    timestamp: loading.editedTimestamp
                });
                return interaction.editReply({
                    content: '',
                    embeds: [embed]
                });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: `${settings.emojis.static.failed} Ocorreu um erro ao tentar deletar as mensagens!`,
                ephemeral: true
            });
        }
	}
});