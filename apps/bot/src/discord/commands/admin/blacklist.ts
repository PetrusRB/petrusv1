import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed } from '@magicyan/discord';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  User,
} from 'discord.js';
import { repos } from '#database';
import { res } from '#functions';

export default createCommand({
  name: 'blacklist',
  description: 'Adiciona um usuário à blacklist e o expulsa do servidor',
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.BanMembers,
  options: [
    {
      name: 'add',
      description: 'Adiciona um usuário à blacklist',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'usuario',
          description: 'Usuário que será colocado na blacklist',
          type: ApplicationCommandOptionType.User,
          required: false,
        },
        {
          name: 'id',
          description: 'ID do usuário (caso não esteja no servidor)',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: 'motivo',
          description: 'Motivo da blacklist',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: 'remove',
      description: 'Remove um usuário da blacklist',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'usuario',
          description: 'Usuário que será removido da blacklist',
          type: ApplicationCommandOptionType.User,
          required: false,
        },
        {
          name: 'id',
          description: 'ID do usuário',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: 'listar',
      description: 'Lista todos os usuários na blacklist',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  async run(interaction: ChatInputCommandInteraction): Promise<any> {
    const { guild, user, options } = interaction;
    const botMe = guild?.members.me;
    const subcommand = options.getSubcommand();

    if (!guild || !botMe) {
      return interaction.reply({
        content: `${settings.emojis.static.failed} Este comando só pode ser usado em um servidor.`,
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    if (!botMe.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} Eu não tenho permissão para expulsar membros.`,
      });
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} Você não tem permissão para usar este comando.`,
      });
    }

    if (subcommand === 'add') {
      const target = options.getUser('usuario', true);
      const motivo =
        options.getString('motivo') ?? 'Usuário colocado na blacklist';

      const member = await guild.members.fetch(target.id).catch(() => null);

      if (!member) {
        return interaction.editReply({
          content: `${settings.emojis.static.failed} Não foi possível encontrar este membro no servidor.`,
        });
      }
      /** Salva na blacklist (db) */
      await repos.guild.addToBlacklistUser(guild.id, target.id);

      if (member.roles.highest.position >= botMe.roles.highest.position) {
        await interaction.editReply({
          content: `${settings.emojis.static.failed} Não posso expulsar esse usuário por hierarquia de cargos, porem ele(a) foi colocado na blacklist`,
        });
      } else {
        /** Expulsa */
        await member.kick(`Blacklist: ${motivo}`);
      }

      /** Feedback */
      const embed = createEmbed({
        title: '🚫 Usuário colocado na Blacklist',
        color: settings.colors.danger,
        fields: [
          { name: 'Usuário', value: `${target.tag}`, inline: true },
          { name: 'ID', value: target.id, inline: true },
          { name: 'Motivo', value: motivo },
          { name: 'Ação', value: 'Expulso do servidor', inline: true },
          { name: 'Responsável', value: `${user.tag}`, inline: true },
        ],
        timestamp: new Date(),
      });

      await interaction.editReply({ embeds: [embed] });

      console.log(
        `[BLACKLIST] ${target.tag} (${target.id}) foi colocado na blacklist por ${user.tag}`
      );
    }

    if (subcommand === 'remove') {
      const userOption = options.getUser('usuario');
      const idOption = options.getString('id');

      const targetId = userOption?.id ?? idOption;

      if (!targetId) {
        return interaction.editReply({
          content: `${settings.emojis.static.failed} Informe um usuário ou um ID.`,
        });
      }

      await repos.guild.removeFromBlacklistUser(guild.id, targetId);
      await interaction.editReply(
        res.success(`<h1>Usuário **${targetId}** removido da blacklist!</h1>`)
      );
    }

    if (subcommand === 'listar') {
      const guildData = await repos.guild.getById(guild.id);
      const list: string[] = guildData?.blacklist?.users ?? [];

      if (!list.length) {
        return interaction.editReply({
          content: `${settings.emojis.static.success} A blacklist está vazia.`,
        });
      }

      const formatted = list.map((id) => `• <@${id}> (\`${id}\`)`).join('\n');

      const embed = createEmbed({
        title: '🚫 Blacklist do Servidor',
        description: formatted,
        color: settings.colors.danger,
        footer: { text: `Total: ${list.length}` },
        timestamp: new Date(),
      });

      await interaction.editReply({ embeds: [embed] });
    }
  },
});
