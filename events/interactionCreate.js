module.exports = {
	name: "interactionCreate",
	execute(interaction) {
		console.log(
			`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction named "${
				interaction.isCommand() ? interaction.commandName : interaction.customId
			}".`
		);
	},
};
