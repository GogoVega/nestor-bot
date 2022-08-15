const logger = require("../utils/logger.js");
const { sendLog } = require("../utils/sendLog.js");

module.exports = {
	name: "interactionCreate",
	async execute(interaction, client) {
		const subCommandName = interaction.options?.getSubcommand(false);

		await sendLog({}, interaction, client);
		logger.debug(
			`Server "${interaction.guild.name}": ${interaction.user.tag} in #${
				interaction.channel.name
			} triggered an interaction named "${
				interaction.isCommand()
					? interaction.commandName.concat(subCommandName ? " ".concat(subCommandName) : "")
					: interaction.customId
			}".`
		);
	},
};
