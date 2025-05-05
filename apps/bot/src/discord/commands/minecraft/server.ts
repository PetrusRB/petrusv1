import { createCommand } from "#base";
import { db } from "#database";
import { settings } from "#settings";
import { fetchServerStatus } from "@magicyan/minecraft";
import { ApplicationCommandType } from "discord.js";
import { menus } from "discord/menus/index.js";

export default createCommand({
  name: "mine",
  description:
    "Verificar se o servidor de minecraft está online: /mine <tipo> <ip>",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "tipo",
      description: "Tipo de servidor",
      type: 3,
      choices: [
        { name: "Java", value: "java" },
        { name: "Bedrock", value: "bedrock" },
      ],
      required: true,
    },
    {
      name: "ip",
      description: "Ip do servidor",
      type: 3,
      required: true,
    },
  ],
  async run(interaction): Promise<any> {
    const { options, guild } = interaction;
    const type = options.getString("tipo", true);
    const ip = options.getString("ip", true);
    const guildId = guild.id;

    const currentGuildDB = await db.guilds.get(guildId);
    const memberrole = currentGuildDB?.cargos?.membro;

    if (!ip && !type) {
      return interaction.reply({
        content: `${settings.emojis.static.failed} Por favor, especifique os parametros corretamente (tipo e ip).`,
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: `${settings.emojis.anim.loading} Carregando...`,
      ephemeral: true,
      fetchReply: true,
    });

    if (!memberrole) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} O cargo de **membro** não está configurado. Use /config membro <cargo> para configurar.`,
      });
    }
    if (
      !interaction.member.roles.cache.has(memberrole) &&
      !interaction.member.permissions.has("Administrator")
    ) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} Você não tem permissão para usar este comando.`,
      });
    }

    const server = await fetchServerStatus(
      ip,
      type === "bedrock" ? true : false,
    ).catch(() => null);
    if (!server) {
      return interaction.reply({
        content: `${settings.emojis.static.failed} Servidor ${type} ${ip} não encontrado.`,
        ephemeral: true,
      });
    }

    await interaction.editReply(menus.serverMenu(server, type));
  },
});
