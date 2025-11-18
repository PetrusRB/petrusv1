import { createCommand } from '#base';
import { settings } from '#settings';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  User,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { getLocale, t } from 'i18n/index.ts';

interface LoadedCommand {
  name: string;
  description: string;
}

type LoadedCategories = Record<string, LoadedCommand[]>;

let cachedCommands: LoadedCategories | null = null;

async function loadCommands(): Promise<LoadedCategories> {
  if (cachedCommands) return cachedCommands;

  const base = path.resolve(import.meta.dirname, '../');
  const categories = await fs.readdir(base, { withFileTypes: true });

  const result: LoadedCategories = {};

  for (const dir of categories) {
    if (!dir.isDirectory()) continue;

    const categoryName = dir.name.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!categoryName) continue;

    const fullPath = path.join(base, categoryName);
    const files = await fs.readdir(fullPath).catch(() => []);

    const list: LoadedCommand[] = [];

    for (const file of files) {
      if (!/\.(js|ts)$/.test(file)) continue;

      const url = pathToFileURL(path.join(fullPath, file)).href;

      try {
        const mod = await import(url);
        const cmd = mod?.default;

        if (!cmd?.name || !cmd?.description) continue;

        list.push({
          name: String(cmd.name),
          description: String(cmd.description),
        });
      } catch {
        continue;
      }
    }

    if (list.length) result[categoryName] = list;
  }

  cachedCommands = result;
  return result;
}

function getCategoryEmoji(category: string) {
  const map = settings.emojis.categories as Record<string, string>;
  return map[category] ?? '📁';
}

function buildHomeEmbed(
  user: User,
  locale: any,
  interaction: CommandInteraction,
  categories: LoadedCategories
) {
  return createEmbed({
    author: createEmbedAuthor(user),
    title: `${settings.emojis.help.home} ${t(
      locale,
      'commands.help.success.title'
    )}`,
    description:
      `> ${t(locale, 'commands.help.success.description')}\n\n` +
      Object.keys(categories)
        .map((c) => `${getCategoryEmoji(c) || '📂'} **${c}**`)
        .join('\n'),

    thumbnail: { url: interaction.client.user.displayAvatarURL() },
    color: settings.colors.yellow,
    footer: { text: t(locale, 'commands.help.success.footer') },
    timestamp: new Date(),
  });
}

function buildCategoryEmbed(
  user: User,
  locale: any,
  interaction: CommandInteraction,
  categoryName: string,
  commands: LoadedCommand[]
) {
  return createEmbed({
    author: createEmbedAuthor(user),
    title: `${getCategoryEmoji(categoryName) ?? '📂'} ${categoryName}`,
    description: `> ${t(locale, 'commands.help.success.description')}\n\n---`,
    thumbnail: { url: interaction.client.user.displayAvatarURL() },
    color: settings.colors.yellow,

    fields: commands.map((cmd) => ({
      name: `• \`/${cmd.name}\``,
      value: `> ${cmd.description}`,
    })),

    footer: { text: `Categoria: ${categoryName}` },
    timestamp: new Date(),
  });
}

/* ------------------ COMPONENTES ------------------ */

function buildHomeButtons(categories: string[]) {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  let buffer: ButtonBuilder[] = [];

  for (const c of categories) {
    buffer.push(
      new ButtonBuilder()
        .setCustomId(`help-cat:${c}`)
        .setLabel(c)
        .setEmoji(getCategoryEmoji(c) ?? '📁')
        .setStyle(ButtonStyle.Primary)
    );

    if (buffer.length === 5) {
      rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...buffer));
      buffer = [];
    }
  }

  // Se sobrar botões no buffer, cria mais uma row
  if (buffer.length) {
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...buffer));
  }

  // Última row reservada ao botão STOP
  rows.push(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('help-stop')
        .setEmoji('🛑')
        .setStyle(ButtonStyle.Danger)
    )
  );

  return rows;
}

function buildCategoryButtons() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('help-home')
      .setEmoji('🏠')
      .setStyle(ButtonStyle.Secondary)
  );
}

export default createCommand({
  name: 'help',
  nameLocalizations: {
    'pt-BR': 'ajuda',
    'es-ES': 'ajuda',
    fr: 'aide',
  },
  description: 'Shows bot information such as: commands, tips, etc.',
  descriptionLocalizations: {
    'pt-BR': 'Mostra informações do bot, tais como: comandos, exemplos, etc.',
    'es-ES': 'Muestra información sobre el bot, como comandos, consejos, etc.',
    fr: 'Afficher les informations du bot telles que : commandes, astuces, etc.',
    ja: 'コマンド、ヒントなど、ボットに関する情報を表示します。',
  },
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'command',
      nameLocalizations: {
        'pt-BR': 'comando',
        'es-ES': 'comando',
        fr: 'commande',
        ja: 'コマンド',
      },
      description: 'The command you want more info',
      descriptionLocalizations: {
        'pt-BR': 'O comando que você quer mais informações',
        'es-ES': 'El comando del que desea obtener más información',
        fr: "La commande sur laquelle vous souhaitez obtenir plus d'informations",
        ja: '詳細情報を知りたいコマンド',
      },
      type: ApplicationCommandOptionType.String,
    },
  ],

  async run(interaction: CommandInteraction): Promise<any> {
    const user = interaction.user;
    const locale = getLocale(interaction.locale);

    const arg = interaction.options.get('command')?.value as string | undefined;
    const query = arg?.toLowerCase().trim();

    /* ---------------- VALIDAR ARG ---------------- */
    if (query && !/^[a-z0-9_-]{1,32}$/.test(query)) {
      return interaction.reply({
        embeds: [
          createEmbed({
            author: createEmbedAuthor(user),
            title: `${settings.emojis.static.failed} ${t(
              locale,
              'commands.help.errors.invalid_input_title'
            )}`,
            description: t(
              locale,
              'commands.help.errors.invalid_input_description'
            ),
            color: settings.colors.danger,
          }),
        ],
        ephemeral: true,
      });
    }

    const categories = await loadCommands();

    /* ---------------- BUSCA DIRETA ---------------- */
    if (query) {
      const found = Object.values(categories)
        .flat()
        .find((cmd) => cmd.name.toLowerCase() === query);

      if (!found) {
        return interaction.reply({
          embeds: [
            createEmbed({
              author: createEmbedAuthor(user),
              title: `${settings.emojis.static.failed} ${t(
                locale,
                'commands.help.errors.not_found_title'
              )}`,
              description: t(
                locale,
                'commands.help.errors.not_found_description',
                { cmd: query }
              ),
              color: settings.colors.danger,
            }),
          ],
          ephemeral: true,
        });
      }

      return interaction.reply({
        embeds: [
          createEmbed({
            author: createEmbedAuthor(user),
            title: `${settings.emojis.static.slash} ${t(
              locale,
              'commands.help.noCommands.title'
            )}`,
            description: `➜ **${found.description}**`,
            color: settings.colors.yellow,
          }),
        ],
        ephemeral: true,
      });
    }

    /* ---------------- PAGINAÇÃO ---------------- */
    const keys = Object.keys(categories);
    if (!keys.length) {
      return interaction.reply({
        embeds: [
          createEmbed({
            title: t(locale, 'commands.help.noCommands.title'),
            description: t(locale, 'commands.help.noCommands.description'),
            color: settings.colors.danger,
          }),
        ],
        ephemeral: true,
      });
    }

    let index = 0;
    const homeEmbed = buildHomeEmbed(user, locale, interaction, categories);

    const replyMsg = await interaction.reply({
      embeds: [buildHomeEmbed(user, locale, interaction, categories)],
      components: buildHomeButtons(keys),
      ephemeral: true,
      fetchReply: true,
    });

    const collector = replyMsg.createMessageComponentCollector({
      time: 5 * 60 * 1000,
      filter: (i) => i.user.id === user.id,
    });
    const endEmbed = createEmbed({
      title: `**🛑 ${t(locale, 'commands.help.endEmbed.title')}**`,
      description: `${t(locale, 'commands.help.endEmbed.description')}`,
      color: settings.colors.danger,
    });

    collector.on('collect', async (btn) => {
      const [type, param] = btn.customId.split(':');

      if (type === 'help-cat') {
        const name = param;
        const commands = categories[name];

        await btn.update({
          embeds: [
            buildCategoryEmbed(user, locale, interaction, name, commands),
          ],
          components: [buildCategoryButtons()],
        });
        return;
      }

      if (type === 'help-home') {
        await btn.update({
          embeds: [homeEmbed],
          components: buildHomeButtons(keys),
        });
        return;
      }

      if (type === 'help-stop') {
        collector.stop('stop');
        await btn.update({ embeds: [endEmbed], components: [] });
      }
    });

    collector.on('end', async () => {
      try {
        await replyMsg.edit({ embeds: [endEmbed], components: [] });
      } catch {}
    });
  },
});
