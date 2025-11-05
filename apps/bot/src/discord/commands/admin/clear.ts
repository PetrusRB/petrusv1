import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, ChannelType, ApplicationCommandType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";

import { z } from 'zod'

const schema = z.object({
    quantidade: z.number({
        required_error: "A quantidade é obrigatória",
        invalid_type_error: "A quantidade deve ser um número"
    })
        .min(1, { message: "Minimo 1 mensagem" })
        .max(100, { message: "Maximo 100 mensagems" })
        .refine(
            (value) => value > 0 && value <= 100,
            "A quandidade deve estar entre 1 e 100"
        )
})
type ClearCommandData = z.infer<typeof schema>;

// Mensagems constantes
const ERROR_MESSAGES = {
    INVALID_CHANNEL: `${settings.emojis.static.failed} Este comando só pode ser executado em canais de texto`,
    BOT_PERMISSIONS: `${settings.emojis.static.failed} Não tenho permissão para gerenciar mensagens!`,
    VALIDATION_ERROR: `${settings.emojis.static.failed} Erro de validação:`,
    BULK_DELETE_ERROR: `${settings.emojis.static.failed} Ocorreu um erro ao tentar deletar as mensagens!`,
    NO_MESSAGES: `${settings.emojis.static.failed} Não foi possível encontrar mensagens para deletar!`,
    MESSAGES_TOO_OLD: `${settings.emojis.static.failed} Não é possível deletar mensagens com mais de 14 dias!`,
    MISSING_PERMISSIONS: `${settings.emojis.static.failed} Não tenho permissão para deletar mensagens neste canal!`
} as const;
const SUCCESS_MESSAGES = {
    DELETING: `${settings.emojis.anim.loading} Deletando mensagens...`,
    SUCCESS_TITLE: `${settings.emojis.anim.clean} Limpeza concluída`
} as const;


export default createCommand({
    name: "clear",
    description: "Limpa as mensagens do canal de texto: /clear quantidade: 10",
    options: [
        {
            name: "quantidade",
            description: "Quantidade de mensagens que vão ser deletadas",
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ],
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    async run(interaction: ChatInputCommandInteraction): Promise<any> {
        try {
            const { guild, channel, member } = interaction;

            // Verificação inicial rápida do canal
            if (!channel || channel.type !== ChannelType.GuildText) {
                await interaction.reply({
                    content: ERROR_MESSAGES.INVALID_CHANNEL,
                    ephemeral: true
                });
                return;
            }

            // Verificação de permissões do bot no servidor
            const botMember = guild?.members.me;
            if (!botMember?.permissions.has(PermissionFlagsBits.ManageMessages)) {
                await interaction.reply({
                    content: ERROR_MESSAGES.BOT_PERMISSIONS,
                    ephemeral: true
                });
                return;
            }

            // Verificação de permissões do bot no canal específico
            const botChannelPermissions = channel.permissionsFor(botMember);
            if (!botChannelPermissions?.has(PermissionFlagsBits.ManageMessages)) {
                await interaction.reply({
                    content: ERROR_MESSAGES.MISSING_PERMISSIONS,
                    ephemeral: true
                });
                return;
            }

            // Resposta inicial de loading
            await interaction.reply({
                content: SUCCESS_MESSAGES.DELETING,
                ephemeral: true
            });

            // Validação dos dados de entrada com Zod
            const quantidade = interaction.options.getInteger('quantidade', true);

            const validationResult = schema.safeParse({ quantidade });

            if (!validationResult.success) {
                const errorMessage = validationResult.error.errors
                    .map(err => err.message)
                    .join(', ');

                await interaction.editReply({
                    content: `${ERROR_MESSAGES.VALIDATION_ERROR} ${errorMessage}`
                });
                return;
            }

            const validatedData: ClearCommandData = validationResult.data;

            // Execução da deleção em lote
            const deletedMessages = await channel.bulkDelete(validatedData.quantidade, true);

            // Verificação do resultado
            if (deletedMessages.size === 0) {
                await interaction.editReply({
                    content: ERROR_MESSAGES.NO_MESSAGES
                });
                return;
            }

            // Mensagem de sucesso
            const successEmbed = createEmbed({
                title: SUCCESS_MESSAGES.SUCCESS_TITLE,
                description: `**${deletedMessages.size}** mensagens foram deletadas com sucesso`,
                color: settings.colors.green,
                fields: [
                    {
                        name: "Canal",
                        value: `${channel}`,
                        inline: true
                    },
                    {
                        name: "Solicitado por",
                        value: `${member}`,
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: {
                    text: `ID do canal: ${channel.id}`
                }
            });

            await interaction.editReply({
                content: '',
                embeds: [successEmbed]
            });

            // Log opcional no console
            console.log(`[CLEAR] ${deletedMessages.size} mensagens deletadas no canal ${channel.name} (${channel.id}) por ${member?.user.username}`);

        } catch (error) {
            console.error('Erro no comando clear:', error);

            // Tratamento específico de erros do Discord
            let errorContent: (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES] = ERROR_MESSAGES.BULK_DELETE_ERROR;

            if (error instanceof Error) {
                if (error.message.includes("You can only bulk delete messages that are under 14 days old")) {
                    errorContent = ERROR_MESSAGES.MESSAGES_TOO_OLD;
                } else if (error.message.includes("Missing Permissions") || error.message.includes("Missing Access")) {
                    errorContent = ERROR_MESSAGES.MISSING_PERMISSIONS;
                }
            }

            // Tenta editar a mensagem de loading, se não conseguir, envia nova mensagem
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ content: errorContent });
                } else {
                    await interaction.reply({
                        content: errorContent,
                        ephemeral: true
                    });
                }
            } catch (editError) {
                console.error('Erro ao enviar mensagem de erro:', editError);
            }
        }
    }
});
