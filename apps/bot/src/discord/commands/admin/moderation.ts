import { createCommand } from '#base';
import { db, GuildSchema } from '#database';
import { logger, settings } from '#settings';
import {
  createEmbed,
  createModalFields,
  createRow,
  modalFieldsToRecord,
} from '@magicyan/discord';
import {
  ApplicationCommandOptionType,
  ChannelType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalSubmitInteraction,
  ComponentType,
  Message,
  ButtonInteraction,
  Interaction,
} from 'discord.js';

import { z } from 'zod';

const autoModSchema = z
  .object({
    enabled: z.boolean().default(true),
    maxMessages: z.number().int().min(2).max(100),
    intervalSeconds: z.number().int().min(3).max(3600),
    punishment: z.enum(['timeout', 'tempban']),
    tempBanDays: z.number().int().min(1).max(30).optional(),
  })
  .strict();

type AutoModConfig = z.infer<typeof autoModSchema>;
type ModerationConfig = GuildSchema['moderation'];

// Mensagems constantes
const ERROR_MESSAGES = {
  BOT_PERMISSIONS: `${settings.emojis.static.failed} Ops, sem permissão de ban! Eu sou bonzinho demais pra bater de frente sem autorização. Preciso dela pra fazer o serviço!`,
  VALIDATION_ERROR: `${settings.emojis.static.failed} Validação falhou! Alguém digitou errado ou tá testando minha paciência? 🤔`,
  MISSING_PERMISSIONS: `${settings.emojis.static.failed} Sem permissão pra abrir o painel aqui! Me solta dessa coleira, admin! 🐶`,
  UNKNOWN: `${settings.emojis.static.failed} 😱 ERRO MISTERIOSO! O universo quebrou ou eu quebrei? Tenta de novo que eu finjo que nada aconteceu`,
} as const;

const SUCCESS_MESSAGES = {
  LOADING: `${settings.emojis.anim.loading} Abrindo painel...`,
  SUCCESS_TITLE: `${settings.emojis.anim.clean} Limpeza concluída`,
} as const;

// Funções auxiliares para pegar e salvar configuração do AutoMod
/**
 * Pegar configurações do automod
 * @param guildId
 * @returns
 */
async function getAutoModConfig(
  guildId: string
): Promise<AutoModConfig | null> {
  const doc = await db.guilds.findOne(
    { id: guildId },
    { projection: { 'moderation.autoMod': 1 } }
  );

  const raw = doc?.moderation?.autoMod ?? null;
  if (!raw) return null;

  try {
    return autoModSchema.parse(raw);
  } catch (e) {
    logger.warn(
      '[Moderation] autoMod config esta inválido na database, resetting to null'
    );
    return null;
  }
}

/**
 * Salvar configurações do automod
 * @param guildId
 * @param cfg
 */
async function saveAutoModConfig(guildId: string, cfg: AutoModConfig) {
  await db.guilds.updateOne(
    { id: guildId },
    { $set: { 'moderation.autoMod': cfg } },
    { upsert: true }
  );
}

// Funções auxiliares de interface
/**
 * Criar embed do automod
 * @param guildName
 * @param cfg
 * @returns
 */
function buildAutomodEmbed(guildName: string, cfg: AutoModConfig | null) {
  if (!cfg) {
    return createEmbed({
      title: '🤖 AutoMod — Não configurado',
      description: 'O AutoMod ainda não foi configurado para este servidor.',
      color: settings.colors.yellow,
      timestamp: new Date(),
    });
  }

  return createEmbed({
    title: '🤖 AutoMod — Configuração atual',
    color: settings.colors.green,
    fields: [
      { name: 'Ativado', value: cfg.enabled ? 'Sim' : 'Não', inline: true },
      { name: 'Máx. mensagens', value: String(cfg.maxMessages), inline: true },
      {
        name: 'Intervalo (s)',
        value: String(cfg.intervalSeconds),
        inline: true,
      },
      { name: 'Punição', value: cfg.punishment, inline: true },
      ...(cfg.punishment === 'tempban' && cfg.tempBanDays
        ? [
            {
              name: 'Dias de ban',
              value: String(cfg.tempBanDays),
              inline: true,
            },
          ]
        : []),
    ],
    footer: { text: `Servidor: ${guildName}` },
    timestamp: new Date(),
  });
}
/**
 * Criar componentes do painel
 * @param enabled
 * @returns
 */
function buildPanelComponents(enabled: boolean) {
  const toggleLabel = enabled ? 'Desativar AutoMod' : 'Ativar AutoMod';
  const toggleStyle = enabled ? ButtonStyle.Danger : ButtonStyle.Success;

  const componentes = [
    createRow(
      new ButtonBuilder()
        .setCustomId('mod:toggle')
        .setLabel(toggleLabel)
        .setStyle(toggleStyle),
      new ButtonBuilder()
        .setCustomId('mod:edit')
        .setLabel('Editar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('mod:reset')
        .setLabel('Reset')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('mod:close')
        .setLabel('Fechar')
        .setStyle(ButtonStyle.Secondary)
    ),
  ];

  return componentes;
}
/**
 * Criar modal de edição
 * @param defaults
 * @returns
 */
// function buildEditModal(defaults: AutoModConfig | null) {
//   if (!defaults) {
//     return createEmbed({
//       title: '🤖 AutoMod — Não configurado',
//       description: 'O AutoMod ainda não foi configurado para este servidor.',
//       color: settings.colors.yellow,
//       timestamp: new Date(),
//     });
//   }
//   const modal = createModalFields({
//     maxMessages: {
//       label: 'Máx mensagens (2-100)',
//       placeholder: 'Ex: 10',
//       required: true,
//       value: String(defaults?.maxMessages ?? 10),
//       minLength: 1,
//     },
//     intervalSeconds: {
//       label: 'Janela em segundos (3-3600)',
//       placeholder: 'Ex: 10',
//       required: true,
//       value: String(defaults?.intervalSeconds ?? 10),
//       minLength: 1,
//     },
//     punishment: {
//       label: 'Punição (timeout|tempban)',
//       placeholder: 'timeout ou tempban',
//       required: true,
//       value: defaults?.punishment ?? 'timeout',
//     },
//     tempBanDays: {
//       label: 'Dias de ban (apenas se tempban)',
//       placeholder: '1-30 — deixe vazio se não aplicar',
//       required: false,
//       value: defaults?.tempBanDays ? String(defaults.tempBanDays) : '',
//     },
//   });

//   return modal;
// }

export default createCommand({
  name: 'moderation',
  description: 'Configurar o automod do bot. (rimou :D)',
  options: [
    {
      name: 'automod',
      description: 'Configurar o AutoMod',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'max_messages',
          type: ApplicationCommandOptionType.Integer,
          description: 'Quantidade máxima de mensagens',
          required: true,
        },
        {
          name: 'interval',
          type: ApplicationCommandOptionType.Integer,
          description: 'Intervalo em segundos',
          required: true,
        },
        {
          name: 'punishment',
          type: ApplicationCommandOptionType.String,
          description: 'Punição aplicada',
          required: true,
          choices: [
            { name: 'Timeout', value: 'timeout' },
            { name: 'Ban Temporário', value: 'tempban' },
          ],
        },
        {
          name: 'ban_days',
          type: ApplicationCommandOptionType.Integer,
          description: 'Dias de ban (somente tempban)',
          required: false,
        },
      ],
    },
  ],
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  async run(interaction: ChatInputCommandInteraction): Promise<any> {
    try {
      const { guild, channel, member } = interaction;
      if (!guild) {
        await interaction.reply({
          content: 'Comando apenas em servidor.',
          ephemeral: true,
        });
        return;
      }

      // Verificação de permissões do bot no servidor
      const botMember = guild?.members.me;
      if (!botMember?.permissions.has(PermissionFlagsBits.BanMembers)) {
        await interaction.reply({
          content: ERROR_MESSAGES.BOT_PERMISSIONS,
          ephemeral: true,
        });
        return;
      }

      if (interaction.options.getSubcommand(false) === 'automod') {
        // Resposta inicial de loading
        await interaction.reply({
          content: SUCCESS_MESSAGES.LOADING,
          ephemeral: true,
        });

        // Validação dos dados de entrada com Zod
        const maxMessages = interaction.options.getInteger(
          'max_messages',
          true
        );
        const intervalSeconds = interaction.options.getInteger(
          'interval',
          true
        );
        const punishment = interaction.options.getString('punishment', true);
        const banDays = interaction.options.getInteger('ban_days') ?? undefined;

        if (
          punishment === 'tempban' &&
          !guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)
        ) {
          await interaction.reply({
            content: `${settings.emojis.static.failed} Não tenho permissão de banir membros no servidor.`,
            ephemeral: true,
          });
          return;
        }

        const validationResult = autoModSchema.safeParse({
          enabled: true,
          maxMessages,
          intervalSeconds,
          punishment,
          tempBanDays: banDays,
        });

        if (!validationResult.success) {
          const errorMessage = validationResult.error.issues
            .map((err) => err.message)
            .join(', ');

          await interaction.editReply({
            content: `${ERROR_MESSAGES.VALIDATION_ERROR} ${errorMessage}`,
          });
          return;
        }

        // Pega dados validados
        const validatedData: AutoModConfig = validationResult.data;
        await saveAutoModConfig(guild.id, validatedData);

        const embed = buildAutomodEmbed(guild.name, validatedData);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      // buscar config
      let state = (await getAutoModConfig(guild.id)) ?? null;
      if (!state) {
        await interaction.editReply({
          content:
            'O AutoMod ainda não foi configurado para este servidor. Execute o subcomando `automod` com parâmetros para configurar.',
        });
        return;
      }

      const render = async (
        target: ChatInputCommandInteraction | ButtonInteraction = interaction
      ) => {
        const embed = buildAutomodEmbed(guild.name, state);
        var enabled = state?.enabled ?? false;
        const components = buildPanelComponents(enabled ?? false);

        if ('update' in target) {
          await (target as ButtonInteraction).update({
            embeds: [embed],
            components,
          });
        } else {
          await target.reply({ embeds: [embed], components, ephemeral: true });
        }
      };

      await render();

      // mensagem base
      const reply = (await interaction.fetchReply()) as Message;

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 10 * 60 * 1000,
        // filter: só deixa o autor do comando interagir
        filter: (i: Interaction) => i.user.id === interaction.user.id,
      });

      // segurança (timerzin)
      collector.on('collect', async (comp) => {
        try {
          switch (comp.customId) {
            case 'mod:toggle': {
              if (state) {
                state.enabled = !state.enabled;
                await saveAutoModConfig(guild.id, state);
                await render(comp);
              }
              break;
            }
            case 'mod:reset': {
              state = {
                enabled: false,
                maxMessages: 10,
                intervalSeconds: 10,
                punishment: 'timeout',
              };
              await saveAutoModConfig(guild.id, state);
              await render(comp);
              break;
            }

            case 'mod:close': {
              collector.stop('closed');
              await comp.update({
                content: 'Painel fechado.',
                embeds: [],
                components: [],
              });
              break;
            }

            case 'mod:edit': {
              const modalComponents = createModalFields({
                maxMessages: {
                  label: 'Máx mensagens (2-100)',
                  placeholder: 'Ex: 10',
                  required: true,
                  value: String(state?.maxMessages ?? 10),
                  minLength: 1,
                },
                intervalSeconds: {
                  label: 'Janela em segundos (3-3600)',
                  placeholder: 'Ex: 10',
                  required: true,
                  value: String(state?.intervalSeconds ?? 10),
                  minLength: 1,
                },
                punishment: {
                  label: 'Punição (timeout|tempban)',
                  placeholder: 'timeout ou tempban',
                  required: true,
                  value: state?.punishment ?? 'timeout',
                },
                tempBanDays: {
                  label: 'Dias de ban (apenas se tempban)',
                  placeholder: '1-30 — deixe vazio se não aplicar',
                  required: false,
                  value: state?.tempBanDays ? String(state.tempBanDays) : '',
                },
              });

              await comp.showModal({
                customId: 'mod:modal:edit',
                title: 'Editar AutoMod',
                components: modalComponents,
              });

              const submitted = (await comp
                .awaitModalSubmit({
                  time: 5 * 60 * 1000,
                  filter: (i: ModalSubmitInteraction) =>
                    i.user.id === comp.user.id &&
                    i.customId === 'mod:modal:edit',
                })
                .catch(() => null)) as ModalSubmitInteraction | null;

              if (!submitted) return;

              // usa modalFieldsToRecord para transformar os fields em um objeto
              const values = modalFieldsToRecord<{
                maxMessages: string;
                intervalSeconds: string;
                punishment: string;
                tempBanDays?: string;
              }>(submitted.fields);

              const parsedInput = {
                enabled: true,
                maxMessages: Number(values.maxMessages),
                intervalSeconds: Number(values.intervalSeconds),
                punishment: values.punishment as 'timeout' | 'tempban',
                tempBanDays:
                  typeof values.tempBanDays === 'undefined' ||
                  values.tempBanDays.trim() === ''
                    ? undefined
                    : Number(values.tempBanDays),
              };

              if (
                parsedInput.punishment === 'tempban' &&
                !guild.members.me?.permissions.has(
                  PermissionFlagsBits.BanMembers
                )
              ) {
                await submitted.reply({
                  content: `${settings.emojis.static.failed} Preciso da permissão BanMembers.`,
                  ephemeral: true,
                });
                return;
              }

              const parsed = autoModSchema.safeParse(parsedInput);
              if (!parsed.success) {
                await submitted.reply({
                  content: `${
                    settings.emojis.static.failed
                  } ${parsed.error.issues.map((i) => i.message).join(', ')}`,
                  ephemeral: true,
                });
                return;
              }

              state = parsed.data;
              await saveAutoModConfig(guild.id, state);

              await submitted.reply({
                embeds: [buildAutomodEmbed(guild.name, state)],
                components: buildPanelComponents(state.enabled),
                ephemeral: true,
              });
              await render(comp);
              break;
            }
          }
        } catch (err) {
          logger.error('[moderation panel]', err);
          await comp.reply({
            content: 'Erro ao processar ação.',
            ephemeral: true,
          });
        }
      });

      collector.on('end', async () => {
        // timeout ou close → desativa botões
        await interaction.editReply({ components: [] }).catch(() => {});
      });
    } catch (error) {
      console.error('Erro no comando clear:', error);

      // Tratamento específico de erros do Discord
      let errorContent: (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES] =
        ERROR_MESSAGES.UNKNOWN;

      if (error instanceof Error) {
        if (
          error.message.includes('Missing Permissions') ||
          error.message.includes('Missing Access')
        ) {
          errorContent = ERROR_MESSAGES.MISSING_PERMISSIONS;
        }
      }

      // Tenta editar a mensagem de loading, se não conseguir, envia nova mensagem
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ content: errorContent });
        } else {
          await interaction.reply({
            content: errorContent,
            ephemeral: true,
          });
        }
      } catch (editError) {
        console.error('Erro ao enviar mensagem de erro:', editError);
      }
    }
  },
});
