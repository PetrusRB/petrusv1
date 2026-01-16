import { createResponder, ResponderType } from '#base';
import { db } from '#database';
import { generateCaptchaImage } from 'discord/utils/captcha.ts';
import {
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  AttachmentBuilder,
  Interaction,
  ModalSubmitInteraction,
  ButtonInteraction,
} from 'discord.js';
import { logger, settings } from '#settings';
import { res } from '#functions';
import { Verification } from 'discord/modules/verification/verify.module.ts';
import { t, getLocale } from 'i18n/index.ts';
import {
  createEmbed,
  createModalFields,
  modalFieldsToRecord,
} from '@magicyan/discord';

const verification = new Verification();
const SESSION_TTL_MS = 1000 * 60 * 5; // 5 minutos

/* -------------------------
   Helpers para o reply
   ------------------------- */
async function failEphemeral(interaction: any, message: string) {
  return interaction.reply(res.danger(message));
}

/* -------------------------
   Modal submit handler
   ------------------------- */
async function handleModalSubmit(
  interaction: ModalSubmitInteraction,
  sessionId: string
) {
  const locale = getLocale(interaction.locale);

  // Defer para dar tempo de processar e usar editReply posteriormente
  await interaction.deferReply({ ephemeral: true });

  if (!sessionId) return failEphemeral(interaction, 'Sessão inválida.');

  const fields = modalFieldsToRecord<'captcha_code'>(interaction.fields);
  const userCode = (fields.captcha_code ?? '').toString().trim().toUpperCase();

  const session = await db.verification.findById(sessionId).catch((e) => {
    logger.warn('[verify] falha ao buscar sessão', e);
    return null;
  });

  if (!session) {
    return interaction.editReply(
      res.danger(
        t(locale, 'commands.verify.errors.session_expired') ??
          'Sessão expirada ou inválida.'
      )
    );
  }

  if (session.expiresAt < new Date()) {
    await db.verification.deleteOne({ _id: sessionId }).catch(() => {});
    return interaction.editReply(
      res.danger(
        t(locale, 'commands.verify.errors.session_expired') ??
          'Sessão expirada. Solicite um novo código.'
      )
    );
  }

  if (session.userId !== interaction.user.id) {
    return interaction.editReply(
      res.danger('Esta sessão não pertence a você.')
    );
  }

  if (userCode !== (session.code ?? '').toString().toUpperCase()) {
    logger.log(
      `[verify] código incorreto expected=${session.code} got=${userCode}`
    );
    return interaction.editReply(
      res.danger(
        `${settings.emojis.static.failed} **Código incorreto!** Tente novamente.\n\n💡 Dica: O código tem **6 caracteres**.`
      )
    );
  }

  // buscar guild, member e cargos
  const guildId = session.guildId;
  const guild =
    interaction.client.guilds.cache.get(guildId) ||
    (await interaction.client.guilds.fetch(guildId).catch(() => null));
  if (!guild) {
    await db.verification.deleteOne({ _id: sessionId }).catch(() => {});
    return interaction.editReply(
      res.danger(
        t(locale, 'commands.verify.errors.generic_error') ?? 'Erro interno.'
      )
    );
  }

  const member = await guild.members.fetch(session.userId).catch(() => null);
  if (!member) {
    await db.verification.deleteOne({ _id: sessionId }).catch(() => {});
    return interaction.editReply(
      res.danger(
        t(locale, 'commands.verify.errors.generic_error') ?? 'Erro interno.'
      )
    );
  }

  const guildDoc = await db.guilds.get(guildId).catch(() => null);
  const memberRoleId = guildDoc?.cargos?.membro;
  const unverifiedRoleId = guildDoc?.cargos?.naoverificado;
  if (!memberRoleId || !unverifiedRoleId) {
    await db.verification.deleteOne({ _id: sessionId }).catch(() => {});
    return interaction.editReply(
      res.danger(
        t(locale, 'commands.verify.errors.generic_error') ??
          'Erro de configuração.'
      )
    );
  }

  try {
    await verification.removeUnverified(member, unverifiedRoleId);
    await verification.applyVerified(member, memberRoleId);
    await db.verification.deleteOne({ _id: sessionId }).catch(() => {});

    logger.log(
      `[Verification] ✅ ${member.user.tag} verificado em ${guild.name}`
    );

    return interaction.editReply(
      res.success(
        `${settings.emojis.static.success} ${
          t(locale, 'commands.verify.success.verified') ??
          'Verificação concluída com sucesso!'
        }\n\nVocê agora tem acesso ao servidor **${guild.name}**.`
      )
    );
  } catch (err) {
    logger.error('[verify] erro ao aplicar cargos', err);
    return interaction.editReply(
      res.danger(
        t(locale, 'commands.verify.errors.generic_error') ??
          'Erro ao aplicar verificação.'
      )
    );
  }
}

/* -------------------------
   Botão "user" handler
   ------------------------- */
async function handleUserAction(interaction: ButtonInteraction) {
  const locale = getLocale(interaction.locale);
  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  if (!guild) return failEphemeral(interaction, 'Erro ao obter servidor.');

  const guildDoc = await db.guilds.get(guild.id).catch(() => null);
  if (!guildDoc?.modules?.verification) {
    return interaction.editReply(
      res.danger(
        `${settings.emojis.static.failed} - ${
          t(locale, 'commands.verify.errors.not_enabled') ??
          'Módulo de verificação desabilitado.'
        }`
      )
    );
  }

  const memberRoleId = guildDoc.cargos?.membro;
  const unverifiedRoleId = guildDoc.cargos?.naoverificado;
  if (!memberRoleId || !unverifiedRoleId) {
    return interaction.editReply(
      res.danger(
        t(locale, 'commands.verify.errors.generic_error') ??
          'Configuração de cargos inválida.'
      )
    );
  }

  const member = await guild.members
    .fetch(interaction.user.id)
    .catch(() => null);
  if (!member)
    return interaction.editReply(res.danger('Erro ao obter membro.'));

  if (member.roles.cache.has(memberRoleId)) {
    return interaction.editReply(
      res.danger(
        t(locale, 'commands.verify.errors.already_verified') ??
          'Você já está verificado.'
      )
    );
  }

  // gerar captcha e criar sessão
  let buffer: Buffer;
  let code: string;
  try {
    const img = await generateCaptchaImage({ length: 6 });
    buffer = img.buffer;
    code = img.code.toString().toUpperCase();
  } catch (e) {
    logger.error('[verify] falha ao gerar captcha', e);
    return interaction.editReply(
      res.danger(
        t(locale, 'commands.verify.errors.generic_error') ??
          'Erro ao gerar captcha.'
      )
    );
  }

  const session = await db.verification
    .create({
      guildId: guild.id,
      userId: interaction.user.id,
      code,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    })
    .catch((e) => {
      logger.error('[verify] falha ao criar sessão', e);
      return null;
    });

  if (!session)
    return interaction.editReply(res.danger('Erro interno ao criar sessão.'));

  // botão no modal/dm para abrir modal de confirmação
  const prefix = (action: string) => (sessionId: string) =>
    `verify/${action}/${sessionId}`;
  const verifyButton = new ButtonBuilder()
    .setCustomId(prefix('submit')(`${session._id.toString()}`)) // padrão limpo
    .setLabel(t(locale, 'commands.verify.embed.button') ?? 'Inserir Código')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);

  try {
    await interaction.user.send({
      embeds: [
        createEmbed({
          title: `${settings.emojis.static.moderador} Verificação - ${guild.name}`,
          description:
            `Digite o código da imagem abaixo clicando no botão.\n\n` +
            `⏱️ Você tem **5 minutos** para completar a verificação.\n` +
            `🔤 O código possui **6 caracteres**.`,
          color: settings.colors.success,
          image: 'attachment://captcha.png',
          footer: { text: 'Código não diferencia maiúsculas/minúsculas' },
        }),
      ],
      files: [new AttachmentBuilder(buffer, { name: 'captcha.png' })],
      components: [row],
    });

    return interaction.editReply(
      res.success(
        `${settings.emojis.static.success} ${
          t(locale, 'commands.verify.success.dm_sent') ??
          'Captcha enviado no privado! Abra suas DMs.'
        }`
      )
    );
  } catch (err) {
    logger.warn('[verify] falha ao enviar DM', err);
    // cleanup sessão se DM falhar
    await db.verification.deleteOne({ _id: session._id }).catch(() => {});
    return interaction.editReply(
      res.danger(
        t(locale, 'commands.verify.errors.no_dm') ??
          'Não consigo te enviar DM. Ative mensagens privadas.'
      )
    );
  }
}

/* -------------------------
   Botão "submit" handler
   ------------------------- */
async function handleSubmitAction(
  interaction: ButtonInteraction,
  sessionId: string
): Promise<any> {
  if (!sessionId) {
    // showModal não pode ser usado depois de defer; aqui devolvemos mensagem curta
    try {
      return interaction.editReply(res.danger('Sessão inválida.'));
    } catch (e) {
      logger.warn('[verify/submit] falha ao notificar sessão inválida', e);
      return;
    }
  }

  try {
    return interaction.showModal({
      customId: `verify/check/${sessionId}`,
      title: 'Verificação de Segurança',
      components: createModalFields({
        captcha_code: {
          label: 'Digite o código da imagem',
          placeholder: 'Ex: ABC123',
          required: true,
          minLength: 6,
          maxLength: 6,
        },
      }),
    });
  } catch (err) {
    logger.error('[verify/submit] erro ao showModal', err);
    try {
      return interaction.editReply(res.danger('Erro ao abrir o modal.'));
    } catch (e) {
      logger.error('[verify/submit] falha ao notificar erro de modal', e);
    }
  }
}

/* -------------------------
   Responder (entrypoint)
   ------------------------- */
createResponder({
  customId: 'verify/:action/:sessionId',
  types: [ResponderType.Button, ResponderType.ModalComponent],
  cache: 'cached',

  async run(interaction, { action, sessionId }) {
    try {
      if (interaction.isModalSubmit()) {
        // Modal submit flow (usuário inseriu o código)
        return handleModalSubmit(
          interaction as ModalSubmitInteraction,
          sessionId
        );
      }
      switch (action) {
        case 'user':
          return handleUserAction(interaction as ButtonInteraction);
        case 'submit':
          return handleSubmitAction(
            interaction as ButtonInteraction,
            sessionId
          );
        default:
          return failEphemeral(interaction, 'Ação inválida.');
      }
    } catch (err) {
      logger.error('[verify responder] erro inesperado', err);
      try {
        return failEphemeral(
          interaction,
          'Ocorreu um erro ao processar a interação.'
        );
      } catch (e) {
        logger.error('[verify responder] falha ao notificar erro', e);
      }
    }
  },
});
