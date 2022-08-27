import { ChannelType, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/collection";
import logger from "../utils/logs/logger";
import { readConfigurationsFile, writeConfigurationsFile } from "../utils/readWriteFile";

export const logParameters: Command = {
	data: new SlashCommandBuilder()
		.setName("parametres-logs")
		.setDescription("Paramètres des logs.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("modifier-parametres")
				.setDescription("Modifier les paramètres.")
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
			subcommand.setName("afficher-parametres").setDescription("Affiche les paramètres des logs.")
		),
	async execute(interaction, client) {
		const subCommandName = interaction.options.getSubcommand();
		const guildId = interaction.guildId ?? "";

		if (!interaction.inGuild()) return;
		if (!interaction.channel?.permissionsFor(interaction.user)?.has(PermissionsBitField.Flags.ManageChannels))
			return await interaction.reply({
				content: "Erreur: Vous ne disposez pas des autorisations requises!",
				ephemeral: true,
			});

		const configurationsFile = await readConfigurationsFile(guildId);
		const logsObject = configurationsFile[guildId].interaction;

		switch (subCommandName) {
			case "modifier-parametres": {
				const getChannelId = interaction.options.getChannel("salon_id", true).id;
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

				logsObject.channelId = getChannelId;
				Object.entries(logsObject).forEach(([name, value]) => {
					if (name === "channelId") return;
					const oldState: boolean | undefined = value;
					value = interaction.options.getBoolean(name) ?? oldState ?? false;
				});
				/*
				for (const type of ["button", "command", "reaction"]) {
					const state = logsObject[type];
					logsObject[type] = interaction.options.getBoolean(type) ?? state ?? false;
				}*/
				break;
			}
			case "afficher-parametres": {
				const { button, channelId, command, reaction } = logsObject;
				const parameters: string[] = [];
				const getState = function getState(parameter: boolean) {
					return parameter ? "Activé" : "Désactivé";
				};
				if (Object.keys(logsObject).length === 0) {
					parameters.push("```diff\n- Aucun paramètre enregistré!```");
				} else {
					parameters.push(
						`\n• **Salon utilisé** : <#${channelId}>\n• **Log des boutons** : ${getState(
							button
						)}\n• **Log des commandes** : ${getState(command)}\n• **Log des réactions** : ${getState(reaction)}\n`
					);
				}
				return await interaction.reply({
					content: `Ci-dessous la liste des paramètres enregistrés:\n${parameters}`,
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
