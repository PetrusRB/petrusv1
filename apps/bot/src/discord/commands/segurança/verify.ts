import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed } from '@magicyan/discord';
import {
  ApplicationCommandType,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';
import { db, repos } from '#database';
import { getLocale, t } from 'i18n/index.ts';
import { ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { Locale } from 'discord.js';
import { res } from '#functions';

export default createCommand({
  name: 'verify',
  description: 'Gerenciador do sistema de verificação.',
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.BanMembers,
  options: [
    {
      name: 'create-channel',
      description: 'Cria o canal de verificação',
      type: 1,
    },
    {
      name: 'delete-channel',
      description: 'Deleta o canal de verificação',
      type: 1,
    },
    {
      name: 'send-embed',
      description: 'Envia o embed de verificação',
      type: 1,
      options: [
        {
          name: 'channel',
          description: 'Seleciona um canal',
          type: 7,
          channel_types: [ChannelType.GuildText],
          required: true,
        },
      ],
    },
  ],
  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: true });
    const locale = getLocale(interaction.locale);
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // Carrega a guild do banco uma única vez
    const guildData = await repos.guild.getById(guildId);

    switch (sub) {
      case 'create-channel':
        return handleCreateChannel(interaction, guildData, locale);

      case 'delete-channel':
        return handleDeleteChannel(interaction, guildData, locale);

      case 'send-embed':
        return handleSendEmbed(interaction, guildData, locale);

      default:
        return interaction.editReply({
          content: `${settings.emojis.static.failed} Subcomando inválido.`,
        });
    }
  },
});

/**
 * Cria o canal de verificação
 */
async function handleCreateChannel(
  interaction: any,
  guildData: any,
  locale: any
): Promise<any> {
  // Verifica se já existe
  if (guildData.canais?.verificado) {
    return interaction.editReply(
      res.danger(
        `${settings.emojis.static.failed} ${t(
          locale,
          'commands.verify.errors.channel_already_exists'
        )}`
      )
    );
  }

  // Cria o canal
  const created = await interaction.guild.channels.create({
    name: settings.verification_channel,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: interaction.guild.id, // @everyone
        deny: [
          'SendMessages',
          'AddReactions', // Previne reações desnecessárias
          'CreatePublicThreads',
          'CreatePrivateThreads',
        ],
        allow: ['ViewChannel', 'ReadMessageHistory'],
      },
      {
        id: interaction.client.user.id, // Bot
        allow: [
          'ViewChannel',
          'SendMessages',
          'EmbedLinks',
          'ReadMessageHistory',
          'ManageMessages', // Para limpar mensagens se necessário
        ],
      },
    ],
  });

  // Atualiza apenas os campos necessários
  await repos.guild.set(interaction.guild.id, {
    'canais.verificado': created.id,
    'verification.guildId': interaction.guild.id,
    'verification.channelId': created.id,
  } as any);

  return interaction.editReply(
    res.success(
      `${settings.emojis.static.success} ${t(
        locale,
        'commands.verify.success.created'
      )}`
    )
  );
}

/**
 * Deleta o canal de verificação
 */
async function handleDeleteChannel(
  interaction: any,
  guildData: any,
  locale: any
): Promise<any> {
  // Verifica se existe canal configurado
  if (!guildData.canais?.verificado) {
    return interaction.editReply(
      res.danger(
        `${settings.emojis.static.failed} ${t(
          locale,
          'commands.verify.errors.channel_not_exists'
        )}`
      )
    );
  }

  // Verifica se o canal existe no Discord
  const channel = interaction.guild.channels.cache.get(
    guildData.canais.verificado
  );

  if (channel) {
    try {
      await channel.delete();
    } catch (error) {
      // Se não conseguir deletar, apenas limpa do banco
      console.error('[verify] Erro ao deletar canal:', error);
    }
  }

  // Limpa os dados do banco apenas se necessário
  const needsUpdate =
    guildData.canais?.verificado ||
    guildData.verification?.channelId ||
    guildData.verification?.messageId;

  if (needsUpdate) {
    await repos.guild.set(interaction.guild.id, {
      'canais.verificado': '',
      'verification.channelId': '',
      'verification.messageId': '',
    } as any);
  }

  return interaction.editReply({
    content: `${settings.emojis.static.success} ${t(
      locale,
      'commands.verify.success.delete_channel'
    )}`,
  });
}

/**
 * Envia o embed de verificação
 */
async function handleSendEmbed(
  interaction: any,
  guildData: any,
  locale: any
): Promise<any> {
  const channel = interaction.options.getChannel('channel') as TextChannel;

  if (!channel) {
    return interaction.editReply(
      res.danger(
        `${settings.emojis.static.failed} ${t(
          locale,
          'commands.verify.errors.invalid_channel'
        )}`
      )
    );
  }

  // Verifica permissões do bot no canal
  const permissions = channel.permissionsFor(interaction.guild.members.me!);
  if (!permissions?.has(['SendMessages', 'EmbedLinks', 'ViewChannel'])) {
    return interaction.editReply(
      res.danger(
        `${settings.emojis.static.failed} Não tenho permissões suficientes neste canal.`
      )
    );
  }

  // Cria embed e botão
  const embed = createEmbed({
    color: settings.colors.yellow,
    title: t(locale, 'commands.verify.embed.title'),
    description: t(locale, 'commands.verify.embed.description'),
  });
  const prefix = (action: string) => `verify/${action}/0`;

  const verifyBtn = new ButtonBuilder()
    .setCustomId(prefix('user'))
    .setEmoji(settings.emojis.static.verified)
    .setLabel(t(locale, 'commands.verify.button.label'))
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyBtn);

  // Envia a mensagem
  const msg = await channel.send({
    embeds: [embed],
    components: [row],
  });

  // Atualiza apenas se os valores mudaram
  const needsUpdate =
    guildData.verification?.channelId !== channel.id ||
    guildData.verification?.messageId !== msg.id ||
    guildData.verification?.guildId !== interaction.guild.id;

  if (needsUpdate) {
    await repos.guild.set(interaction.guild.id, {
      'verification.guildId': interaction.guild.id,
      'verification.channelId': channel.id,
      'verification.messageId': msg.id,
    } as any);
  }

  return interaction.editReply({
    content: `${settings.emojis.static.success} ${t(
      locale,
      'commands.verify.success.embed_sent'
    )}`,
  });
}
