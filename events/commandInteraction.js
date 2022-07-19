const { InteractionType, PermissionsBitField } = require("discord.js");
const path = require("path");
const fs = require("fs");

// Command interaction
module.exports = {
	name: "interactionCreate",
	async execute(interaction, client) {
		if (interaction.type !== InteractionType.ApplicationCommand) return;

		if (!interaction.channel.permissionsFor(client.user).has(PermissionsBitField.Flags.UseApplicationCommands))
			return await interaction.reply({
				content: "Vous ne disposez pas des autorisations requises!",
				ephemeral: true,
			});

		// Bypass channel check for command with "managePermission"
		const managePermission = client.commands.get(interaction.commandName).managePermission;

		if (!managePermission) {
			const channelsPath = path.join(__dirname, "../data/channels.json");
			const channelsFile = JSON.parse(fs.readFileSync(channelsPath, { encoding: "utf-8" }));

			if (channelsFile.every((channelId) => channelId !== interaction.channelId))
				return await interaction.reply({
					content: "Le Bot n'a pas accès à ce salon!",
					ephemeral: true,
				});
		}

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction, client);
		} catch (error) {
			console.error("Error during command interaction created!", error);
			await interaction.reply({
				content: "Une erreur s'est produite lors de l'exécution de cette commande !",
				ephemeral: true,
			});
		}
	},
};
