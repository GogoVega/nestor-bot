const { PermissionsBitField } = require("discord.js");
const logger = require("../utils/logger");

// Button interaction
module.exports = {
	name: "interactionCreate",
	async execute(interaction, client) {
		if (!interaction.isButton()) return;

		if (!interaction.channel.permissionsFor(interaction.user).has(PermissionsBitField.Flags.UseApplicationCommands))
			return await interaction.reply({
				content: "Vous ne disposez pas des autorisations requises!",
				ephemeral: true,
			});

		const button = client.buttons.get(interaction.customId);

		if (!button) return;

		// Get last status by removing statuses linked to slash commands
		const NotAllowed = ["Description", "Temps d'impression", "Temps restant d'impression"];
		const fields = interaction.message.embeds[0].fields;
		const fieldsFiltered = fields.filter((field) => !NotAllowed.includes(field.name));
		const lastFieldName = fieldsFiltered.pop().name;

		try {
			await button.execute(interaction, lastFieldName);
		} catch (error) {
			logger.error("Error during button interaction created!", error);
			await interaction.reply({
				content: "Une erreur s'est produite lors de l'exécution de ce bouton !",
				ephemeral: true,
			});
		}
	},
};
