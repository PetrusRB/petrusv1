import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed } from '@magicyan/discord';
import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from 'discord.js';

export default createCommand({
  name: 'avatar',
  description: 'Mostra o avatar do usuário bem bonitinho.',
  type: ApplicationCommandType.ChatInput,
  async run(interaction: ChatInputCommandInteraction): Promise<any> {
    const { member } = interaction;
    const avatar_url = member?.avatar;
    await interaction.deferReply({ ephemeral: true });
    const phrases: string[] = [
      'Você continua sendo mais forte do que imagina 💪✨',
      'Ei, respira... você tá indo bem 🌸',
      'Mesmo nos dias nublados, você continua a brilhar ☁️🌞',
      'Um passo de cada vez, ok? Você é capaz 🐾',
      'Petrus confia em você, e saiba que ele é bastante criterioso 😎💖',
      'O progresso pode ser lento, mas ainda é progresso 🌱',
      'Você é como um bug corrigido: finalmente funcionando e lindo 💻💕',
      'Até o sol descansa de vez em quando... se cuida 🌙',
      'Não desista agora, você já chegou muito longe 🌠',
      'Você é uma mistura de coisas boas — só precisa funcionar com paciência 🧩💫',
      'Pausa para recordar: você é incrível, mesmo quando se esquece disso 🌷',
      'Você está exatamente no lugar certo para crescer 🌻',
      'O Petrus identificou elevados níveis de fofura e determinação 🐱⚡',
      'Nem tudo precisa ser perfeito para ser bonito 🌈',
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    const embed = createEmbed({
      title: `${settings.emojis.static.awww} - Tu ainda `,
      description: randomPhrase,
      color: settings.colors.yellow,
      image: avatar_url,
    });
    return interaction.editReply({ embeds: [embed] });
  },
});
