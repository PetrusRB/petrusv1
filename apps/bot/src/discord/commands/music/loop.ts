import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember, ApplicationCommandType } from 'discord.js';
import { t, getLocale } from 'i18n/index.js';
// Loop modes do Kazagumo
const KAZA_LOOP = ['none', 'track', 'queue'] as const;
type KazagumoLoop = (typeof KAZA_LOOP)[number];

export default createCommand({
  name: 'loop',
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

    const player = interaction.client.music.players.get(guild.id);
    if (!player) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.loop.errors.no_player'
        )}`,
      });
    }

    if (player.voiceId !== voiceChannel.id) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} ${t(
          locale,
          'commands.loop.errors.different_voice_channel'
        )}`,
      });
    }

    // modo atual
    const currentMode: KazagumoLoop = player.loop ?? 'none';

    const currentIndex = KAZA_LOOP.indexOf(currentMode);
    const nextMode: KazagumoLoop =
      KAZA_LOOP[(currentIndex + 1) % KAZA_LOOP.length];
    const afterNextMode: KazagumoLoop =
      KAZA_LOOP[(currentIndex + 2) % KAZA_LOOP.length];

    // Aplicar loop no Kazagumo
    player.setLoop(nextMode);

    const modeName = t(locale, `commands.loop.modes.${nextMode}`);
    const nextModeName = t(locale, `commands.loop.modes.${afterNextMode}`);

    const embed = createEmbed({
      color: settings.colors.primary,
      author: createEmbedAuthor(interaction.user),
      title: `🔁 ${t(locale, 'commands.loop.success.title')}`,
      description: t(locale, 'commands.loop.success.description', {
        mode: modeName,
        next: nextModeName,
      }),
      footer: {
        text: t(locale, 'commands.loop.fields.changed_by', {
          username: interaction.user.username,
        }),
      },
      timestamp: new Date(),
    });

    return interaction.editReply({ embeds: [embed] });
  },
});
