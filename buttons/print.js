const { Colors, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
	indice: 1,
	data: new ButtonBuilder().setEmoji("🖨").setStyle(ButtonStyle.Secondary).setCustomId("print"),
	async execute(interaction, lastFieldName) {
		const receivedEmbed = interaction.message.embeds[0];
		const templateEmbed = EmbedBuilder.from(receivedEmbed).setColor(Colors.Yellow).setTimestamp(new Date());

		switch (lastFieldName) {
			case "Délivré":
				return await interaction.reply({
					content: "Erreur: Vous devez d'abord télécharger le fichier !",
					ephemeral: true,
				});
			case "Défaut":
			case "Erreur":
				templateEmbed.addFields([{ name: "Réimpression", value: "Fichier en cours de réimpression...\n\u200b" }]);
				return await interaction.update({ embeds: [templateEmbed] });
			case "Téléchargé":
				templateEmbed.addFields([{ name: "Impression", value: "Fichier en cours d'impression...\n\u200b" }]);
				return await interaction.update({ embeds: [templateEmbed] });
			case "Impression":
			case "Réimpression":
				return await interaction.reply({
					content: "Erreur: La pièce est déjà en cours d'impression !",
					ephemeral: true,
				});
			case "Fini":
				return await interaction.reply({
					content: "Erreur: L'impression est finie !",
					ephemeral: true,
				});
		}
	},
};
