import { createCommand } from "#base";
import { db } from "#database";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { fetchSkinInfo, fetchSkinRender, skinRoute } from "@magicyan/minecraft";
import { ApplicationCommandType } from "discord.js";
import { menus } from "discord/menus/index.js";

// Cache simples para skins: key = jogador.toLowerCase()
const skinCache = new Map<
  string,
  {
    info: any; // SkinInfo
    renderUrl: string;
    expiresAt: number;
  }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export default createCommand({
  name: "skin",
  description:
    "Pegar informações da skin do jogador de Minecraft: /skin <jogador>",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "jogador",
      description: "Nome de usuário no Minecraft",
      type: 3, // STRING
      required: true,
    },
  ],
  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: true });

    const jogador = interaction.options.getString("jogador", true).trim();
    if (!/^[\w\d_]{3,16}$/.test(jogador)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} Nome inválido — use 3–16 letras, números ou underscore.`,
      });
    }

    const guildId = interaction.guild?.id;
    if (!guildId) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} Este comando só pode ser usado em servidores.`,
      });
    }

    // Configurações de cargo
    const currentGuild = await db.guilds.get(guildId);
    const memberRoleId = currentGuild?.cargos?.membro;
    if (!memberRoleId) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} Cargo de **membro** não configurado. Use \`/config membro <cargo>\`.`,
      });
    }
    const member = interaction.member;
    if (
      !member.roles?.cache.has(memberRoleId) &&
      !member.permissions?.has("Administrator")
    ) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} Você não tem permissão para usar este comando.`,
      });
    }

    try {
      const now = Date.now();
      const key = jogador.toLowerCase();
      let infoData: any;
      let renderUrl: string;

      // 1) Tenta cache
      const cacheEntry = skinCache.get(key);
      if (cacheEntry && cacheEntry.expiresAt > now) {
        infoData = cacheEntry.info;
        renderUrl = cacheEntry.renderUrl;
      } else {
        // 2) Busca informações da skin
        const infoRes = await fetchSkinInfo(jogador);
        if (!infoRes.success) {
          // Se não foi encontrado.
          const msg = "Falha ao buscar informações da skin, provavelmente por que o jogador não encontrado";
          throw new Error(msg);
        }
        infoData = infoRes.data!;

        // 3) Tenta render; se falhar, fallback com skinRoute
        try {
          const renderRes = await fetchSkinRender(jogador);
          if (!(renderRes.success && renderRes.data)) {
            throw new Error();
          }
          // supondo que renderRes.data.url exista
          const url = renderRes.data?.url;
          renderUrl = typeof url === "string" && url.length <= 2048
            ? url
            : skinRoute(jogador, "default");
        } catch {
          // fallback: gera URL diretamente
          renderUrl = skinRoute(jogador, "default");
        }

        // 4) Armazena no cache
        skinCache.set(key, {
          info: infoData,
          renderUrl,
          expiresAt: now + CACHE_TTL,
        });
      }

      // 5) Edita reply com o menu
      return interaction.editReply(menus.skinMenu(infoData, renderUrl));
    } catch (err: any) {
      console.error("[/skin]", err);
      const message = err.message || "Erro inesperado";
      const errorEmbed = (msg: string) => createEmbed({
        title: "Erro ao buscar skin",
        description: `${settings.emojis.static.failed} ${msg}`,
        color: settings.colors.danger,
      });
      return interaction.editReply({
        content: '',
        embeds: [errorEmbed(message)],
      });
    }
  },
});
