import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed, createEmbedAuthor } from '@magicyan/discord';
import {
  ApplicationCommandType,
  Locale,
  ApplicationCommandOptionType,
} from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

interface CommandInfo {
  name: string;
  description: string;
}

// Sistema de traduções
const translations = {
  name: {
    [Locale.EnglishUS]: 'help',
    [Locale.PortugueseBR]: 'ajuda',
    [Locale.SpanishES]: 'ayuda',
    [Locale.French]: 'aide',
    [Locale.German]: 'hilfe',
    [Locale.Italian]: 'aiuto',
    [Locale.Japanese]: 'ヘルプ',
    [Locale.Korean]: '도움말',
  },
  description: {
    [Locale.EnglishUS]: 'Shows a list of all available commands',
    [Locale.PortugueseBR]: 'Mostra uma lista de todos os comandos disponíveis',
    [Locale.SpanishES]: 'Muestra una lista de todos los comandos disponibles',
    [Locale.French]: 'Affiche une liste de toutes les commandes disponibles',
    [Locale.German]: 'Zeigt eine Liste aller verfügbaren Befehle',
    [Locale.Italian]: 'Mostra un elenco di tutti i comandi disponibili',
    [Locale.Japanese]: '利用可能なすべてのコマンドのリストを表示します',
    [Locale.Korean]: '사용 가능한 모든 명령어 목록을 표시합니다',
  },
  option: {
    name: {
      [Locale.EnglishUS]: 'command',
      [Locale.PortugueseBR]: 'comando',
      [Locale.SpanishES]: 'comando',
      [Locale.French]: 'commande',
      [Locale.German]: 'befehl',
      [Locale.Italian]: 'comando',
      [Locale.Japanese]: 'コマンド',
      [Locale.Korean]: '명령어',
    },
    description: {
      [Locale.EnglishUS]: 'The command you want to see more information about',
      [Locale.PortugueseBR]: 'O comando que você deseja ver mais informações',
      [Locale.SpanishES]: 'El comando del que deseas ver más información',
      [Locale.French]: "La commande dont vous voulez plus d'informations",
      [Locale.German]: 'Der Befehl, über den Sie mehr erfahren möchten',
      [Locale.Italian]: 'Il comando di cui vuoi vedere più informazioni',
      [Locale.Japanese]: '詳細を表示したいコマンド',
      [Locale.Korean]: '자세한 정보를 보고 싶은 명령어',
    },
  },
  responses: {
    invalidInput: {
      title: {
        [Locale.EnglishUS]: 'Invalid input!',
        [Locale.PortugueseBR]: 'Entrada inválida!',
        [Locale.SpanishES]: '¡Entrada inválida!',
        [Locale.French]: 'Entrée invalide !',
        [Locale.German]: 'Ungültige Eingabe!',
      },
      description: {
        [Locale.EnglishUS]:
          'Command name must contain only letters, numbers, hyphens or underscores, up to 32 characters.',
        [Locale.PortugueseBR]:
          'O nome do comando deve conter apenas letras, números, hífens ou sublinhados, até 32 caracteres.',
        [Locale.SpanishES]:
          'El nombre del comando debe contener solo letras, números, guiones o guiones bajos, hasta 32 caracteres.',
        [Locale.French]:
          "Le nom de la commande ne doit contenir que des lettres, chiffres, tirets ou underscores, jusqu'à 32 caractères.",
      },
    },
    notFound: {
      title: {
        [Locale.EnglishUS]: 'Command not found!',
        [Locale.PortugueseBR]: 'Comando não encontrado!',
        [Locale.SpanishES]: '¡Comando no encontrado!',
        [Locale.French]: 'Commande introuvable !',
      },
      description: {
        [Locale.EnglishUS]: (cmd: string) =>
          `The command \`${cmd}\` does not exist.`,
        [Locale.PortugueseBR]: (cmd: string) =>
          `O comando \`${cmd}\` não existe.`,
        [Locale.SpanishES]: (cmd: string) => `El comando \`${cmd}\` no existe.`,
        [Locale.French]: (cmd: string) =>
          `La commande \`${cmd}\` n'existe pas.`,
      },
    },
    commandInfo: {
      title: {
        [Locale.EnglishUS]: (name: string) => `Command: /${name}`,
        [Locale.PortugueseBR]: (name: string) => `Comando: /${name}`,
        [Locale.SpanishES]: (name: string) => `Comando: /${name}`,
        [Locale.French]: (name: string) => `Commande : /${name}`,
      },
    },
    commandList: {
      title: {
        [Locale.EnglishUS]: 'Command Center',
        [Locale.PortugueseBR]: 'Central de Comandos',
        [Locale.SpanishES]: 'Centro de Comandos',
        [Locale.French]: 'Centre de Commandes',
        [Locale.German]: 'Befehlszentrale',
      },
      description: {
        [Locale.EnglishUS]: 'See below all commands organized by category.',
        [Locale.PortugueseBR]:
          'Veja abaixo todos os comandos organizados por categoria.',
        [Locale.SpanishES]:
          'Consulta a continuación todos los comandos organizados por categoría.',
        [Locale.French]:
          'Voir ci-dessous toutes les commandes organisées par catégorie.',
      },
      footer: {
        [Locale.EnglishUS]: 'Use your commands wisely!',
        [Locale.PortugueseBR]: 'Use seus comandos com sabedoria!',
        [Locale.SpanishES]: '¡Usa tus comandos con sabiduría!',
        [Locale.French]: 'Utilisez vos commandes à bon escient !',
      },
    },
    noCommands: {
      title: {
        [Locale.EnglishUS]: 'No commands found!',
        [Locale.PortugueseBR]: 'Nenhum comando encontrado!',
        [Locale.SpanishES]: '¡No se encontraron comandos!',
        [Locale.French]: 'Aucune commande trouvée !',
      },
      description: {
        [Locale.EnglishUS]:
          'It seems there are no commands available at the moment.',
        [Locale.PortugueseBR]:
          'Parece que não há comandos disponíveis no momento.',
        [Locale.SpanishES]:
          'Parece que no hay comandos disponibles en este momento.',
        [Locale.French]:
          "Il semble qu'il n'y ait aucune commande disponible pour le moment.",
      },
    },
    error: {
      title: {
        [Locale.EnglishUS]: 'Internal error!',
        [Locale.PortugueseBR]: 'Erro interno!',
        [Locale.SpanishES]: '¡Error interno!',
        [Locale.French]: 'Erreur interne !',
      },
      description: {
        [Locale.EnglishUS]:
          'An error occurred while processing your request. Please try again later.',
        [Locale.PortugueseBR]:
          'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.',
        [Locale.SpanishES]:
          'Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo más tarde.',
        [Locale.French]:
          "Une erreur s'est produite lors du traitement de votre demande. Veuillez réessayer plus tard.",
      },
    },
  },
};

// Helper para pegar tradução com fallback
function t(path: any, locale: string, ...args: any[]): string {
  const value = path[locale] || path[Locale.EnglishUS] || path['en-US'];
  return typeof value === 'function' ? value(...args) : value || '';
}

export default createCommand({
  name: 'help',
  nameLocalizations: translations.name,
  description: 'Shows a list of all available commands',
  descriptionLocalizations: translations.description,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'command',
      nameLocalizations: translations.option.name,
      description: 'The command you want to see more information about',
      descriptionLocalizations: translations.option.description,
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  async run(interaction): Promise<any> {
    const { options, user, locale } = interaction;
    const argCommand = options.getString('command')?.toLowerCase().trim();

    // Validate input to prevent injection or invalid characters
    if (argCommand && !/^[a-z0-9_-]{1,32}$/.test(argCommand)) {
      const invalidInputEmbed = createEmbed({
        author: createEmbedAuthor(user),
        title: `${settings.emojis.static.failed} ${t(
          translations.responses.invalidInput.title,
          locale
        )}`,
        description: t(translations.responses.invalidInput.description, locale),
        color: settings.colors.danger,
        timestamp: new Date(),
      });
      return interaction.reply({
        embeds: [invalidInputEmbed],
        ephemeral: true,
      });
    }

    const commandsByCategory: Record<string, CommandInfo[]> = {};
    const commandsBasePath = path.resolve(import.meta.dirname, '../');

    try {
      const categories = await fs.readdir(commandsBasePath, {
        withFileTypes: true,
      });

      for (const categoryDir of categories) {
        if (!categoryDir.isDirectory()) continue;

        // Sanitize category name to prevent injection
        const categoryName = categoryDir.name.replace(/[^a-zA-Z0-9_-]/g, '');
        if (!categoryName) continue;

        const categoryPath = path.join(commandsBasePath, categoryName);

        // Ensure categoryPath is within commandsBasePath to prevent path traversal
        if (!categoryPath.startsWith(commandsBasePath)) {
          console.warn(
            `Tentativa de acesso fora do diretório de comandos: ${categoryPath}`
          );
          continue;
        }

        let commandFiles: string[];
        try {
          commandFiles = await fs.readdir(categoryPath);
        } catch (error) {
          console.error(
            `Erro ao ler diretório da categoria ${categoryName}:`,
            error
          );
          continue;
        }

        const commands: CommandInfo[] = [];

        for (const fileName of commandFiles) {
          const ext = path.extname(fileName).toLowerCase();

          // Strictly validate file extensions
          if (ext !== '.js' && ext !== '.ts') continue;

          const fullPath = path.join(categoryPath, fileName);

          // Ensure fullPath is within categoryPath to prevent path traversal
          if (!fullPath.startsWith(categoryPath)) {
            console.warn(
              `Tentativa de acesso fora do diretório da categoria: ${fullPath}`
            );
            continue;
          }

          const fileURL = pathToFileURL(fullPath).href;

          try {
            const module = await import(fileURL);
            const command = module?.default;

            // Validate command object
            if (
              command &&
              typeof command === 'object' &&
              typeof command.name === 'string' &&
              typeof command.description === 'string' &&
              /^[a-z0-9_-]{1,32}$/.test(command.name) &&
              command.description.length <= 100
            ) {
              commands.push({
                name: command.name,
                description: command.description,
              });
            } else {
              console.warn(
                `Comando inválido ou sem nome/descrição válida: ${fileName}`
              );
            }
          } catch (error) {
            console.error(`Erro ao importar comando ${fileName}:`, error);
          }
        }

        if (commands.length) {
          commandsByCategory[categoryName] = commands;
        }
      }

      // Handle specific command query
      if (argCommand) {
        let found: CommandInfo | undefined;

        for (const commandList of Object.values(commandsByCategory)) {
          found = commandList.find((c) => c.name.toLowerCase() === argCommand);
          if (found) break;
        }

        if (!found) {
          const notFoundEmbed = createEmbed({
            author: createEmbedAuthor(user),
            title: `${settings.emojis.static.failed} ${t(
              translations.responses.notFound.title,
              locale
            )}`,
            description: t(
              translations.responses.notFound.description,
              locale,
              argCommand
            ),
            color: settings.colors.danger,
            timestamp: new Date(),
          });
          return interaction.reply({
            embeds: [notFoundEmbed],
            ephemeral: true,
          });
        }

        const embed = createEmbed({
          author: createEmbedAuthor(user),
          title: `${settings.emojis.static.slash} ${t(
            translations.responses.commandInfo.title,
            locale,
            found.name
          )}`,
          description: `➜ **${found.description}**`,
          color: settings.colors.yellow,
          timestamp: new Date(),
        });

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // List all commands
      const fields = Object.entries(commandsByCategory).map(
        ([category, commands]) => ({
          name: `📂 ${category[0].toUpperCase() + category.slice(1)}`,
          value: commands
            .map((c) => `➜ \`/${c.name}\` — ${c.description}`)
            .join('\n'),
          inline: false,
        })
      );

      if (fields.length === 0) {
        const embed = createEmbed({
          title: `${settings.emojis.static.failed} ${t(
            translations.responses.noCommands.title,
            locale
          )}`,
          description: t(translations.responses.noCommands.description, locale),
          color: settings.colors.danger,
        });
        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }

      const embed = createEmbed({
        author: createEmbedAuthor(user),
        title: `${settings.emojis.static.rules} ${t(
          translations.responses.commandList.title,
          locale
        )}`,
        description: t(translations.responses.commandList.description, locale),
        color: settings.colors.yellow,
        fields,
        footer: {
          text: t(translations.responses.commandList.footer, locale),
        },
        timestamp: new Date(),
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Erro geral ao processar comando /help:', error);
      const errorEmbed = createEmbed({
        author: createEmbedAuthor(user),
        title: `${settings.emojis.static.failed} ${t(
          translations.responses.error.title,
          locale
        )}`,
        description: t(translations.responses.error.description, locale),
        color: settings.colors.danger,
        timestamp: new Date(),
      });
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
});

