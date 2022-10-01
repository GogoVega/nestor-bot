import i18next from "i18next";
import { Command, InteractionEvent } from "../types/collection";
import { isCategory } from "../utils/channel";
import logger from "../utils/logs/logger";

// Command interaction
export const commandInteraction: InteractionEvent = {
	name: "interactionCreate",
	async execute(interaction, client) {
		if (!interaction.isChatInputCommand() || !interaction.inGuild()) return;

		const command = client.commands.get(interaction.commandName) as Command | undefined;

		if (!command) return;

		if (command.basePermission) {
			if (!interaction.channel?.permissionsFor(interaction.user)?.has(command.basePermission))
				return await interaction.reply({
					content: i18next.t("common.error.authorizationRequired", { lng: interaction.locale }),
					ephemeral: true,
				});
		}

		const channelId = interaction.options.getChannel("channel_id", false)?.id;

		if (channelId) {
			const channel = await client.channels.fetch(channelId);

			if (isCategory(channel)) {
				return await interaction.reply({
					content: i18next.t("command.error.channelCategory", { lng: interaction.locale }),
					ephemeral: true,
				});
			}
		}

		try {
			await command.execute(interaction, client);
		} catch (error) {
			logger.error("Error during command interaction created!", error);
			await interaction.reply({
				content: i18next.t("command.error.failed", { lng: interaction.locale }),
				ephemeral: true,
			});
		}
	},
};
