const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Replies with all available commands and their usage.'),
	async execute(interaction) {
		await interaction.reply("*Available Commands*\n`site-fablab` - Show you the links of the site.\n`command-fablab` - Allows you to add a description, expected printing time, time taken for printing and an image of the finished part.");
	},
};