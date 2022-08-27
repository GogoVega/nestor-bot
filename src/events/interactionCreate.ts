import { InteractionEvent } from "../types/collection";
import logger from "../utils/logs/logger";
import { sendLog } from "../utils/logs/sendLog";

export const interactionCreate: InteractionEvent = {
	name: "interactionCreate",
	async execute(interaction, client) {
		const interactionName: string[] = [];

		if (!interaction.isButton() && !interaction.isCommand() && !interaction.isModalSubmit()) return;

		if (interaction.isChatInputCommand()) {
			const subCommandName = interaction.options?.getSubcommand(false);
			interactionName.push(`${interaction.commandName.concat(subCommandName ? " ".concat(subCommandName) : "")}`);
		} else if (interaction.isButton()) {
			interactionName.push(interaction.customId);
		}

		if (!interaction.inGuild()) return;

		await sendLog(null, interaction, client);

		logger.debug(
			`Server "${interaction.guild?.name}": ${interaction.user.tag} in #${
				interaction.channel?.name
			} triggered an interaction named "${[interactionName]}".`
		);
	},
};
