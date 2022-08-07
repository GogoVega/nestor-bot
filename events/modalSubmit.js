// Modal Submission for commands
module.exports = {
	name: "interactionCreate",
	async execute(interaction, client) {
		if (!interaction.isModalSubmit()) return;

		const modal = client.modals.get(interaction.customId);

		if (!modal) return;

		try {
			await modal.execute(interaction, client);
		} catch (error) {
			console.error("Error during Modal Submission!", error);
			await interaction.reply({
				content: ":x: | ID du message incorrect ou élément manquant!\nVeuillez réessayer SVP.",
				ephemeral: true,
			});
		}
	},
};
