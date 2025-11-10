import {
  ButtonBuilder,
  ButtonStyle,
  type InteractionReplyOptions,
} from 'discord.js';
import { createEmbed, createRow, brBuilder } from '@magicyan/discord';
import { ServerInfo } from '@magicyan/minecraft';
import { settings } from '#settings';

export function serverMenu<R>(info: ServerInfo, type: string): R {
  const ip = info.hostname ?? info.ip;
  const isOnline = info.online;

  const descriptionLines = [
    `🟢 **IP do Servidor:** \`${ip}\``,
    `🌐 **Porta:** \`${info.port}\``,
    isOnline
      ? `📄 **Descrição:** \`${info.motd || 'Sem descrição'}\``
      : '🔴 **Servidor Offline**',
    isOnline
      ? `🧩 **Versão:** \`${(info.version || 'Desconhecida')
          .replace('Requires', '')
          .trim()}\``
      : null,
    isOnline
      ? `🎮 **Modo de Jogo:** \`${info.gamemode || 'Desconhecido'}\``
      : null,
    isOnline
      ? `👥 **Jogadores Online:** \`${info.players.online}/${info.players.max}\``
      : null,
    isOnline && 'ping' in info ? `📶 **Ping:** \`${info.ping}ms\`` : null,
    `📌 **Categoria:** \`${type}\``,
  ].filter(Boolean);

  const embed = createEmbed({
    color: isOnline ? settings.colors.green : settings.colors.danger,
    title: `${settings.emojis.anim.cube} ${
      isOnline ? 'Servidor Online!' : 'Servidor Offline'
    }`,
    description: brBuilder(...descriptionLines),
  });

  const prefix = (action: string) => `servers/${type}/${action}/${ip}`;

  const components = [
    createRow(
      new ButtonBuilder({
        customId: prefix('refresh'),
        label: '🔄 Atualizar',
        style: ButtonStyle.Primary,
      }),
      new ButtonBuilder({
        customId: prefix('search'),
        label: '🔍 Buscar',
        style: ButtonStyle.Secondary,
      })
    ),
  ];

  return {
    embeds: [embed],
    content: '',
    components,
  } satisfies InteractionReplyOptions as R;
}
