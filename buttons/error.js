const { MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
	indice: 4,
	data: new MessageButton().setEmoji("✖").setStyle("DANGER").setCustomId("error"),
	async execute(interaction, lastFieldName) {
		const receivedEmbed = interaction.message.embeds[0];
		const templateEmbed = new MessageEmbed(receivedEmbed);

		templateEmbed.setColor("RED");

		switch (lastFieldName) {
			case "Délivré":
				templateEmbed.addField(
					"Erreur",
					"Problème de formulaire !\nNous prenons contact avec la personne concernée.\n\u200b"
				);
				return await interaction.update({ embeds: [templateEmbed] });
			case "Défaut":
			case "Impression":
			case "Réimpression":
				templateEmbed.addField(
					"Erreur",
					"Un problème est survenu !\nNous prenons contact avec la personne concernée.\n\u200b"
				);
				return await interaction.update({ embeds: [templateEmbed] });
			case "Erreur":
				return await interaction.reply({
					content: "Erreur: Une erreur a déjà été signalée !",
					ephemeral: true,
				});
			case "Téléchargé":
				templateEmbed.addField(
					"Erreur",
					"Problème de conception !\nNous prenons contact avec la personne concernée.\n\u200b"
				);
				return await interaction.update({ embeds: [templateEmbed] });
			case "Fini":
				return await interaction.reply({
					content: "Erreur: L'impression est déjà finie !",
					ephemeral: true,
				});
		}
	},
};
