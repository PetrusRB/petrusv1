import { createCommand } from '#base';
import { logger, settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { GuildMember } from 'discord.js';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from 'discord.js';
import { formatDuration } from 'discord/utils/duration.js';
import { z } from 'zod';
import { t, getLocale } from 'i18n/index.js';
import { KazagumoPlayer, PlayerState } from 'kazagumo';

// ─────────────────────────────────────────
// Função auxiliar: Detectar tipo de busca
// ─────────────────────────────────────────
function detectEngine(query: string): 'spotify' | 'apple' {
  const q = query.toLowerCase();

  if (q.includes('open.spotify.com')) return 'spotify';
  if (q.includes('music.apple.com')) return 'apple';

  return 'spotify';
}

// ─────────────────────────────────────────
// Schema para validação
// ─────────────────────────────────────────
const schema = z.object({
  query: z
    .string()
    .min(1, { message: 'Minimo 1 caracteres' })
    .max(100, { message: 'Maximo 100 caracteres' }),
});

export default createCommand({
  name: 'play',
  description: 'Tocar uma musiquinha legal',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'query',
      description: 'Nome ou link da música',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });

    const { guild, member, client, channelId } = interaction;
    const locale = getLocale(interaction.locale);
    const query = interaction.options.getString('query', true);

    // ─────────────────────────────────────────
    // 1. Validar input
    // ─────────────────────────────────────────
    const parsed = schema.safeParse({ query });
    if (!parsed.success) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} - ${t(
          locale,
          'commands.play.errors.validation_failed'
        )}`,
      });
    }

    if (!(member instanceof GuildMember)) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} - ${t(
          locale,
          'commands.play.errors.no_member_info'
        )}`,
      });
    }

    // ─────────────────────────────────────────
    // 2. Checar canal de voz
    // ─────────────────────────────────────────
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} - ${t(
          locale,
          'commands.play.errors.not_in_voice'
        )}`,
      });
    }

    const permissions = voiceChannel.permissionsFor(client.user!);
    if (!permissions?.has(['Connect', 'Speak'])) {
      return interaction.editReply({
        content: `${settings.emojis.static.failed} - ${t(
          locale,
          'commands.play.errors.no_permission'
        )}`,
      });
    }

    try {
      // ─────────────────────────────────────────
      // 3. Obter o manager com segurança
      // ─────────────────────────────────────────
      const manager = client.music;

      if (!manager || !manager.shoukaku.nodes) {
        console.error('❌ getMusicManager retornou algo inválido:', manager);
        return interaction.editReply({
          content: `${settings.emojis.static.failed} - Sistema de música indisponível.`,
        });
      }

      // ─────────────────────────────────────────
      // 6. Obter / criar player
      // ─────────────────────────────────────────
      let player = manager.players?.get(guild.id) as KazagumoPlayer | undefined;

      if (!player) {
        player = await manager.createPlayer({
          guildId: guild.id,
          voiceId: voiceChannel.id,
          textId: channelId,
          shardId: client.guilds.cache.get(guild.id)?.shardId ?? 0,
          deaf: true,
          volume: 100,
        });
      }

      // conectar apenas se não estiver conectado
      if (player.state !== PlayerState.CONNECTED) {
        await player.connect();
      }

      // ─────────────────────────────────────────
      // 7. Buscar música
      // ─────────────────────────────────────────
      const engine = detectEngine(query);
      const result = await manager.search(query, {
        requester: interaction.user,
        engine: engine,
      });

      if (!result?.tracks?.length) {
        return interaction.editReply({
          content: `${settings.emojis.static.failed} - ${t(
            locale,
            'commands.play.errors.no_results',
            { query }
          )}`,
        });
      }

      // Adicionar à fila
      if (result?.type === 'PLAYLIST') {
        for (const track of result.tracks) player.queue.add(track);
      } else {
        player.queue.add(result.tracks[0]);
      }

      // Tocar se estiver parado
      if (!player.playing && !player.paused && player.queue.size > 0) {
        await player.play();
      }

      // ─────────────────────────────────────────
      // 8. Embed bonitão
      // ─────────────────────────────────────────
      const track = result.tracks[0];

      const embed = createEmbed({
        color: settings.colors.primary,
        author: createEmbedAuthor(interaction.user),
        title:
          result.type === 'PLAYLIST'
            ? `${settings.emojis.static.daftpunk} Playlist adicionada`
            : `${settings.emojis.static.purpleipod} Tocando agora`,
        description:
          result.type === 'PLAYLIST'
            ? `${result.tracks.length} músicas adicionadas à fila`
            : `**[${track.title}](${track.uri})**\n${track.author}`,
        thumbnail:
          track.thumbnail ??
          'https://media.discordapp.net/attachments/1323017360269119520/1363748868491186247/grand-teton-national-park-orange-sky-0e6tx144tyhttq4x_1.png?ex=6918b8db&is=6917675b&hm=aae81383b5c6d6718ffcc72bc037bf40b70285cc15025d1ecf78c46748ca05e3&=&format=webp&quality=lossless&width=822&height=548',
        fields:
          result.type === 'PLAYLIST'
            ? []
            : [
                {
                  name: 'Duração',
                  value: player.queue.durationLength
                    ? formatDuration(player.queue.durationLength)
                    : 'Ao vivo',
                  inline: true,
                },
                {
                  name: 'Posição',
                  value:
                    player.queue.size === 1
                      ? 'Tocando'
                      : `#${player.queue.size}`,
                  inline: true,
                },
              ],
        footer: {
          text: `Pedido por ${interaction.user.username}`,
        },
        timestamp: new Date(),
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error('Erro ao tocar música:', error);
      return interaction.editReply({
        content: `${settings.emojis.static.failed} - ${t(
          locale,
          'commands.play.errors.generic_error'
        )}`,
      });
    }
  },
});
