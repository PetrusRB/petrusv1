import { createResponder, ResponderType } from "#base";
import { settings } from "#settings";
import {
  createEmbed,
  createModalFields,
  modalFieldsToRecord,
} from "@magicyan/discord";
import {
  fetchSkinInfo,
  fetchSkinRender,
  type FetchSkinInfoResult,
  type FetchSkinRenderResult,
  type SkinInfo,
} from "@magicyan/minecraft";
import { menus } from "discord/menus/index.js";

// Cache mantém o objeto SkinInfo e a URL de render
const skinResponderCache = new Map<
  string,
  {
    info: SkinInfo;
    renderUrl: string;
    expiresAt: number;
  }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5m

createResponder({
  customId: "mineSkins/:jogador/:action",
  types: [ResponderType.Button, ResponderType.ModalComponent],
  cache: "cached",
  async run(interaction, { jogador, action }): Promise<any> {
    const errorEmbed = (msg: string) =>
      createEmbed({
        title: "Erro ao buscar skin",
        description: `${settings.emojis.static.failed} ${msg}`,
        color: settings.colors.danger,
      });

    // Faz fetch + cache
    const getSkin = async (player: string) => {
      const key = player.toLowerCase();
      const now = Date.now();
      const cached = skinResponderCache.get(key);
      if (cached && cached.expiresAt > now) {
        return cached;
      }

      // 1) Fetch info
      const infoRes: FetchSkinInfoResult = await fetchSkinInfo(player);
      if (!infoRes.success) {
        throw new Error(
          infoRes.error?.includes("not found")
            ? "Jogador não encontrado"
            : "Falha ao buscar informações da skin",
        );
      }
      const info = infoRes.data as SkinInfo;

      // 2) Fetch render
      const renderRes: FetchSkinRenderResult = await fetchSkinRender(player);
      if (!renderRes.success || !renderRes.data) {
        throw new Error("Falha ao buscar imagem da skin");
      }
      const renderUrl = renderRes.data.buffer.toString("base64");

      // 3) Cacheia
      const entry = { info, renderUrl, expiresAt: now + CACHE_TTL };
      skinResponderCache.set(key, entry);
      return entry;
    };

    // Exibe ou erro
    const displaySkin = async (player: string) => {
      try {
        // Garante que já exista uma reply para editar
        if (!interaction.deferred && !interaction.replied) {
          await interaction.deferReply({ ephemeral: true });
        }
        const { info, renderUrl } = await getSkin(player);
        // Passa SkinInfo e string URL
        await interaction.editReply(menus.skinMenu(info, renderUrl));
      } catch (err: any) {
        console.error("[mineSkins]", err);
        const embed = errorEmbed(err.message || "Erro inesperado");
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ embeds: [embed] });
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    };

    // Se veio do modal
    if (interaction.isModalSubmit()) {
      await interaction.deferUpdate();
      const fields = modalFieldsToRecord<"jogador">(interaction.fields);
      const name = fields.jogador?.trim() ?? "";

      if (!/^[\w\d_]{3,16}$/.test(name)) {
        return interaction.editReply({
          embeds: [
            createEmbed({
              title: "Nome inválido",
              description: `${settings.emojis.static.failed} Use 3–16 caracteres: letras, números ou underscore.`,
              color: settings.colors.danger,
            }),
          ],
        });
      }
      return displaySkin(name);
    }

    // Se veio de botão
    switch (action) {
      case "refresh":
        await interaction.deferUpdate();
        return displaySkin(jogador);

      case "search":
        return interaction.showModal({
          customId: interaction.customId,
          title: "Pesquisar jogador",
          components: createModalFields({
            jogador: {
              label: "Nome do jogador",
              placeholder: "Ex: Notch",
              required: true,
              minLength: 3,
              maxLength: 16,
            },
          }),
        });

      default:
        return interaction.reply({
          ephemeral: true,
          content: `${settings.emojis.static.failed} Ação inválida.`,
        });
    }
  },
});
