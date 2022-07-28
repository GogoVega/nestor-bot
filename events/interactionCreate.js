const { InteractionType } = require("discord.js");
const { sendLog } = require("../utils/sendLog.js");

module.exports = {
	name: "interactionCreate",
	async execute(interaction, client) {
		await sendLog({}, interaction, client);
		console.log(
			`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction named "${
				interaction.type === InteractionType.ApplicationCommand ? interaction.commandName : interaction.customId
			}".`
		);
	},
};
