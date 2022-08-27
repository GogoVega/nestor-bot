import { PermissionsBitField } from "discord.js";
import { InteractionEvent } from "../types/collection";
import logger from "../utils/logs/logger";

// Command interaction
export const commandInteraction: InteractionEvent = {
	name: "interactionCreate",
	async execute(interaction, client) {
		if (!interaction.isChatInputCommand() || !interaction.inGuild()) return;

		if (!interaction.channel?.permissionsFor(interaction.user)?.has(PermissionsBitField.Flags.UseApplicationCommands))
			return await interaction.reply({
				content: "Vous ne disposez pas des autorisations requises!",
				ephemeral: true,
			});

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		// Bypass channel check for command with "managePermission"
		const managePermission = command?.managePermission;

		if (!managePermission) {
			if (!client.configurations.get(interaction.guildId)?.channels?.some((id) => id === interaction.channelId))
				return await interaction.reply({
					content: "Le Bot n'a pas accès à ce salon!",
					ephemeral: true,
				});
		}

		try {
			await command.execute(interaction, client);
		} catch (error) {
			logger.error("Error during command interaction created!", error);
			await interaction.reply({
				content: "Une erreur s'est produite lors de l'exécution de cette commande !",
				ephemeral: true,
			});
		}
	},
};
