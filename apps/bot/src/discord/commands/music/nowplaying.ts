import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';
import { MagmaLoopMode } from './loop.js';
import { formatDuration } from 'discord/utils/duration.js';

export default createCommand({
  name: 'nowplaying',
  nameLocalizations: {
    'pt-BR': 'tocandoagora',
    'es-ES': 'ahoratocando',
    fr: 'nowplaying',
  },
  description: 'Mostra informações sobre a música atual',
  descriptionLocalizations: {
    'en-US': 'Show information about the current song',
    'es-ES': 'Muestra información sobre la canción actual',
    'en-GB': 'Show information about the current song',
    fr: 'Afficher les informations sur la chanson en cours',
    ja: '現在再生中の曲の情報を表示します',
  },
  type: ApplicationCommandType.ChatInput,

  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });
    const { guild, member } = interaction;
    const locale = getLocale(interaction.locale);

    // Verificação de membro
    if (!(member instanceof GuildMember)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.nowplaying.errors.no_member_info'
        )}`,
      });
    }

    // Verificação de canal de voz
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.nowplaying.errors.not_in_voice'
        )}`,
      });
    }

    // Verifica se há player
    const player = interaction.client.music.players.get(guild.id);
    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.nowplaying.errors.no_player'
        )}`,
      });
    }

    // Garante que o membro está no mesmo canal
    if (player.voiceChannelId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.nowplaying.errors.different_voice_channel'
        )}`,
      });
    }
    if (!player.playing) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.stop.errors.no_player'
        )}`,
      });
    }
    const currentTrack = await player.queue.getCurrent().catch(() => null);

    if (!currentTrack) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.skip.errors.no_track'
        )}`,
      });
    }
    // ────────────────────────────────
    // Determinar estado de loop
    // ────────────────────────────────
    const currentMode: MagmaLoopMode = player.queueRepeat ? 'queue' : 'off';

    const loopStatus: Record<MagmaLoopMode, string> = {
      off: t(locale, 'commands.nowplaying.fields.loop_off'),
      queue: t(locale, 'commands.nowplaying.fields.loop_queue'),
    };

    // Progresso formatado
    const current = player.position || 0;
    const total = await player.queue.duration();

    const progress = total > 0 ? Math.min(current / total, 1) : 0;
    const barLength = 20;
    const filled = Math.round(barLength * progress);
    const progressBar =
      '▬'.repeat(filled) + '🔘' + '▬'.repeat(barLength - filled);

    // Embed com informações detalhadas
    const embed = createEmbed({
      color: settings.colors.primary,
      author: createEmbedAuthor(interaction.user),
      title: `${settings.emojis.static.mikugiggle} ${t(
        locale,
        'commands.nowplaying.success.title'
      )}`,
      description: `[${currentTrack.title}](${currentTrack.uri})`,
      fields: [
        {
          name: t(locale, 'commands.nowplaying.fields.author'),
          value: currentTrack.author || 'Desconhecido',
          inline: true,
        },
        {
          name: t(locale, 'commands.nowplaying.fields.duration'),
          value: `${formatDuration(current)} / ${formatDuration(total)}`,
          inline: true,
        },
        {
          name: t(locale, 'commands.nowplaying.fields.loop'),
          value: `${loopStatus[currentMode]}`,
          inline: true,
        },
        {
          name: t(locale, 'commands.nowplaying.fields.volume'),
          value: `${player.volume}%`,
          inline: true,
        },
        {
          name: t(locale, 'commands.nowplaying.fields.progress'),
          value: `\`${progressBar}\``,
        },
      ],
      thumbnail: {
        url:
          currentTrack.artworkUrl ??
          'https://media.discordapp.net/attachments/1323017360269119520/1363748868491186247/grand-teton-national-park-orange-sky-0e6tx144tyhttq4x_1.png?ex=6918b8db&is=6917675b&hm=aae81383b5c6d6718ffcc72bc037bf40b70285cc15025d1ecf78c46748ca05e3&=&format=webp&quality=lossless&width=822&height=548',
      },
      footer: {
        text: t(locale, 'commands.nowplaying.fields.requested_by', {
          username: `${
            currentTrack.requester.username ?? interaction.user.username
          }`,
        }),
      },
      timestamp: new Date(),
    });

    return interaction.editReply({ embeds: [embed] });
  },
});
