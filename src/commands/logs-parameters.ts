import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command, ConfigurationsProperty, Entry } from "../types/collection";
import { isCategory } from "../utils/channel";
import logger from "../utils/logs/logger";
import { createLogsMessage } from "../utils/logs/sendLog";
import { readConfigurationsFile, writeConfigurationsFile } from "../utils/readWriteFile";

enum logName {
	"modifier-parametres-interactions" = "interaction",
	"modifier-parametres-messages" = "message",
	"modifier-parametres-membres" = "member",
}

export const logParameters: Command = {
	basePermission: PermissionsBitField.Flags.ViewAuditLog,
	data: new SlashCommandBuilder()
		.setName("logs-parametres")
		.setDescription("Configuration des logs.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("modifier-parametres-interactions")
				.setDescription("Modifier les paramètres des intéractions (bouton/commande/réaction).")
				.addChannelOption((option) => option.setName("salon_id").setDescription("ID du salon.").setRequired(true))
				.addBooleanOption((option) =>
					option.setName("button").setDescription("Voulez-vous activer les logs des boutons.")
				)
				.addBooleanOption((option) =>
					option.setName("command").setDescription("Voulez-vous activer les logs des commandes.")
				)
				.addBooleanOption((option) =>
					option.setName("reaction").setDescription("Voulez-vous activer les logs des réactions.")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("modifier-parametres-messages")
				.setDescription("Modifier les paramètres des messages (édité/supprimé).")
				.addChannelOption((option) =>
					option.setName("salon_id").setDescription("ID du salon pour les logs des messages.").setRequired(true)
				)
				.addChannelOption((option) => option.setName("salon_id_add").setDescription("ID du salon à rajouter aux logs."))
				.addChannelOption((option) =>
					option.setName("salon_id_remove").setDescription("ID du salon à enlever des logs.")
				)
				.addBooleanOption((option) =>
					option.setName("update").setDescription("Voulez-vous activer les logs des messages édités.")
				)
				.addBooleanOption((option) =>
					option.setName("delete").setDescription("Voulez-vous activer les logs des messages supprimés.")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("modifier-parametres-membres")
				.setDescription("Modifier les paramètres des membres (arrivé/parti).")
				.addChannelOption((option) => option.setName("salon_id").setDescription("ID du salon.").setRequired(true))
				.addBooleanOption((option) =>
					option.setName("add").setDescription("Voulez-vous activer les logs des membres arrivant.")
				)
				.addBooleanOption((option) =>
					option.setName("remove").setDescription("Voulez-vous activer les logs des membres partant.")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("afficher-parametres").setDescription("Affiche les paramètres de tous les logs.")
		),
	async execute(interaction, client) {
		const channelId = interaction.options.getChannel("salon_id")?.id;
		const channelAdded = interaction.options.getChannel("salon_id_add")?.id;
		const channelRemoved = interaction.options.getChannel("salon_id_remove")?.id;
		const subCommandName = interaction.options.getSubcommand();
		const guildId = interaction.guildId ?? "";

		for (const id of [channelId, channelAdded, channelRemoved]) {
			if (!id) continue;

			const channel = await client.channels.fetch(id ?? "");

			if (isCategory(channel)) {
				return await interaction.reply({
					content: `Erreur: Le salon <#${id}> reçu est une catégorie !`,
					ephemeral: true,
				});
			}
		}

		const configurationsFile = await readConfigurationsFile(guildId);
		const configurationsObject = configurationsFile[guildId];

		function modifyLogParameters(logObject: ConfigurationsProperty) {
			const log = Object.entries(logObject) as Entry<ConfigurationsProperty>[];

			for (const [key, value] of log) {
				if (key === "channelsId") {
					if (channelAdded) {
						if (value.includes(channelAdded)) return "Erreur: Ce salon a déjà été enregistré !";

						value.push(channelAdded);
					} else if (channelRemoved) {
						if (!value.includes(channelRemoved)) return "Erreur: Ce salon n'a jamais été enregistré !";

						value.splice(value.indexOf(channelRemoved), 1);
					}

					continue;
				}

				if (key === "channelId") {
					logObject[key] = channelId ?? "";
					continue;
				}

				logObject[key] = interaction.options.getBoolean(key) ?? value ?? false;
			}

			return "";
		}

		switch (subCommandName) {
			case "modifier-parametres-interactions":
			case "modifier-parametres-messages":
			case "modifier-parametres-membres": {
				if (!channelId) throw new Error("Error: channelId missing for logs registration!");

				const logKey = logName[subCommandName as keyof typeof logName];
				const logObject = configurationsObject[logKey] as ConfigurationsProperty;

				const error = modifyLogParameters(logObject);

				if (error)
					return await interaction.reply({
						content: error,
						ephemeral: true,
					});

				break;
			}
			case "afficher-parametres": {
				return await interaction.reply({
					content: `Ci-dessous la liste des paramètres enregistrés:${createLogsMessage(configurationsObject)}`,
					ephemeral: true,
				});
			}
		}

		client.configurations.set(guildId, configurationsFile[guildId]);
		await writeConfigurationsFile(configurationsFile);

		logger.info(`Server "${interaction.guild?.name}": The configuration parameters of the logs have been updated!`);

		await interaction.reply({
			content: "Les paramètres de configuration des logs ont bien été mis à jour !",
			ephemeral: true,
		});
	},
};
