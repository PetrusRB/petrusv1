import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';
import prettyMs from 'pretty-ms';

export default createCommand({
  name: 'nowplaying',
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
    if (player.voiceId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.nowplaying.errors.different_voice_channel'
        )}`,
      });
    }

    const currentTrack = player.queue.current;
    if (!currentTrack) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.nowplaying.errors.no_track'
        )}`,
      });
    }

    // Progresso formatado
    const current = player.position || 0;
    const total = player.queue.durationLength || 0;
    const progress = Math.min(current / total, 1);
    const barLength = 20;
    const filled = Math.round(barLength * progress);
    const progressBar =
      '▬'.repeat(filled) + '🔘' + '▬'.repeat(barLength - filled);

    // Embed com informações detalhadas
    const embed = createEmbed({
      color: settings.colors.primary,
      author: createEmbedAuthor(interaction.user),
      title: `🎶 ${t(locale, 'commands.nowplaying.success.title')}`,
      description: t(locale, 'commands.nowplaying.success.description', {
        track: `[${currentTrack.title}](${currentTrack.uri})`,
      }),
      fields: [
        {
          name: t(locale, 'commands.nowplaying.fields.author'),
          value: currentTrack.author || 'Desconhecido',
          inline: true,
        },
        {
          name: t(locale, 'commands.nowplaying.fields.duration'),
          value: `${prettyMs(current)} / ${prettyMs(total)}`,
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
          currentTrack.thumbnail ??
          'https://media.discordapp.net/attachments/1323017360269119520/1363748868491186247/grand-teton-national-park-orange-sky-0e6tx144tyhttq4x_1.png?ex=6918b8db&is=6917675b&hm=aae81383b5c6d6718ffcc72bc037bf40b70285cc15025d1ecf78c46748ca05e3&=&format=webp&quality=lossless&width=822&height=548',
      },
      footer: {
        text: t(locale, 'commands.nowplaying.fields.requested_by', {
          username: `${currentTrack.requester ?? interaction.user.username}`,
        }),
      },
      timestamp: new Date(),
    });

    return interaction.editReply({ embeds: [embed] });
  },
});
