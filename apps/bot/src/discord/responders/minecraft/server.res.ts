import { createResponder, ResponderType } from "#base";
import { createModalFields, includesIgnoreCase, modalFieldsToRecord } from "@magicyan/discord";
import { fetchServerStatus } from "@magicyan/minecraft";
import { menus } from "discord/menus/index.js";

createResponder({
    customId: "servers/:tipo/:action/:ip",
    types: [ResponderType.Button, ResponderType.ModalComponent], cache: "cached",
    async run(interaction, {tipo, ip, action }) {
        if (interaction.isModalSubmit()) {
            await interaction.deferUpdate();

            const fields = modalFieldsToRecord<"ip" | "tipo">(interaction.fields);
            const isBedrock = includesIgnoreCase(fields.tipo, "bedrock") || includesIgnoreCase(fields.tipo, "Bedrock");

            const info = await fetchServerStatus(fields.ip, isBedrock);
            await interaction.editReply(
                menus.serverMenu(info, isBedrock ? "bedrock" : "java")
            );
            return;
        }
        switch (action) {
            case "refresh": {
                await interaction.deferUpdate();

                const isBedrock = includesIgnoreCase(tipo, "bedrock");
                const info = await fetchServerStatus(ip, isBedrock);
                await interaction.editReply(
                    menus.serverMenu(info, isBedrock ? "bedrock" : "java")
                );
                return;
            }
            case "search": {
                await interaction.showModal({
                    customId: interaction.customId,
                    title: "Pesquisar servidor",
                    components: createModalFields({
                        ip: {
                            label: "IP do servidor",
                            placeholder: "Ex: mc.hypixel.net",
                            required: true,
                            minLength: 3
                        },
                        tipo: {
                            label: "Tipo de servidor",
                            value: "java",
                            placeholder: "Ex: bedrock (em letras menusuculas)",
                            required: false
                        }
                    })
                })
            }
        }
    },
});