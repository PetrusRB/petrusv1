import { createResponder, ResponderType } from '#base';
import { settings } from '#settings';
import { getLocale, t } from 'i18n/index.js';
import { Player, StateTypes, Track } from 'magmastream';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import {
  MAGMA_LOOP_MODES,
  MagmaLoopMode,
} from 'discord/commands/musica/loop.ts';

// Função auxiliar para criar os botões dinamicamente
export async function createMusicButtons(
  userId: string,
  player: Player,
  locale: string
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
  const persisted = player.get?.('loopMode') as MagmaLoopMode | undefined;
  const repeatMode: MagmaLoopMode =
    persisted && MAGMA_LOOP_MODES.includes(persisted)
      ? persisted
      : player.queueRepeat
      ? 'queue'
      : 'off';

  const previous = await player.queue.getPrevious().catch(() => {});
  const togglePlayBtn = new ButtonBuilder()
    .setCustomId(`music/toggleplay/${userId}/0`)
    .setEmoji(
      player.paused
        ? settings.emojis.static.pause
        : settings.emojis.static.resume
    )
    .setStyle(player.paused ? ButtonStyle.Secondary : ButtonStyle.Success);

  const skipBtn = new ButtonBuilder()
    .setCustomId(`music/skip/${userId}/0`)
    .setEmoji(settings.emojis.static.skip)
    .setStyle(ButtonStyle.Primary);

  const backBtn = new ButtonBuilder()
    .setCustomId(`music/back/${userId}/0`)
    .setEmoji(settings.emojis.static.back)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(!previous || previous.length === 0);

  const shuffleBtn = new ButtonBuilder()
    .setCustomId(`music/shuffle/${userId}/0`)
    .setEmoji(settings.emojis.static.shuffle)
    .setStyle(ButtonStyle.Secondary);

  let repeatEmoji = settings.emojis.static.repeat;

  if (repeatMode === 'queue') {
    repeatEmoji = settings.emojis.static.repeat;
  }

  const repeatBtn = new ButtonBuilder()
    .setCustomId(`music/repeat/${userId}/0`)
    .setEmoji(repeatEmoji)
    .setStyle(
      repeatMode === 'off' ? ButtonStyle.Secondary : ButtonStyle.Success
    );

  const stopBtn = new ButtonBuilder()
    .setCustomId(`music/stop/${userId}/0`)
    .setEmoji(settings.emojis.static.stop)
    .setStyle(ButtonStyle.Danger);

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    backBtn,
    togglePlayBtn,
    skipBtn,
    shuffleBtn,
    repeatBtn
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(stopBtn);

  return [row1, row2];
}

createResponder({
  customId: 'music/:action/:userId/:index',
  types: [ResponderType.Button],
  cache: 'cached',

  async run(interaction, { action, userId, index }): Promise<any> {
    try {
      // Verificar se o botão foi pressionado pelo dono
      if (interaction.user.id !== userId) {
        return interaction.reply({
          content: 'Esta interação não é sua.',
          ephemeral: true,
        });
      }

      // Resposta visual rápida
      await interaction.deferUpdate().catch(() => {});

      const locale = getLocale(interaction.locale);
      const player = interaction.client.music.getPlayer(interaction.guildId);

      if (!player) {
        return interaction.editReply({
          content: `${settings.emojis.static.failed} ${t(
            locale,
            'commands.search.errors.no_player'
          )}`,
          components: [],
        });
      }

      const cacheKey = `${interaction.guildId}:${userId}`;
      const cached = interaction.client.searchCache?.get(cacheKey);

      switch (action) {
        case 'select': {
          // Validar cache + TTL
          if (
            !cached ||
            !Array.isArray(cached.tracks) ||
            typeof cached.expires !== 'number' ||
            cached.expires <= Date.now()
          ) {
            interaction.client.searchCache?.delete(cacheKey);
            return interaction.editReply({
              content: `${settings.emojis.static.failed} Resultado expirado.`,
              components: [],
            });
          }

          const idx = Number(index);
          const track: Track | undefined = cached.tracks[idx];

          if (!track) {
            return interaction.editReply({
              content: `${settings.emojis.static.failed} Faixa inválida.`,
              components: [],
            });
          }

          // Adicionar à fila e tocar se necessário
          const queueWasEmpty = player.queue.size.length === 0;
          player.queue.add(track);

          if (
            queueWasEmpty &&
            !player.playing &&
            player.state === StateTypes.Connected
          ) {
            await player.play();
          }

          // Limpar cache
          interaction.client.searchCache?.delete(cacheKey);

          // Atualizar com botões
          const buttons = await createMusicButtons(userId, player, locale);
          return interaction.editReply({
            content: `${settings.emojis.static.queue} **${track.title}** adicionada à fila.`,
            components: buttons,
          });
        }

        case 'toggleplay': {
          player.pause(!player.paused);

          // Atualizar botões com novo estado
          const buttons = await createMusicButtons(userId, player, locale);
          return interaction.editReply({
            content: player.paused
              ? `${settings.emojis.static.pause} Música pausada`
              : `${settings.emojis.static.resume} Música retomada`,
            components: buttons,
          });
        }

        case 'skip': {
          const current = await player.queue.getCurrent().catch(() => {});
          if (player.queue.size.length === 0 && !current) {
            return interaction.editReply({
              content: `${settings.emojis.static.failed} Não há próxima música na fila.`,
              components: await createMusicButtons(userId, player, locale),
            });
          }

          player.stop();
          const buttons = await createMusicButtons(userId, player, locale);
          return interaction.editReply({
            content: `${settings.emojis.static.skip || '⏭️'} Música pulada`,
            components: buttons,
          });
        }

        case 'back': {
          if ((await player.queue.getPrevious()).length === 0) {
            return interaction.editReply({
              content: `${settings.emojis.static.failed} Não há música anterior.`,
              components: await createMusicButtons(userId, player, locale),
            });
          }

          await player.previous();
          const buttons = await createMusicButtons(userId, player, locale);
          return interaction.editReply({
            content: `⏮️ Voltando para a música anterior`,
            components: buttons,
          });
        }

        case 'shuffle': {
          if (player.queue.size.length === 0) {
            return interaction.editReply({
              content: `${settings.emojis.static.failed} A fila está vazia.`,
              components: await createMusicButtons(userId, player, locale),
            });
          }

          player.queue.shuffle();
          const buttons = await createMusicButtons(userId, player, locale);
          return interaction.editReply({
            content: `🔀 Fila embaralhada`,
            components: buttons,
          });
        }

        case 'repeat': {
          // Ciclar entre Off → Track → Queue → Off
          const persisted = player.get?.('loopMode') as
            | MagmaLoopMode
            | undefined;
          const repeatMode: MagmaLoopMode =
            persisted && MAGMA_LOOP_MODES.includes(persisted)
              ? persisted
              : player.queueRepeat
              ? 'queue'
              : 'off';

          const isQueue = repeatMode === 'queue';

          // setar o repeat no player
          if (player.trackRepeat) player.setTrackRepeat(false);
          player.setQueueRepeat(Boolean(isQueue));

          // persistir para compatibilidade
          player.set('loopMode', repeatMode);

          const modeText = isQueue ? 'Fila' : 'Desativado';

          const buttons = await createMusicButtons(userId, player, locale);
          return interaction.editReply({
            content: `🔁 Modo repeat: **${modeText}**`,
            components: buttons,
          });
        }

        case 'stop': {
          await player.destroy();
          return interaction.editReply({
            content: `⏹️ Player parado e desconectado.`,
            components: [],
          });
        }

        case 'cancel': {
          interaction.client.searchCache?.delete(cacheKey);
          return interaction.editReply({
            content: 'Seleção cancelada.',
            components: [],
          });
        }

        default:
          return interaction.editReply({
            content: 'Ação inválida.',
            components: [],
          });
      }
    } catch (err) {
      console.error('Erro no responder music:', err);
      return interaction
        .editReply({
          content: '⚠ Ocorreu um erro ao processar a interação.',
          components: [],
        })
        .catch(() => {});
    }
  },
});
