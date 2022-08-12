const { Colors, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
	indice: 2,
	data: new ButtonBuilder().setEmoji("✔").setStyle(ButtonStyle.Success).setCustomId("finish"),
	async execute(interaction, lastFieldName) {
		const receivedEmbed = interaction.message.embeds[0];
		const templateEmbed = EmbedBuilder.from(receivedEmbed)
			.setColor(Colors.Green)
			.setTimestamp(new Date())
			.addFields([
				{
					name: "Fini",
					value:
						"Pièce finie d'être imprimée !\nVenez la prendre au FabLab !\n[Horaire de présence des étudiants en stage](https://nestor-pages.herokuapp.com/cnc.html)\n\u200b",
				},
			]);

		switch (lastFieldName) {
			case "Fini":
				return await interaction.reply({
					content: "Erreur: L'impression est déjà finie !",
					ephemeral: true,
				});
			case "Défaut":
			case "Erreur":
			case "Téléchargé":
				return await interaction.reply({
					content: "Erreur: Vous devez d'abord imprimer la pièce !",
					ephemeral: true,
				});
			case "Délivré":
				return await interaction.reply({
					content: "Erreur: Vous devez d'abord télécharger le fichier !",
					ephemeral: true,
				});
			case "Impression":
			case "Réimpression":
				return await interaction.update({ embeds: [templateEmbed] });
		}
	},
};
