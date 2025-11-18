import { createResponder, ResponderType } from '#base';
import { settings } from '#settings';
import { getLocale, t } from 'i18n/index.js';
import { StateTypes, Track } from 'magmastream';

createResponder({
  customId: 'music/:action/:userId/:index',
  types: [ResponderType.Button],
  cache: 'cached',

  async run(interaction, { action, userId, index }): Promise<any> {
    try {
      // if the button wasn't pressed by the owner, reject politely
      if (interaction.user.id !== userId) {
        return interaction.reply({
          content: 'Esta interação não é sua.',
          ephemeral: true,
        });
      }

      // allow quick update visual response
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
          // validate cache + TTL
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

          // add to queue and play if needed
          const queueWasEmpty = player.queue.size.length === 0;
          player.queue.add(track);

          if (
            queueWasEmpty &&
            !player.playing &&
            player.state === StateTypes.Connected
          ) {
            await player.play();
          }

          // cleanup cache for this user
          interaction.client.searchCache?.delete(cacheKey);

          return interaction.editReply({
            content: `${settings.emojis.static.queue} **${track.title}** adicionada à fila.`,
            components: [],
          });
        }

        case 'cancel': {
          // only owner can cancel (checked above)
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
