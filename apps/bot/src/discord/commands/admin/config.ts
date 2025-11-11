import { createCommand } from '#base';
import { settings } from '#settings';
import {
  ApplicationCommandType,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} from 'discord.js';
import { db } from '#database';
import { z } from 'zod';
import { createEmbed } from '@magicyan/discord';

// Tipos para metadados
type ConfigType = 'role' | 'channel' | 'text' | 'boolean';

interface ConfigMetadataItem {
  type: ConfigType;
  description: string;
  checkManaged?: boolean;
  checkHierarchy?: boolean;
  checkPermissions?: boolean;
  requireText?: boolean;
}

type ConfigMetadata = {
  [category: string]: {
    [key: string]: ConfigMetadataItem;
  };
};

// Metadados de configuração
const configMetadata: ConfigMetadata = {
  welcome: {
    role: {
      type: 'boolean',
      description: 'Cargo de entrada/saida',
      checkManaged: false,
      checkHierarchy: false,
    },
    message: {
      type: 'boolean',
      description: 'Mensagem de entrada/saida',
      checkManaged: false,
      checkHierarchy: false,
    },
  },
  cargos: {
    mutado: {
      type: 'role',
      description: 'Cargo aplicado quando um membro é mutado',
      checkManaged: true,
      checkHierarchy: true,
    },
    membro: {
      type: 'role',
      description: 'Cargo dado automaticamente ao entrar',
      checkManaged: true,
      checkHierarchy: true,
    },
    naoverificado: {
      type: 'role',
      description: 'Cargo para membros não verificados',
      checkManaged: true,
      checkHierarchy: true,
    },
  },
  canais: {
    bemvindo: {
      type: 'channel',
      description: 'Canal de mensagens de boas-vindas',
      checkPermissions: true,
      requireText: true,
    },
  },
} as const;

// Extrai as categorias permitidas automaticamente
const allowedCategories: Record<string, string[]> = Object.fromEntries(
  Object.entries(configMetadata).map(([cat, keys]) => [cat, Object.keys(keys)])
);

// schema
const configSchema = z
  .object({
    category: z.enum(
      Object.keys(allowedCategories) as [keyof typeof allowedCategories]
    ),
    key: z.string(),
    value: z
      .string()
      .min(1, 'O valor não pode ser vazio.')
      .max(256, 'Valor muito longo.'),
  })
  .superRefine((data, ctx) => {
    const allowedKeys = allowedCategories[data.category];
    if (!allowedKeys || !allowedKeys.includes(data.key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Chave inválida para a categoria ${
          data.category
        }. Chaves válidas: ${allowedKeys?.join(', ')}`,
        path: ['key'],
      });
    }
  });

// Função de validação flexível baseada em metadados
async function validateConfig(
  guild: any,
  botMe: any,
  category: string,
  key: string,
  value: string
) {
  const metadata = configMetadata[category]?.[key];
  if (!metadata) return { valid: true };

  const warnings: string[] = [];
  const errors: string[] = [];

  // Validação de CANAL
  if (metadata.type === 'channel') {
    const channel = guild.channels.cache.get(value);

    if (!channel) {
      errors.push(
        `Canal com ID \`${value}\` não encontrado.\n💡 **Dica:** Clique com botão direito no canal → Copiar ID`
      );
      return { valid: false, errors };
    }

    if (metadata.requireText && !channel.isTextBased()) {
      errors.push(`${channel} não é um canal de texto válido.`);
      return { valid: false, errors };
    }

    if (metadata.checkPermissions) {
      const permissions = channel.permissionsFor(botMe);
      if (!permissions?.has(PermissionFlagsBits.SendMessages)) {
        warnings.push(
          `Não tenho permissão para enviar mensagens em ${channel}.\nConceda a permissão **Enviar Mensagens** ao bot nesse canal.`
        );
      }
    }
  }

  // Validação de CARGO
  if (metadata.type === 'role') {
    const role = guild.roles.cache.get(value);

    if (!role) {
      errors.push(
        `Cargo com ID \`${value}\` não encontrado.\n💡 **Dica:** Configurações do Servidor → Cargos → Clique com botão direito → Copiar ID`
      );
      return { valid: false, errors };
    }

    if (role.id === guild.id) {
      errors.push(`Você não pode configurar o cargo @everyone.`);
      return { valid: false, errors };
    }

    if (metadata.checkManaged && role.managed) {
      errors.push(
        `O cargo ${role} é gerenciado por uma integração e não pode ser atribuído manualmente.`
      );
      return { valid: false, errors };
    }

    if (
      metadata.checkHierarchy &&
      botMe &&
      role.position >= botMe.roles.highest.position
    ) {
      warnings.push(
        `O cargo ${role} está acima ou no mesmo nível do meu cargo mais alto.\nMova meu cargo para uma posição superior para que eu possa gerenciá-lo.`
      );
    }
  }

  return { valid: true, warnings };
}

export default createCommand({
  name: 'config',
  description: 'Configurações do bot',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'definir',
      description: 'Define uma configuração',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'category',
          description: 'Categoria da configuração.',
          type: 3,
          required: true,
        },
        {
          name: 'chave',
          description: 'Chave da configuração.',
          type: 3,
          required: true,
        },
        {
          name: 'valor',
          description: 'Valor da configuração.',
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: 'ver',
      description: 'Ver todas as configurações do servidor',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  async run(interaction): Promise<any> {
    const { guild, options, memberPermissions } = interaction;
    const botMe = guild?.members.me;
    const guildId = guild?.id;
    const subcommand = options.getSubcommand();

    // Verificar se o comando está sendo usado em um servidor
    if (!guildId || !guild) {
      return interaction.reply({
        content: `${settings.emojis.static.failed} Este comando só pode ser usado em um servidor.`,
        ephemeral: true,
      });
    }

    // Verificar se o usuário tem permissão para usar o comando
    if (
      !memberPermissions?.has(PermissionFlagsBits.Administrator) &&
      !memberPermissions?.has(PermissionFlagsBits.MuteMembers)
    ) {
      return interaction.reply({
        content: `${settings.emojis.static.failed} Você não tem permissão para usar este comando.`,
        ephemeral: true,
      });
    }

    // subcomando ver
    if (subcommand === 'ver') {
      const guildConfig = await db.guilds.findOne({ id: guildId });
      const embed = createEmbed({
        title: `⚙️ Configurações do Servidor`,
        description: `Servidor: **${guild.name}**`,
        color: settings.colors.yellow,
        thumbnail: guild.iconURL() || null,
        timestamp: new Date(),
      });

      for (const [category, keys] of Object.entries(configMetadata)) {
        const configValues = (guildConfig as any)?.[category] || {};
        let fieldValue = '';

        for (const [key, meta] of Object.entries(keys)) {
          const value = configValues[key];
          let displayValue = '`Não configurado`';

          if (value) {
            if (meta.type === 'role') {
              const role = guild.roles.cache.get(value);
              displayValue = role ? `${role}` : `\`${value}\` ❌`;
            } else if (meta.type === 'channel') {
              const channel = guild.channels.cache.get(value);
              displayValue = channel ? `${channel}` : `\`${value}\` ❌`;
            } else if (meta.type === 'boolean') {
              displayValue = value === true ? '✅ Ativado' : '❌ Desativado';
            } else {
              displayValue = `\`${value}\``;
            }
          }

          fieldValue += `**${key}:** ${displayValue}\n`;
        }

        if (fieldValue) {
          embed.addFields({
            name: `${category.charAt(0).toUpperCase() + category.slice(1)}`,
            value: fieldValue || 'Nenhuma configuração',
            inline: false,
          });
        }
      }

      embed.setFooter({
        text: 'Use /config definir para alterar as configurações',
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // SUBCOMANDO: DEFINIR
    if (subcommand === 'definir') {
      // Verificar permissões do bot
      if (
        !botMe?.permissions.has([
          PermissionFlagsBits.MuteMembers,
          PermissionFlagsBits.ManageRoles,
        ])
      ) {
        return interaction.reply({
          content: `${settings.emojis.static.failed} Sem permissão para mutar usuários, ou gerenciar cargos de usuários.`,
          ephemeral: true,
        });
      }

      const categoryOption = options.getString('category', true).trim();
      const keyOption = options.getString('chave', true).trim();
      const valueOption = options.getString('valor', true).trim();

      const parsed = configSchema.safeParse({
        category: categoryOption,
        key: keyOption,
        value: valueOption,
      });

      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return interaction.reply({
          content: `${settings.emojis.static.failed} ${issue.message}`,
          ephemeral: true,
        });
      }

      const { category, key, value } = parsed.data;

      // Checar se a categoria é válida no schema do banco
      const guildSchema = await db.guilds.findOne({});

      if (!guildSchema || !(category in guildSchema)) {
        return interaction.reply({
          content: `${settings.emojis.static.failed} A categoria **${category}** não é válida.`,
          ephemeral: true,
        });
      }

      // Checar se a chave é válida
      const allowedKeys =
        allowedCategories[category as keyof typeof allowedCategories];

      if (!allowedKeys || !allowedKeys.includes(key)) {
        return interaction.reply({
          content: `${
            settings.emojis.static.failed
          } A chave **${key}** não é válida para a categoria **${category}**.\nChaves permitidas: **${
            allowedKeys?.join(', ') || 'Nenhuma'
          }.**`,
          ephemeral: true,
        });
      }

      // validação baseada em metadados
      const validation = await validateConfig(
        guild,
        botMe,
        category,
        key,
        value
      );

      if (!validation.valid) {
        return interaction.reply({
          content: `${settings.emojis.static.failed} ${validation.errors?.join(
            '\n'
          )}`,
          ephemeral: true,
        });
      }

      // Salvar no banco de dados
      try {
        const updatePath = `${category}.${key}`;

        await db.guilds.updateOne(
          { id: guildId },
          { $set: { [updatePath]: value } },
          { upsert: true }
        );

        // Mensagem de sucesso com preview
        let successMessage = `${settings.emojis.static.success} Configurado: **${category}.${key}** → `;

        const metadata = configMetadata[category]?.[key];
        if (metadata?.type === 'channel') {
          const channel = guild.channels.cache.get(value);
          successMessage += `${channel}`;
        } else if (metadata?.type === 'role') {
          const role = guild.roles.cache.get(value);
          successMessage += `${role}`;
        } else {
          successMessage += `\`${value}\``;
        }

        // Adicionar avisos se existirem
        if (validation.warnings && validation.warnings.length > 0) {
          successMessage += `\n\n⚠️ **Avisos:**\n${validation.warnings.join(
            '\n'
          )}`;
        }

        return interaction.reply({
          content: successMessage,
          ephemeral: true,
        });
      } catch (error) {
        console.error('Erro ao salvar configuração:', error);
        return interaction.reply({
          content: `${settings.emojis.static.failed} Ocorreu um erro ao salvar a configuração. Por favor, tente novamente mais tarde.`,
          ephemeral: true,
        });
      }
    }
  },
});
