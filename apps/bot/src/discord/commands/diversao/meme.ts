import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from "discord.js";
import ky from "ky";

interface Meme {
  title: string;
  url: string;
  ups: number;
  author: string;
  downs: number;
  num_comments: number;
  image: string;
  thumbnail: string;
  is_video: boolean;
  selftext: string;
  created_utc: number;
  secure_media?: any;
  snippets: string[];
}

// function isValidImage(image: string): boolean {
//     // Log para depuração
//     console.log("Verificando URL da imagem:", image);

//     // Verifica se a URL começa com http e se termina com uma extensão de imagem
//     return image.startsWith("http") && (image.includes("reddit.com")) && (image.endsWith(".jpg") || image.endsWith(".png") || image.endsWith(".jpeg") || image.endsWith(".webp"));
// }

function formatNumber(num: number): string {
  const units = ["", "k", "M", "B", "T"];
  let unitIndex = 0;

  while (num >= 1000 && unitIndex < units.length - 1) {
    num /= 1000;
    unitIndex++;
  }

  return num.toFixed(1).replace(/\.0$/, "") + units[unitIndex];
}

export default createCommand({
  name: "meme",
  description: "Mostrar memes com base no que o membro quer: /meme limite: 10",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "limite",
      description: "Número de memes a retornar (máximo de 50)",
      type: ApplicationCommandOptionType.Integer,
      required: false,
      min_value: 1,
      max_value: 50,
    },
  ],
  async run(interaction: ChatInputCommandInteraction): Promise<any> {
    const limite = interaction.options.getInteger("limite") || 45;

    // Verificar o limite de memes.
    if ((limite && limite < 1) || limite > 50) {
      return interaction.reply({
        content: `${settings.emojis.static.failed} O limite deve ser entre 1 e 50.`,
        ephemeral: true,
      });
    }

    // Enviar a mensagem de carregamento
    await interaction.reply({
      content: `${settings.emojis.anim.loading} **Buscando memes...**`,
      fetchReply: true,
    });

    try {
      const response = await ky.get(`http://localhost:3001/meme`, {
        searchParams: { limit: limite },
        timeout: 5000,
        retry: 2,
      });

      if (response.status !== 200) {
        return interaction.editReply({
          content: `${settings.emojis.static.failed} A api está fora do ar. Tente novamente mais tarde.`,
        });
      }

      const memes = await response.json<Meme[]>();

      if (!Array.isArray(memes) || memes.length === 0) {
        return interaction.editReply({
          content: "Nenhum **meme** encontrado. 😕",
        });
      }

      // Selecionar um meme aleatório
      const usedMemes = new Set<number>();
      let randomMeme;

      do {
        const randomIndex = Math.floor(Math.random() * memes.length);
        if (!usedMemes.has(randomIndex)) {
          usedMemes.add(randomIndex);
          randomMeme = memes[randomIndex];
          break;
        }
      } while (usedMemes.size < memes.length);
      if (!randomMeme) {
        return interaction.editReply({
          content:
            "Não foi possível selecionar um meme aleatório. Tente novamente.",
        });
      }

      const title = randomMeme.title;
      const url = randomMeme.url;
      const author = randomMeme.author || "Desconhecido";
      // Verificar e validar a URL da imagem
      const image = randomMeme.image || "https://i.imgur.com/1sUqcoA.png";
      // if (!isValidImage(image)) {
      //     console.log("Imagem inválida ou sem extensão válida, usando placeholder");
      //     image = "https://i.imgur.com/1sUqcoA.png"; // Fallback caso a URL da imagem não seja válida
      // }
      // const snippets = randomMeme.snippets || [];
      // const snippetsText = snippets.length > 0 ? snippets.join("\n") : "";
      const ups = randomMeme.ups || 0;
      const downs = randomMeme.downs || 0;
      const comments = randomMeme.num_comments || 0;
      const created_in = randomMeme.created_utc || 0;

      // Criar o embed para o meme
      const embed = createEmbed({
        title: `**${title}**`,
        author: createEmbedAuthor(interaction.user),
        description: `**👍️ Ups:** ${formatNumber(ups)} | **👎️ Downs:** ${formatNumber(downs)} | **💬 Comentários:** ${formatNumber(comments)}`,
        image: image,
        url: url,
        color: settings.colors.yellow,
        footer: {
          text: `
                👤Autor: ${author}`,
        },
        timestamp: created_in ? new Date(created_in * 1000) : undefined,
      });

      // Editar a mensagem para incluir o embed com o meme
      return interaction.editReply({ content: "", embeds: [embed] });
    } catch (error: any) {
      console.error("Erro ao buscar memes:", error);

      return interaction.editReply({
        content:
          "Ocorreu um erro ao buscar os memes. Tente novamente mais tarde.",
      });
    }
  },
});
