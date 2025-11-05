import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from 'discord.js';
import ky from 'ky';
import { z } from 'zod';

const API_BASE_URL = 'https://v2.jokeapi.dev';
// Categorias de piadas
const categories = [
  'Programming',
  'Misc',
  'Pun',
  'Spooky',
  'Christmas',
  'Dark',
] as const;

// Idiomas suportados
const languages = ['pt', 'en'] as const;
type Language = (typeof languages)[number];

// Schema Zod para validar a resposta da JokeAPI
const jokeSchema = z.union([
  z.object({
    category: z.string(),
    type: z.literal('single'),
    joke: z.string(),
  }),
  z.object({
    category: z.string(),
    type: z.literal('twopart'),
    setup: z.string(),
    delivery: z.string(),
  }),
]);

export default createCommand({
  name: 'piada',
  description: 'Faz piadas até o usuário morrer de ri :) : /piada',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'quantidade',
      description: 'Quantas piadas retornar (máx 10)',
      type: ApplicationCommandOptionType.Integer,
      required: false,
      minValue: 1,
      maxValue: 10,
    },
    {
      name: 'categoria',
      description: 'Escolha a categoria da piada',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: categories.map((cat) => ({ name: cat, value: cat })),
    },
    {
      name: 'idioma',
      description: 'Escolha o idioma da piada',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: languages.map((lang) => ({ name: lang, value: lang })),
    },
  ],
  async run(interaction: ChatInputCommandInteraction): Promise<any> {
    const quantidade = interaction.options.getInteger('quantidade') || 1;
    const categoria = (interaction.options.getString('categoria') ||
      'Any') as string;
    const idioma = (interaction.options.getString('idioma') ||
      'pt') as Language;

    // Enviar a mensagem de carregamento
    await interaction.deferReply({ ephemeral: true });

    try {
      const jokesPromises = Array.from({ length: quantidade }).map(() =>
        ky
          .get(`${API_BASE_URL}/joke/${categoria}`, {
            searchParams: { lang: idioma },
            timeout: 5000,
          })
          .json()
      );

      const jokesData = await Promise.all(jokesPromises);
      // Validar e filtrar piadas válidas
      const jokes: z.infer<typeof jokeSchema>[] = jokesData
        .map((data) => {
          const parse = jokeSchema.safeParse(data);
          if (parse.success) return parse.data;
          return null;
        })
        .filter(Boolean) as z.infer<typeof jokeSchema>[];

      if (jokes.length === 0) {
        return interaction.editReply({
          content: `${settings.emojis.static.failed} Nenhuma piada válida encontrada.`,
        });
      }

      // Criar o embed para o meme
      const embeds = jokes.map((j) => {
        const description =
          j.type === 'single'
            ? j.joke
            : `**Setup:** ${j.setup}\n**Delivery:** ${j.delivery}`;
        return createEmbed({
          title: `${j.category}`,
          description,
          color: settings.colors.yellow,
          author: createEmbedAuthor(interaction.user),
        });
      });

      // Editar a mensagem para incluir o embed com o meme
      return interaction.editReply({ content: '', embeds });
    } catch (error: any) {
      console.error('Erro ao buscar memes:', error);

      return interaction.editReply({
        content:
          'Ocorreu um erro ao buscar os memes. Tente novamente mais tarde.',
      });
    }
  },
});
