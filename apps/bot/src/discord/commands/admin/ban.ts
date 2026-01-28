import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  PermissionFlagsBits,
  User,
} from 'discord.js';
import { z } from 'zod';
const schema = z.object({
  alvo: z.custom<User>((val) => val instanceof User, {
    message: 'Usuário inválido.',
  }),
  motivo: z.string(),
});

export default createCommand({
  name: 'ban',
  description: 'Banir membros da guilda: /ban alvo: @alvo motivo: Motivo Aqui.',
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.BanMembers,
  options: [
    {
      name: 'alvo',
      description: 'Alvo que vai ser banido.',
      type: ApplicationCommandOptionType.User,
      required,
    },
    {
      name: 'motivo',
      description: 'Motivo para o alvo ser banido',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  async run(interaction) {
    const { guild, user, options } = interaction;
    const botMe = guild?.members.me;
    await interaction.deferReply({ ephemeral: true });

    if (!botMe?.permissions.has(PermissionFlagsBits.BanMembers)) {
      interaction.editReply({
        content: '❌ Eu estou sem permissão para banir usuários!',
      });
      return;
    }
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      interaction.editReply({
        content: `${settings.emojis.static.failed} Você não tem permissão para usar este comando.`,
      });
      return;
    }

    const target = options.getUser('alvo');
    const reason = options.getString('motivo');
    const parsed = schema.safeParse({ alvo: target, motivo: reason });
    if (!parsed.success) {
      interaction.editReply({
        content: `${settings.emojis.static.failed} Por favor, especifique os parametros corretamente (alvo, motivo).`,
      });
      return;
    }
    const { alvo, motivo } = parsed.data;
    const targetMember = guild.members.cache.get(alvo.id);
    const botMember = guild.members.me;
    if (!targetMember) {
      interaction.editReply({
        content: `${settings.emojis.static.failed} Alvo provavelmente não existe.`,
      });
      return;
    }
    if (!targetMember?.bannable) {
      interaction.editReply({
        content: `${settings.emojis.static.failed} Eu não consigo banir este membro, pois ele não é banivel, abortando...`,
      });
      return;
    }
    if (targetMember.id === user?.id) {
      interaction.editReply({
        content: `${settings.emojis.static.failed} Você não pode banir você mesmo.`,
      });
      return;
    }
    if (targetMember.id === botMe?.id) {
      interaction.editReply({
        content: `${settings.emojis.static.failed} Eu não posso me banir.`,
      });
      return;
    }
    if (targetMember.roles.highest.position >= botMe?.roles.highest.position) {
      interaction.editReply({
        content: `${settings.emojis.static.failed} Não posso banir este membro, pois ele tem um cargo mais alto ou igual ao meu.`,
      });
      return;
    }
    if (!botMember || !botMember.roles.highest) {
      interaction.editReply({
        content: `${settings.emojis.static.failed} Meu cargo não é alto suficiente.`,
      });
      return;
    }
    try {
      await targetMember?.ban({
        reason: motivo,
      });
      const embed = createEmbed({
        author: createEmbedAuthor(interaction.user),
        title: `${settings.emojis.anim.manopla} ${alvo.username} foi banido(a)`,
        description: `${settings.emojis.static.moderador} Banido(a) por: ${interaction.user.tag}\n${settings.emojis.static.reason} Motivo: ${motivo}`,
        fields: [
          {
            name: 'Tipo de Usuário',
            value: targetMember.user.bot
              ? `${settings.emojis.static.bot} Bot`
              : `${settings.emojis.static.member} Membro`,
            inline: true,
          },
          {
            name: 'ID do Usuário',
            value: alvo.id,
            inline: true,
          },
        ],
        color: settings.colors.magic,
        timestamp: new Date(),
      });
      interaction.editReply({
        content: '',
        embeds: [embed],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: `${settings.emojis.static.failed} Falha ao tentar banir`,
        ephemeral: true,
      });
    }
  },
});
