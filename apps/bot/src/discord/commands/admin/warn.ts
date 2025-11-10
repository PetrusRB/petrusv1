import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  PermissionFlagsBits,
} from 'discord.js';

import { z } from 'zod';

const schema = z.object({
  motivo: z
    .string()
    .min(1, { message: 'Minimo de 1 caracteres' })
    .max(100, { message: 'Maximo de 100 caracteres' }),
});

export default createCommand({
  name: 'warn',
  description:
    'Da um aviso para um usuário especifico: /warn @usuário motivoaqui',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuário',
      description: 'Usuário para ser avisado',
      type: 6,
      required: true,
    },
    {
      name: 'motivo',
      description: 'Motivo para o usuário ser avisado',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });

    const userOpt = interaction.options.getUser('usuário', true);
    const reasonOpt = interaction.options.getString('motivo');
    const staff = interaction.user;
    const parsed = schema.safeParse({ motivo: reasonOpt });

    if (!parsed.success) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} **Falha ao tentar validar seu motivo **`,
      });
    }

    const data = parsed.data;
    const embedDM = createEmbed({
      color: settings.colors.warning,
      title: '⚠️ Aviso de Moderação',
      description: [
        `Você recebeu um **aviso oficial** no servidor **${interaction.guild?.name}**.`,
        '',
        `> **Motivo:** ${data.motivo}`,
        `> **Responsável:** ${staff.tag}`,
      ].join('\n'),
      footer: { text: 'Mantenha o comportamento adequado no servidor.' },
      timestamp: new Date(),
    });

    // Envia a DM
    let dmStatus = '✅ Warn enviado com sucesso.';
    try {
      await userOpt.send({ embeds: [embedDM] });
    } catch {
      dmStatus = '⚠️ O usuário bloqueou DMs. Warn não entregue.';
    }

    // Embed de resposta
    const embedReply = createEmbed({
      color: settings.colors.primary,
      title: 'Warn aplicado',
      description: [
        `O usuário **${userOpt.tag}** recebeu um warn.`,
        '',
        `> **Motivo:** ${data.motivo}`,
        `> **Status da DM:** ${dmStatus}`,
      ].join('\n'),
      footer: { text: `Executor: ${staff.tag}` },
      timestamp: new Date(),
    });

    return await interaction.editReply({
      embeds: [embedReply],
    });
  },
});
