import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, Guild, GuildBan, PermissionFlagsBits } from "discord.js";

async function resolveBan(
    guild: Guild,
    raw: string
): Promise<GuildBan | null> {
    // Extrai ID de menção ou usa raw
    const mentionMatch = raw.match(/^<@!?(\d+)>$/);
    const id = mentionMatch ? mentionMatch[1] : raw;

    // Fetch único de todos os bans
    const allBans = await guild.bans.fetch().catch(() => guild.bans.cache);

    // 1. Busca por ID
    const byId = allBans.get(id);
    if (byId) return byId;

    // 2. Busca por username#discriminator
    const byTag = allBans.find(
        (ban) => `${ban.user.username}#${ban.user.discriminator}` === raw
    );
    if (byTag) return byTag;

    // 3. Busca por username (case-insensitive)
    const matches = allBans.filter(
        (ban) => ban.user.username.toLowerCase() === raw.toLowerCase()
    );
    if (matches.size === 1) return matches.first()!;

    return null;
}
export default createCommand({
    name: "unban",
    description: "Desbanir membros da guilda: /unban alvo: @alvo",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "alvo",
            description: "alvo que vai ser banido.",
            type: ApplicationCommandOptionType.String,
            required
        }
    ],
    async run(interaction) {
        const { guild, user, options } = interaction;
        const botMe = guild?.members.me;
        // Checar se o bot tem permissão ou não.
        if (!botMe?.permissions.has(PermissionFlagsBits.BanMembers)) {
            await interaction.reply({ content: '❌ Sem permissão para banir usuários!', ephemeral: true });
            return;
        }
        const alvoString = options.getString('alvo', true);
        // Checar se o alvoString esta nulo ou não.
        if (alvoString === null) {
            await interaction.reply({
                content: `${settings.emojis.static.failed} Por favor, especifique os parametros corretamente (alvoString, motivo).`,
                ephemeral: true
            });
            return;
        }
        if(alvoString === user?.id){
            await interaction.reply({
                content: `${settings.emojis.static.failed} Você não pode se incluir no desbanimento.`
            })
            return;
        }
        
        const loading = await interaction.reply({
            content: `${settings.emojis.anim.loading} Verificando banimento de \`${alvoString}\`...`,
            fetchReply: true,
            ephemeral: true
        });

        const targetMember = await resolveBan(guild, alvoString);
        if (!targetMember) {
            await interaction.editReply({
                content: `${settings.emojis.static.failed} Usuário \`${alvoString}\` não encontrado na lista de banimentos.`,
            });
            return;
        }
        try {
            await guild.bans.remove(targetMember.user.id)
            const embed = createEmbed({
                author: createEmbedAuthor(interaction.user),
                title: `${settings.emojis.anim.banido} ${targetMember.user.username} foi desbanido pelo admin.`,
                description: targetMember.user.bot
                    ? `${settings.emojis.static.bot} Um bot.`
                    : `${settings.emojis.static.member} Um membro.`,
                color: settings.colors.yellow,
                timestamp: loading.createdTimestamp,
            })
            await interaction.editReply({
                content: '',
                embeds: [embed]
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `${settings.emojis.static.failed} Falha ao tentar desbanir`,
                ephemeral: true
            })
        }
    }
});