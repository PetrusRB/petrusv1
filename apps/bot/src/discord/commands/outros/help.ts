import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed, createEmbedAuthor } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

interface CommandInfo {
	name: string;
	description: string;
}

export default createCommand({
	name: "ajuda",
	description: "Mostra uma lista de todos os comandos disponíveis: /ajuda comando: meme",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "comando",
			description: "O comando que você deseja ver mais informações.",
			type: 3,
			required: false,
		},
	],
	async run(interaction): Promise<any> {
		const { options, user } = interaction;
		const argCommand = options.getString("comando")?.toLowerCase().trim();

		// Validate input to prevent injection or invalid characters
		if (argCommand && !/^[a-z0-9_-]{1,32}$/.test(argCommand)) {
			const invalidInputEmbed = createEmbed({
				author: createEmbedAuthor(user),
				title: `${settings.emojis.static.failed} Entrada inválida!`,
				description: "O nome do comando deve conter apenas letras, números, hífens ou sublinhados, até 32 caracteres.",
				color: settings.colors.danger,
				timestamp: new Date(),
			});
			return interaction.reply({ embeds: [invalidInputEmbed], ephemeral: true });
		}

		const commandsByCategory: Record<string, CommandInfo[]> = {};
		const commandsBasePath = path.resolve(import.meta.dirname, "../");

		try {
			const categories = await fs.readdir(commandsBasePath, { withFileTypes: true });

			for (const categoryDir of categories) {
				if (!categoryDir.isDirectory()) continue;

				// Sanitize category name to prevent injection
				const categoryName = categoryDir.name.replace(/[^a-zA-Z0-9_-]/g, "");
				if (!categoryName) continue; // Skip invalid category names

				const categoryPath = path.join(commandsBasePath, categoryName);

				// Ensure categoryPath is within commandsBasePath to prevent path traversal
				if (!categoryPath.startsWith(commandsBasePath)) {
					console.warn(`Tentativa de acesso fora do diretório de comandos: ${categoryPath}`);
					continue;
				}

				let commandFiles: string[];
				try {
					commandFiles = await fs.readdir(categoryPath);
				} catch (error) {
					console.error(`Erro ao ler diretório da categoria ${categoryName}:`, error);
					continue;
				}

				const commands: CommandInfo[] = [];

				for (const fileName of commandFiles) {
					const ext = path.extname(fileName).toLowerCase();

					// Strictly validate file extensions
					if (ext !== ".js" && ext !== ".ts") continue;

					const fullPath = path.join(categoryPath, fileName);

					// Ensure fullPath is within categoryPath to prevent path traversal
					if (!fullPath.startsWith(categoryPath)) {
						console.warn(`Tentativa de acesso fora do diretório da categoria: ${fullPath}`);
						continue;
					}

					const fileURL = pathToFileURL(fullPath).href;

					try {
						const module = await import(fileURL);
						const command = module?.default;

						// Validate command object
						if (
							command &&
							typeof command === "object" &&
							typeof command.name === "string" &&
							typeof command.description === "string" &&
							/^[a-z0-9_-]{1,32}$/.test(command.name) &&
							command.description.length <= 100
						) {
							commands.push({
								name: command.name,
								description: command.description,
							});
						} else {
							console.warn(`Comando inválido ou sem nome/descrição válida: ${fileName}`);
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
						title: `${settings.emojis.static.failed} Comando não encontrado!`,
						description: `O comando \`${argCommand}\` não existe.`,
						color: settings.colors.danger,
						timestamp: new Date(),
					});
					return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
				}

				const embed = createEmbed({
					author: createEmbedAuthor(user),
					title: `${settings.emojis.static.slash} Comando: /${found.name}`,
					description: `➜ **${found.description}**`,
					color: settings.colors.yellow,
					timestamp: new Date(),
				});

				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			// List all commands
			const fields = Object.entries(commandsByCategory).map(([category, commands]) => ({
				name: `📂 ${category[0].toUpperCase() + category.slice(1)}`,
				value: commands.map((c) => `➜ \`/${c.name}\` — ${c.description}`).join("\n"),
				inline: false,
			}));

			if (fields.length === 0) {
				const embed = createEmbed({
					title: `${settings.emojis.static.failed} Nenhum comando encontrado!`,
					description: "Parece que não há comandos disponíveis no momento.",
					color: settings.colors.danger,
				});
				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}

			const embed = createEmbed({
				author: createEmbedAuthor(user),
				title: `${settings.emojis.static.rules} Central de Comandos`,
				description: "Veja abaixo todos os comandos organizados por categoria.",
				color: settings.colors.yellow,
				fields,
				footer: {
					text: "Use seus comandos com sabedoria!",
				},
				timestamp: new Date(),
			});

			await interaction.reply({ embeds: [embed], ephemeral: true });
		} catch (error) {
			console.error("Erro geral ao processar comando /ajuda:", error);
			const errorEmbed = createEmbed({
				author: createEmbedAuthor(user),
				title: `${settings.emojis.static.failed} Erro interno!`,
				description: "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
				color: settings.colors.danger,
				timestamp: new Date(),
			});
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}
	},
});