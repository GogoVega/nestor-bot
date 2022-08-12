const { sendLog } = require("../utils/sendLog.js");

module.exports = {
	name: "interactionCreate",
	async execute(interaction, client) {
		await sendLog({}, interaction, client);
		console.log(
			`Server "${interaction.guild.name}": ${interaction.user.tag} in #${
				interaction.channel.name
			} triggered an interaction named "${
				interaction.isCommand()
					? interaction.commandName.concat(" ", interaction.options.getSubcommand() || "")
					: interaction.customId
			}".`
		);
	},
};
