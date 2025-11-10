import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';
import { z } from 'zod';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

const aimodels = [
  'llama-3.3-70b-versatile', // melhor: 70B parâmetros, mais versátil
  'llama-3.1-8b-instant', // mais rápido: 8B parâmetros, respostas instantâneas
  'openai/gpt-oss-120b', // maior: 120B parâmetros, mais poderoso
  'moonshotai/kimi-k2-instruct', // alternativa: bom para instruções
] as const;

const defaultmodel = 'llama-3.3-70b-versatile';

const schema = z.object({
  prompt: z
    .string()
    .min(1, { message: 'Minimo 1 caracteres' })
    .max(900, { message: 'Máximo 900 caracteres' }),
  models: z.enum(aimodels).optional(),
});

export default createCommand({
  name: 'ai',
  description:
    'Gere algo usando Inteligencia Artificial: /ai prompt: qual é a fração de PI? model: gpt4',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'prompt',
      description: 'O que deve ser gerado.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'models',
      description: 'Modelos da IA que vão ser usados',
      type: ApplicationCommandOptionType.String,
      choices: aimodels.map((model) => ({ name: model, value: model })),
      required: false,
    },
  ],
  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: true });
    const promptOpt = interaction.options.getString('prompt', true);
    const modelsOpt =
      interaction.options.getString('models', false) || defaultmodel;

    const parsed = schema.safeParse({ prompt: promptOpt, models: modelsOpt });
    if (!parsed.success) {
      return await interaction.editReply({
        content: `${settings.emojis.static.failed} - Erro ao validar: ${parsed.error}`,
      });
    }
    const { prompt, models } = parsed.data;
    const selectedModel = groq(models ?? defaultmodel);
    const { text } = await generateText({
      model: selectedModel,
      system: 'Você é um assistente amigável, generoso e fofo.',
      prompt,
      maxOutputTokens: 1000, // Limite de tokens para evitar respostas muito longas
      tools: { browser_search: groq.tools.browserSearch({}) },
    });

    const embed = createEmbed({
      title: `${settings.emojis.static.cutecat} - IA ${models}`,
      color: settings.colors.yellow,
      description: text.length > 4000 ? text.substring(0, 4000) + '...' : text,
      author: createEmbedAuthor(interaction.user),
      timestamp: new Date(),
      footer: {
        text: `Modelo: ${models} • Analise criteriosamente o conteúdo gerado por IA.`,
      },
    });
    return interaction.editReply({ embeds: [embed] });
  },
});
