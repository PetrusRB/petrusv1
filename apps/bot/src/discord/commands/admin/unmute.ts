import { createCommand } from "#base";
import { db } from "#database";
import { settings } from "#settings";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from "discord.js";

export default createCommand({
    name: "unmute",
    description: "Desmutar um membro da guilda: /unmute alvo: @alvo",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "alvo",
            description: "Alvo que vai ser expulso.",
            type: ApplicationCommandOptionType.User,
            required
        }
    ],
    async run(interaction) {
        const { guild, user, options } = interaction;
        const botMe = guild?.members.me;
        const guildId = guild?.id;
        const currentGuildDB = await db.guilds.get(guildId);
        const memberrole = currentGuildDB?.cargos?.membro;
        if (!memberrole) {
            interaction.reply({
                content: `${settings.emojis.static.failed} O cargo de **memberrole** não está configurado. Use /config memberrole <cargo> para configurar.`,
                ephemeral: true
            });
            return;
        }
    
        await interaction.reply({ content: `${settings.emojis.anim.loading} Verificando possibilidades para desmutar...`, fetchReply: true, ephemeral: true });
        if (!botMe?.permissions.has([PermissionFlagsBits.MuteMembers, PermissionFlagsBits.ManageRoles])) {
            interaction.editReply({ content: `${settings.emojis.static.failed} Sem permissão para mutar usuários, ou gerenciar cargos de usuários.` });
            return;
        }
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) &&
            !interaction.memberPermissions?.has(PermissionFlagsBits.MuteMembers)) {
            interaction.editReply({ content: `${settings.emojis.static.failed} Você não tem permissão para usar este comando.` });
            return;
        }

        const alvo = options.getUser('alvo');
        
        if (alvo === null) {
            interaction.reply({
                content: `${settings.emojis.static.failed} Por favor, especifique os parametros corretamente (alvo, motivo).`,
                ephemeral: true
            });
            return;
        }
        const targetMember = interaction.guild.members.cache.get(alvo.id);
        if (!targetMember) { interaction.editReply({ content: `${settings.emojis.static.failed} Alvo provavelmente não existe.` }); return; }
        if (targetMember.roles.cache.get(memberrole)) { interaction.editReply({ content: `${settings.emojis.static.failed} Este membro já está desmutado.` }); return; }
        
        if (targetMember.id === user?.id) { interaction.editReply({ content: `${settings.emojis.static.failed} Você não pode mutar você mesmo.` }); return; }
        if (targetMember.id === botMe?.id) { interaction.editReply({ content: `${settings.emojis.static.failed} Eu não posso me mutar.` }); return; }
        if (targetMember.roles.highest.position >= botMe?.roles.highest.position) {
            interaction.reply({
                content: `${settings.emojis.static.failed} Não posso mutar este membro, pois ele tem um cargo mais alto ou igual ao meu.`,
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
            await targetMember?.roles.set([memberrole]);
            const embed = createEmbed({
                author: createEmbedAuthor(interaction.user),
                title: `${settings.emojis.anim.manopla} ${alvo.username} foi desmutado(a)`,
                description: `${settings.emojis.static.moderador} Desmutado por: ${interaction.user.tag}\n${settings.emojis.static.reason}`,
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
                content: `${settings.emojis.static.failed} Falha ao tentar mutar`,
                ephemeral: true
            })
        }
    }
});