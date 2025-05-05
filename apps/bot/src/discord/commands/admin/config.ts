import { createCommand } from "#base";
import { settings } from "#settings";
import { ApplicationCommandType, PermissionFlagsBits } from "discord.js";
import { db } from "#database";

export default createCommand({
    name: "config",
    description: "Configurações do bot: /config cargos mutado id_do_cargo",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "category",
            description: "Categoria da configuração.",
            type: 3, // ApplicationCommandOptionType.String
            required: true,
        },
        {
            name: "chave",
            description: "Chave da configuração.",
            type: 3, // ApplicationCommandOptionType.String
            required: true,
        },
        {
            name: "valor",
            description: "Valor da configuração.",
            type: 3, // ApplicationCommandOptionType.String
            required: true,
        }
    ],
    async run(interaction): Promise<any> {
        const { guild, options, memberPermissions } = interaction;
        const botMe = guild?.members.me;
        const guildId = guild?.id;
        // Verificar se o comando está sendo usado em um servidor
        if (!guildId) {
            return interaction.reply({
                content: `${settings.emojis.static.failed} Este comando só pode ser usado em um servidor.`,
                ephemeral: true,
            });
        }
        // Verificar se o bot tem permissão para mutar membros
        if (!botMe?.permissions.has([PermissionFlagsBits.MuteMembers, PermissionFlagsBits.ManageRoles])) {
            return interaction.reply({
                content: `${settings.emojis.static.failed} Sem permissão para mutar usuários, ou gerenciar cargos de usuários.`,
                ephemeral: true,
            });
        }
        // Verificar se o usuário tem permissão para usar o comando
        if (!memberPermissions?.has(PermissionFlagsBits.Administrator) &&
            !memberPermissions?.has(PermissionFlagsBits.MuteMembers)) {
            return interaction.reply({
                content: `${settings.emojis.static.failed} Você não tem permissão para usar este comando.`,
                ephemeral: true,
            });
        }
        const category = options.getString("category", true).trim();
        const key = options.getString("key", true).trim();
        const value = options.getString("value", true).trim();

        // Checar se os parâmetros são válidos
        if (!category || !key || !value) {
            return interaction.reply({
                content: `${settings.emojis.static.failed} Categoria, chave e valor são obrigatórios.`,
                ephemeral: true,
            });
        }

        const allowedCategories = {
            cargos: ["mutado", "membro", "naoverificado"],
        };
        // Checar se a categoria é válida
        const guildSchema = await db.guilds.findOne({});

        if (!guildSchema || !(category in guildSchema)) {
            return interaction.reply({
            content: `${settings.emojis.static.failed} A categoria **${category}** não é válida.`,
            ephemeral: true,
            });
        }
        // Checar se a chave é válida
        const allowedKeys = allowedCategories[category as keyof typeof allowedCategories];

        if (!allowedKeys || !allowedKeys.includes(key)) {
            return interaction.reply({
                content: `${settings.emojis.static.failed} A chave **${key}** não é válida para a categoria **${category}**.\nChaves permitidas: **${allowedKeys?.join(", ") || "Nenhuma"}.**`,
                ephemeral: true,
            });
        }

        // Atualizar o valor no banco de dados
        try {
            // Ex: { "cargos.mutado": value }
            const updatePath = `${category}.${key}`;

            await db.guilds.updateOne(
                { id: guildId },
                { $set: { [updatePath]: value } },
                { upsert: true }
            );

            return interaction.reply({
                content: `${settings.emojis.static.success} Configurado: **${category}.${key}** -> \`${value}\``,
                ephemeral: true,
            });
        } catch (error) {
            console.error("Erro ao salvar configuração:", error);
            return interaction.reply({
                content: `${settings.emojis.static.failed} Ocorreu um erro ao salvar a configuração. Por favor, tente novamente mais tarde.`,
                ephemeral: true,
            });
        }
    }
});