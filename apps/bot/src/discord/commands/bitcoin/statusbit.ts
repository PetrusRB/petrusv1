import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction
} from "discord.js";

import { z } from 'zod';

type CoinGeckoResponse = {
    id: string;
    symbol: string;
    name: string;
    image: {
        thumb: string;
        small: string;
        large: string;
    };
    market_data: {
        current_price: {
            usd: number;
            [key: string]: number | undefined;
        };
        market_cap: {
            usd: number;
            [key: string]: number | undefined;
        };
        price_change_percentage_24h: number | null;
        [key: string]: any;
    };
    [key: string]: any;
};
// Lista de moedas locais suportadas
const SUPPORTED_CURRENCIES = ["usd", "brl", "jpy", "eur", "gbp"] as const;

// Mapa de regiões/idiomas por moeda (para formatação)
const LOCALE_MAP: Record<typeof SUPPORTED_CURRENCIES[number], string> = {
    usd: "en-US",
    brl: "pt-BR",
    jpy: "ja-JP",
    eur: "de-DE",
    gbp: "en-GB"
};

// Schema Zod
const commandSchema = z.object({
    moeda: z.string().min(1, { message: "A moeda não pode ser vazia" }),
    moeda_local: z.enum(SUPPORTED_CURRENCIES).default("brl")
});

export default createCommand({
    name: "statusbit",
    type: ApplicationCommandType.ChatInput,
    description: "Ver como as moedas estão",
    options: [
        {
            name: "moeda",
            description: "Símbolo ou id da criptomoeda (ex: bitcoin, ethereum)",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "moeda_local",
            description: "Moeda local para exibir o preço (ex: usd, brl, jpy)",
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    async run(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();


        try {
            // pegar inputs
            const rawInputs = {
                moeda: interaction.options.getString("moeda", true) ?? "",
                moeda_local: interaction.options.getString("moeda_local") ?? undefined
            };

            // validação Zod
            const validated = commandSchema.safeParse(rawInputs);
            if (!validated.success) {
                const errorMessage = validated.error.errors.map(err => err.message).join(", ");
                await interaction.editReply({ content: `❌ Erro de validação: ${errorMessage}` });
                return;
            }

            const { moeda, moeda_local } = validated.data;
            const locale = LOCALE_MAP[moeda_local];
            const apiUrl = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(moeda)}`;
            const resp = await fetch(apiUrl);
            if (!resp.ok) {
                await interaction.editReply({ content: `❌ Não foi possível encontrar a moeda **${moeda}**.` });
                return;

            }

            const data = (await resp.json()) as CoinGeckoResponse;

            const price = data.market_data.current_price[moeda_local];
            const marketCap = data.market_data.market_cap[moeda_local];
            const change24h = data.market_data.price_change_percentage_24h;
            const image: string = data.image.small;
            if (price === undefined) {
                await interaction.editReply({ content: `❌ A moeda local "${moeda_local}" não é suportada.` });
                return;
            }
            // Formatação automática com símbolo correto
            const formatCurrency = (value: number) =>
                new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: moeda_local.toUpperCase()
                }).format(value);

            const embed = createEmbed({
                title: `${data.name} (${data.symbol.toUpperCase()})`,

                thumbnail: { url: data.image.large },
                color: settings.colors.developer,
                fields: [
                    {
                        name: `💲 Preço (${moeda_local.toUpperCase()})`,
                        value: formatCurrency(price),
                        inline: true
                    },
                    {
                        name: `📊 Market Cap (${moeda_local.toUpperCase()})`,
                        value: marketCap ? formatCurrency(marketCap) : "—",
                        inline: true
                    },
                    {
                        name: "🔁 Mudança 24h",
                        value: change24h !== null ? `${change24h.toFixed(2)}%` : "—",
                        inline: true
                    }
                ],
                timestamp: new Date(),
                footer: { text: `Dados pela CoinGecko • ID: ${data.id}`, iconURL: image }
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Erro no comando statusbit:", error);
            await interaction.editReply({ content: "❌ Ocorreu um erro ao consultar a criptomoeda." });
        }
    }
});

