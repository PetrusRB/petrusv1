
import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from "discord.js";

export default createCommand({
	name: "kick",
	description: "Expulsar um membro da guilda: /kick alvo: @alvo motivo: motivo",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "alvo",
			description: "Alvo que vai ser expulso: /kick alvo: @alvo motivo: Motivo Aqui.",
			type: ApplicationCommandOptionType.User,
			required
		},
		{
			name: "motivo",
			description: "Motivo para o alvo ser expulso",
			type: ApplicationCommandOptionType.String,
			required: false
		}
	],
	async run(interaction) {
		const { guild, user, options } = interaction;
		const botMe = guild?.members.me;

		await interaction.reply({ content: `${settings.emojis.anim.loading} Verificando Possibilidades de poder expulsar...`, fetchReply: true, ephemeral: true });
		if (!botMe?.permissions.has(PermissionFlagsBits.KickMembers)) {
			interaction.editReply({ content: `${settings.emojis.static.failed} Sem permissão para expulsar usuários!` });
			return;
		}
		if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) &&
			!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers) &&
			!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
			interaction.editReply({ content: `${settings.emojis.static.failed} Você não tem permissão para usar este comando.` });
			return;
		}

		const alvo = options.getUser('alvo');
		const motivo = options.getString('motivo') || "Motivo nenhum.";
		if (alvo === null) {
			interaction.reply({
				content: `${settings.emojis.static.failed} Por favor, especifique os parametros corretamente (alvo, motivo).`,
				ephemeral: true
			});
			return;
		}
		const targetMember = interaction.guild.members.cache.get(alvo.id);
		if (!targetMember) { interaction.editReply({ content: `${settings.emojis.static.failed} Alvo provavelmente não existe.` }); return; }
		if (!targetMember?.kickable) { interaction.editReply({ content: `${settings.emojis.static.failed} Eu não consigo expulsar este membro, pois ele não é kickavel, abortando...` }); return; }
		if (targetMember.id === user?.id) { interaction.editReply({ content: `${settings.emojis.static.failed} Você não pode expulsar você mesmo.` }); return; }
		if (targetMember.id === botMe?.id) { interaction.editReply({ content: `${settings.emojis.static.failed} Eu não posso me expulsar.` }); return; }
        if (targetMember.roles.highest.position >= botMe?.roles.highest.position) {
            interaction.reply({
                content: `${settings.emojis.static.failed} Não posso expulsar este membro, pois ele tem um cargo mais alto ou igual ao meu.`,
                ephemeral: true,
            });
            return;
        }
		if (!botMe.roles.highest) {
			interaction.reply({
				content: `${settings.emojis.static.failed} Meu cargo não é alto suficiente.`,
				ephemeral: true,
			});
			return;
		}
		try {
			await targetMember?.kick(motivo);
			const embed = createEmbed({
                author: createEmbedAuthor(interaction.user),
                title: `${settings.emojis.anim.manopla} ${alvo.username} foi expulso(a)`,
                description: `${settings.emojis.static.moderador} Expulso por: ${interaction.user.tag}\n${settings.emojis.static.reason} Motivo: ${motivo}`,
                fields: [
                    {
                        name: "Tipo de Usuário",
                        value: targetMember.user.bot
                            ? `${settings.emojis.static.bot} Bot`
                            : `${settings.emojis.static.member} Membro`,
                        inline: true
                    },
                    {
                        name: "ID do Usuário",
                        value: alvo.id,
                        inline: true
                    }
                ],
                color: settings.colors.magic,
                timestamp: new Date()
            });
			interaction.editReply({
				content: '',
				embeds: [embed]
			});
		} catch (error) {
			console.error(error);
			interaction.reply({
				content: `${settings.emojis.static.failed} Falha ao tentar expulsar`,
				ephemeral: true
			})
		}
	}
});