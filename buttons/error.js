const { Colors, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
	indice: 4,
	data: new ButtonBuilder().setEmoji("✖").setStyle(ButtonStyle.Danger).setCustomId("error"),
	async execute(interaction, lastFieldName) {
		const receivedEmbed = interaction.message.embeds[0];
		const templateEmbed = EmbedBuilder.from(receivedEmbed);

		templateEmbed.setColor(Colors.Red);

		switch (lastFieldName) {
			case "Délivré":
				templateEmbed.addFields([
					{
						name: "Erreur",
						value: "Problème de formulaire !\nNous prenons contact avec la personne concernée.\n\u200b",
					},
				]);
				return await interaction.update({ embeds: [templateEmbed] });
			case "Défaut":
			case "Impression":
			case "Réimpression":
				templateEmbed.addFields([
					{
						name: "Erreur",
						value: "Un problème est survenu !\nNous prenons contact avec la personne concernée.\n\u200b",
					},
				]);
				return await interaction.update({ embeds: [templateEmbed] });
			case "Erreur":
				return await interaction.reply({
					content: "Erreur: Une erreur a déjà été signalée !",
					ephemeral: true,
				});
			case "Téléchargé":
				templateEmbed.addFields([
					{
						name: "Erreur",
						value: "Problème de conception !\nNous prenons contact avec la personne concernée.\n\u200b",
					},
				]);
				return await interaction.update({ embeds: [templateEmbed] });
			case "Fini":
				return await interaction.reply({
					content: "Erreur: L'impression est déjà finie !",
					ephemeral: true,
				});
		}
	},
};
