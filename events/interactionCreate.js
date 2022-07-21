const { InteractionType } = require("discord.js");

module.exports = {
	name: "interactionCreate",
	execute(interaction) {
		console.log(
			`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction named "${
				interaction.type === InteractionType.ApplicationCommand ? interaction.commandName : interaction.customId
			}".`
		);
	},
};
