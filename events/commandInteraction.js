const { Permissions } = require("discord.js");
const { channelsId } = require("../config.json");

// Command interaction
module.exports = {
	name: "interactionCreate",
	async execute(interaction, client) {
		if (!interaction.isCommand()) return;

		if (!interaction.channel.permissionsFor(client.user).has(Permissions.FLAGS.USE_APPLICATION_COMMANDS))
			return await interaction.reply({ content: "Vous ne disposez pas des autorisations requises!", ephemeral: true });

		if (![interaction.channel.id].some((channelId) => channelsId.includes(channelId)))
			return await interaction.reply({ content: "Le Bot n'a pas accès à ce salon!", ephemeral: true });

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try { await command.execute(interaction, client) }
		catch (error) {
			console.error(error);
			await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
		}
	},
};