import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';
// Modos de loop do Magmastream
// 0 = none/off, 1 = track, 2 = queue
export const MAGMA_LOOP_MODES = ['off', 'queue'] as const;
export type MagmaLoopMode = (typeof MAGMA_LOOP_MODES)[number];

const toggleLocks = new Map<string, boolean>();

export default createCommand({
  name: 'loop',
  nameLocalizations: {
    'pt-BR': 'repetir',
    'es-ES': 'repetir',
    fr: 'répéter',
  },
  description: 'Alternar o modo de repetição da música ou da fila',
  descriptionLocalizations: {
    'en-US': 'Toggle the repeat mode for the song or queue',
    'es-ES': 'Alternar el modo de repetición de la canción o cola',
    'en-GB': 'Toggle the repeat mode for the song or queue',
    fr: 'Basculer le mode de répétition de la chanson ou de la file d’attente',
    ja: '曲またはキューのリピートモードを切り替えます',
  },
  type: ApplicationCommandType.ChatInput,

  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });
    const { guild, member } = interaction;
    const locale = getLocale(interaction.locale);

    // ────────────────────────────────
    // Validações
    // ────────────────────────────────
    if (!(member instanceof GuildMember)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.loop.errors.no_member_info'
        )}`,
      });
    }

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.loop.errors.not_in_voice'
        )}`,
      });
    }

    // ───────────────────────────────────
    // Cria o player somente se não existe
    // ───────────────────────────────────
    const player = interaction.client.music.players.get(guild.id);
    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.loop.errors.no_player'
        )}`,
      });
    }

    // ────────────────────────────────
    // Verifica se não esta tocando
    // ────────────────────────────────
    if (!player.playing) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.pause.errors.no_player'
        )}`,
      });
    }

    // ──────────────────────────────────────────────────
    // Verifica se o bot esta no mesmo canal que o membro
    // ──────────────────────────────────────────────────
    if (player.voiceChannelId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.loop.errors.different_voice_channel'
        )}`,
      });
    }

    // ────────────────────────────────────
    // Lock para evitar toggles concorrentes
    // ────────────────────────────────────
    if (toggleLocks.get(guild.id)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} Aguarde um momento...`,
      });
    }
    toggleLocks.set(guild.id, true);

    try {
      // tentar ler loopMode persistido
      const persisted = player.get?.('loopMode') as MagmaLoopMode | undefined;
      const current: MagmaLoopMode =
        persisted && MAGMA_LOOP_MODES.includes(persisted)
          ? persisted
          : player.queueRepeat
          ? 'queue'
          : 'off';

      const nextIndex =
        (MAGMA_LOOP_MODES.indexOf(current) + 1) % MAGMA_LOOP_MODES.length;
      const next = MAGMA_LOOP_MODES[nextIndex] as MagmaLoopMode;

      const isQueue = next === 'queue';

      // setar o repeat no player
      if (player.trackRepeat) player.setTrackRepeat(false);
      player.setQueueRepeat(Boolean(isQueue));

      // persistir para compatibilidade
      player.set('loopMode', next);

      const emoji = next === 'queue' ? '🔁' : '⏹️';

      return interaction.editReply({
        embeds: [
          createEmbed({
            color: settings.colors.primary,
            author: createEmbedAuthor(interaction.user),
            title: t(locale, 'commands.loop.success.title'),
            description: `${emoji} ${t(
              locale,
              `commands.loop.success.description.${next}`
            )}`,
            footer: {
              text: t(locale, 'commands.loop.fields.changed_by', {
                username: interaction.user.username,
              }),
            },
            timestamp: new Date(),
          }),
        ],
      });
    } catch (err) {
      console.error('[loop] erro ao alternar modo:', err);
      return interaction.editReply({
        content: `${settings.emojis.static.failed} Erro interno ao alternar loop.`,
      });
    } finally {
      toggleLocks.delete(guild.id);
    }
  },
});
