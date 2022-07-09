const { Permissions } = require("discord.js");
const path = require("path");
const fs = require("fs");

// Command interaction
module.exports = {
	name: "interactionCreate",
	async execute(interaction, client) {
		if (!interaction.isCommand()) return;

		if (!interaction.channel.permissionsFor(client.user).has(Permissions.FLAGS.USE_APPLICATION_COMMANDS))
			return await interaction.reply({ content: "Vous ne disposez pas des autorisations requises!", ephemeral: true });

		// Bypass channel check for command with "managePermission"
		const managePermission = client.commands.get(interaction.commandName).managePermission;

		if (!managePermission) {
			const channelsIdPath = path.join(__dirname, "../data/channelsId.json");
			const channelsIdFiles = JSON.parse(fs.readFileSync(channelsIdPath, { encoding: "utf-8" }));

			if (channelsIdFiles.channelsId.every((channelId) => channelId !== interaction.channelId))
				return await interaction.reply({ content: "Le Bot n'a pas accès à ce salon!", ephemeral: true });
		}

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try { await command.execute(interaction, client) }
		catch (error) {
			console.error(`Error during command interaction created!\n${error}`);
			await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
		}
	},
};