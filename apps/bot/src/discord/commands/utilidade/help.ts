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
  Message,
  MessageComponentInteraction,
} from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import { getLocale, t } from 'i18n/index.ts';
import { res } from '#functions';

interface LoadedCommand {
  name: string;
  description: string;
}

type LoadedCategories = Record<string, LoadedCommand[]>;

let cachedCommands: LoadedCategories | null = null;

async function loadCommands(locale: any): Promise<LoadedCategories> {
  if (cachedCommands) return cachedCommands;

  try {
    const base = path.resolve(import.meta.dirname, '../');
    const categories = await fs.readdir(base, { withFileTypes: true });
    const result: LoadedCategories = {};

    for (const dirent of categories) {
      if (!dirent.isDirectory()) continue;

      const folderName = dirent.name.toLowerCase();
      const fullPath = path.join(base, folderName);

      const files = await fs.readdir(fullPath).catch(() => []);
      const list: LoadedCommand[] = [];

      // carregamento dos arquivos dentro da categoria
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
        } catch (e) {
          // fail silently (evita crash por arquivo quebrado)
          // console.warn(`help: failed to import ${url}`, e);
          continue;
        }
      }

      if (list.length) result[folderName] = list;
    }

    cachedCommands = result;
    return result;
  } catch (e) {
    // Em caso extremo, retorna objeto vazio ao invés de crashar
    // console.error('help: loadCommands failed', e);
    return {};
  }
}

function getCategoryEmoji(category: string) {
  const map = settings.emojis.categories as Record<string, string>;
  return map?.[category] ?? '📁';
}

function buildHomeEmbed(
  user: User,
  locale: any,
  interaction: CommandInteraction,
  categories: LoadedCategories
) {
  const categoriesList = Object.keys(categories)
    .map((key) => {
      const translated = t(locale, `category.${key}`);
      return `${getCategoryEmoji(key)} **${translated}**`;
    })
    .join('\n');

  return createEmbed({
    author: createEmbedAuthor(user),
    title: `${settings.emojis.help.home} ${t(
      locale,
      'commands.help.success.title'
    )}`,
    description: `> ${t(
      locale,
      'commands.help.success.description'
    )}\n\n${categoriesList}`,
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
  categoryKey: string,
  commands: LoadedCommand[]
) {
  const categoryName = t(locale, `category.${categoryKey}`);

  return createEmbed({
    author: createEmbedAuthor(user),
    title: `${getCategoryEmoji(categoryName)} ${categoryName}`,
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

function chunkButtons(buttons: ButtonBuilder[], size = 5) {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < buttons.length; i += size) {
    const slice = buttons.slice(i, i + size);
    rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...slice));
  }
  return rows;
}

function buildHomeButtons(locale: any, categoryKeys: string[]) {
  const buttons = categoryKeys.map((key) =>
    new ButtonBuilder()
      .setCustomId(`help-cat:${key}`) // ✅ ID usa chave original
      .setLabel(t(locale, `category.${key}`)) // ✅ Label traduzido
      .setEmoji(getCategoryEmoji(key))
      .setStyle(ButtonStyle.Primary)
  );

  const rows = chunkButtons(buttons, 5);

  // STOP row (sempre último)
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
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('help-home')
        .setEmoji('🏠')
        .setStyle(ButtonStyle.Secondary)
    ),
  ];
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
    fr: 'Afficher les informations du bot telles que : commandes, astuces, etc.',
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

  async run(interaction: CommandInteraction): Promise<void> {
    const user = interaction.user;
    const locale = getLocale(interaction.locale);
    const arg = interaction.options.get('command')?.value as string | undefined;
    const query = arg?.toLowerCase().trim();

    // Validação de query
    if (query && !/^[a-z0-9_-]{1,32}$/.test(query)) {
      await interaction
        .reply({
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
        })
        .catch(() => {});
      return;
    }

    const categories = await loadCommands(locale);

    // pesquisa por comando específico
    if (query) {
      const found = Object.values(categories)
        .flat()
        .find((c) => c.name.toLowerCase() === query);
      if (!found) {
        await interaction
          .reply({
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
          })
          .catch(() => {});
        return;
      }

      await interaction
        .reply({
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
        })
        .catch(() => {});
      return;
    }

    const keys = Object.keys(categories);
    if (!keys.length) {
      await interaction
        .reply({
          embeds: [
            createEmbed({
              title: t(locale, 'commands.help.noCommands.title'),
              description: t(locale, 'commands.help.noCommands.description'),
              color: settings.colors.danger,
            }),
          ],
        })
        .catch(() => {});
      return;
    }

    const homeEmbed = buildHomeEmbed(user, locale, interaction, categories);
    const homeButtons = buildHomeButtons(locale, keys);

    // envia a mensagem inicial
    const replyMsg = (await interaction
      .reply({
        embeds: [homeEmbed],
        components: homeButtons,
      })
      .catch(() => null)) as Message | null;

    if (!replyMsg) return;

    const filter = (i: MessageComponentInteraction) => i.user.id === user.id;
    const collector = replyMsg.createMessageComponentCollector({
      filter,
      time: 5 * 60 * 1000,
    });

    const endEmbed = createEmbed({
      title: `**🛑 ${t(locale, 'commands.help.endEmbed.title')}**`,
      description: `${t(locale, 'commands.help.endEmbed.description')}`,
      color: settings.colors.danger,
    });

    collector.on('collect', async (btn) => {
      const [type, param] = String(btn.customId).split(':');
      await btn.deferUpdate().catch(() => {});

      if (!replyMsg) {
        return;
      }

      if (type === 'help-cat') {
        const categoryKey = param;
        const commands = categories[categoryKey];
        if (!commands) {
          await replyMsg.edit({
            embeds: [
              createEmbed({
                title: t(locale, 'commands.help.errors.not_found_title'),
                description: t(
                  locale,
                  'commands.help.errors.not_found_description',
                  { cmd: categoryKey }
                ),
                color: settings.colors.danger,
              }),
            ],
          });
          return;
        }

        await replyMsg.edit({
          embeds: [
            buildCategoryEmbed(
              user,
              locale,
              interaction,
              categoryKey,
              commands
            ),
          ],
          components: buildCategoryButtons(),
        });
        return;
      }

      if (type === 'help-home') {
        await replyMsg.edit({
          embeds: [homeEmbed],
          components: homeButtons,
        });
        return;
      }

      if (type === 'help-stop') {
        collector.stop('stop');
        await replyMsg.edit({ embeds: [endEmbed], components: [] });
        return;
      }
    });

    collector.on('end', async (_, reason) => {
      // se já parou via stop nós já editamos; edita apenas em timeouts
      if (reason === 'stop') return;
      await replyMsg.edit({ embeds: [endEmbed], components: [] });
    });
  },
});
