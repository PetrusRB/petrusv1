import {
  ButtonBuilder,
  ButtonStyle,
  type InteractionEditReplyOptions,
} from "discord.js";
import { createEmbed, createRow, brBuilder } from "@magicyan/discord";
import { SkinInfo } from "@magicyan/minecraft";
import { settings } from "#settings";

export function skinMenu(
  info: Partial<SkinInfo>,
  renderUrl: string,
): InteractionEditReplyOptions {
  // Validação inicial
  const { skinUrl, playerUUID: uuid } = info;
  const safeUrl = typeof renderUrl === "string" && renderUrl.length <= 2048 ? renderUrl : "https://s.namemc.com/3d/skin/body.png?id=51696e2d4cbfbe4f&model=classic&width=120&height=240";

  if (!uuid || !skinUrl) {
    const missing = [];
    if (!uuid) missing.push("UUID");
    if (!skinUrl) missing.push("skin URL");
    return {
      content: `${settings.emojis.static.failed} Informações faltando: ${missing.join(
        ", ",
      )}`,
    };
  }

  // monta o texto bruto
  const lines = [
    `📜 **UUID do Jogador:** \`${uuid}\``,
    `🌐 **URL da skin original:** \`${skinUrl}\``,
  ].filter(Boolean) as string[];

  const prefix = (
    (base: string) => (action: string) =>
      `mineSkins/${base}/${action}`
  )(uuid);

  const embed = createEmbed({
    color: settings.colors.yellow,
    title: `${settings.emojis.anim.cube} Informações da skin`,
    description: brBuilder(lines),
    image: { url: safeUrl },
  });

  const refreshButton = new ButtonBuilder({
    customId: prefix("refresh"),
    label: "🔄 Atualizar",
    style: ButtonStyle.Primary,
  });
  const searchButton = new ButtonBuilder({
    customId: prefix("search"),
    label: "🔍 Buscar outro",
    style: ButtonStyle.Secondary,
  });

  return {
    embeds: [embed],
    components: [createRow(refreshButton, searchButton)],
  };
}
