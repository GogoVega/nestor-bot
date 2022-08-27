import { ChannelType, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command, Configurations, ConfigurationsProperty } from "../types/collection";
import logger from "../utils/logs/logger";
import { readConfigurationsFile, writeConfigurationsFile } from "../utils/readWriteFile";

export const logParameters: Command = {
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
				.addChannelOption((option) => option.setName("salon_id").setDescription("ID du salon.").setRequired(true))
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
		const getChannelId = interaction.options.getChannel("salon_id", false)?.id;
		const subCommandName = interaction.options.getSubcommand();
		const guildId = interaction.guildId ?? "";

		if (!interaction.inGuild()) return;
		if (!interaction.channel?.permissionsFor(interaction.user)?.has(PermissionsBitField.Flags.ViewAuditLog))
			return await interaction.reply({
				content: "Erreur: Vous ne disposez pas des autorisations requises! (Audit Log)",
				ephemeral: true,
			});
		if (getChannelId) {
			const channel = await client.channels.fetch(getChannelId);

			//if (channel?.isDMBased()) return;
			if (channel?.type === ChannelType.DM) return;
			if (channel?.type === ChannelType.GroupDM) return;

			if (!channel?.parent) {
				return await interaction.reply({
					content: "Erreur: Ce n'est pas un salon mais une catégorie !",
					ephemeral: true,
				});
			}
		}

		const configurationsFile = await readConfigurationsFile(guildId);
		const configurationsObject = configurationsFile[guildId];

		function modifyLogsParameter(logObject: ConfigurationsProperty) {
			Object.entries(logObject).forEach(([name, value]) => {
				if (name === "channelsId") return;
				if (name === "channelId") {
					value = getChannelId;
					return;
				}
				const oldState: boolean | undefined = value;
				value = interaction.options.getBoolean(name) ?? oldState ?? false;
			});
		}

		switch (subCommandName) {
			case "modifier-parametres-interactions":
			case "modifier-parametres-messages":
			case "modifier-parametres-membres": {
				if (!getChannelId) throw new Error("Error: channelId missing for logs registration!");

				const logsName: Record<string, string> = {
					"modifier-parametres-interactions": "interaction",
					"modifier-parametres-messages": "message",
					"modifier-parametres-membres": "member",
				};

				const logObject = configurationsObject[
					logsName[subCommandName] as keyof typeof configurationsObject
				] as ConfigurationsProperty;

				modifyLogsParameter(logObject);

				break;
			}
			case "afficher-parametres": {
				const getState = function getState(parameter: boolean) {
					return parameter ? "Activé" : "Désactivé";
				};

				const state = function state(parameter: Configurations) {
					const output: string[] = [];
					Object.entries(parameter).forEach(([key, value]) => {
						if (key === "channels") return;

						output.push(`\n\n• **${key.toUpperCase()}**`);
						const log = value as ConfigurationsProperty;

						if (log.channelId === "") output.push("\n```diff\n- Aucun paramètre enregistré!```");
						Object.entries(log).forEach(([name, state]) => {
							const test: Record<string, string> = {
								add: `\n  • **Log des nouveaux membres** : ${getState(state)}`,
								button: `\n  • **Log des boutons** : ${getState(state)}`,
								channelId: `\n  • **Salon utilisé** : <#${state}>`,
								command: `\n  • **Log des commandes** : ${getState(state)}`,
								delete: `\n  • **Log des messages supprimés** : ${getState(state)}`,
								reaction: `\n  • **Log des réactions** : ${getState(state)}`,
								remove: `\n  • **Log des membres sortants** : ${getState(state)}`,
								update: `\n  • **Log des messages édités** : ${getState(state)}`,
							};
							output.push(test[name]);
						});
					});
					return output;
				};

				/*
				if (Object.keys(configurationsObject).length === 0) {
					parameters.push("```diff\n- Aucun paramètre enregistré!```");
				} else {
					parameters.push(
						`\n• **Salon utilisé** : <#${channelId}>\n• **Log des boutons** : ${getState(
							button
						)}\n• **Log des commandes** : ${getState(command)}\n• **Log des réactions** : ${getState(reaction)}\n`
					);
				}*/
				return await interaction.reply({
					content: `Ci-dessous la liste des paramètres enregistrés:${state(configurationsObject)
						.toString()
						.replace(/,/gm, "")}`,
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
