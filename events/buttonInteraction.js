const { rolesId } = require("../config.json");

// Button interaction
module.exports = {
	name: "interactionCreate",
	async execute(interaction, client) {
		if (!interaction.isButton()) return;

		if (!rolesId.some((roleId) => interaction.member.roles.cache.has(roleId)))
			return await interaction.reply({ content: "Vous ne disposez pas des autorisations requises!", ephemeral: true });

		const button = client.buttons.get(interaction.customId);

		if (!button) return;

		// Slash commands
		const NotAllowed = ["Description", "Temps d'impression", "Temps restant d'impression"];
		const fields = interaction.message.embeds[0].fields;
		const fieldsFiltered = fields.filter((field) => !NotAllowed.includes(field.name));
		const lastFieldName = fieldsFiltered.pop().name;

		try { await button.execute(interaction, lastFieldName) }
		catch (error) {
			console.error(error);
			await interaction.reply({ content: "There was an error while executing this button!", ephemeral: true });
		}
	},
};