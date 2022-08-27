import { ChannelType, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/collection";
import logger from "../utils/logs/logger";
import { readConfigurationsFile, writeConfigurationsFile } from "../utils/readWriteFile";

export const manageChannel: Command = {
	managePermission: true,
	data: new SlashCommandBuilder()
		.setName("gestion-salon")
		.setDescription("Ajouter ou supprimer un salon.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("ajouter-salon")
				.setDescription("Ajouter un salon au Bot.")
				.addChannelOption((option) =>
					option.setName("salon_id").setDescription("ID du salon à rajouter.").setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("supprimer-salon")
				.setDescription("Supprimer un salon du Bot.")
				.addChannelOption((option) =>
					option.setName("salon_id").setDescription("ID du salon à supprimer.").setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("salons-list").setDescription("Afficher la liste complète des salons.")
		),
	async execute(interaction, client) {
		const subCommandName = interaction.options.getSubcommand();
		const channelId = interaction.options.getChannel("salon_id")?.id ?? "";
		const guildId = interaction.guildId ?? "";

		if (!interaction.inGuild()) return;
		if (!interaction.channel?.permissionsFor(interaction.user)?.has(PermissionsBitField.Flags.ManageChannels))
			return await interaction.reply({
				content: "Erreur: Vous ne disposez pas des autorisations requises!",
				ephemeral: true,
			});

		const configurationsFile = await readConfigurationsFile(guildId);
		const channelArray = configurationsFile[guildId].channels;

		switch (subCommandName) {
			case "ajouter-salon": {
				const channel = await client.channels.fetch(channelId);

				if (channel?.type === ChannelType.DM) return;
				if (channel?.type === ChannelType.GroupDM) return;

				if (!channel?.parent) {
					return await interaction.reply({
						content: "Erreur: Ce n'est pas un salon mais une catégorie !",
						ephemeral: true,
					});
				}
				if (channelArray.includes(channelId))
					return await interaction.reply({
						content: "Erreur: Ce salon a déjà été enregistré !",
						ephemeral: true,
					});
				channelArray.push(channelId);
				break;
			}
			case "supprimer-salon": {
				if (!channelArray.includes(channelId))
					return await interaction.reply({
						content: "Erreur: Ce salon n'a jamais été enregistré !",
						ephemeral: true,
					});
				channelArray.splice(channelArray.indexOf(channelId), 1);
				break;
			}
			case "salons-list": {
				const channelsList: string[] = [];
				channelArray.forEach((channelId) => channelsList.push(`<#${channelId}>`));
				if (channelArray.length === 0) channelsList.push("```diff\n- Aucun salon enregistré!```");
				return await interaction.reply({
					content: `Ci-dessous la liste des salons enregistrés:\n${channelsList}`,
					ephemeral: true,
				});
			}
		}

		client.configurations.set(guildId, configurationsFile[guildId]);
		await writeConfigurationsFile(configurationsFile);

		logger.info(
			`Server "${interaction.guild?.name}": Channel "${interaction.guild?.channels.cache.get(channelId)?.name}" ${
				subCommandName === "ajouter-salon" ? "added" : "removed"
			} successfuly.`
		);

		await interaction.reply({
			content: `Le salon <#${channelId}> a bien été ${subCommandName === "ajouter-salon" ? "ajouté" : "supprimé"}.`,
			ephemeral: true,
		});
	},
};
