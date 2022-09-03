import { Colors, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Button } from "../types/collection";

export const downloadButton: Button = {
	indice: 0,
	data: new ButtonBuilder().setEmoji("🔽").setStyle(ButtonStyle.Primary).setCustomId("download"),
	async execute(interaction, lastFieldName) {
		const receivedEmbed = interaction.message.embeds[0];
		const templateEmbed = EmbedBuilder.from(receivedEmbed)
			.setColor(Colors.Blue)
			.setTimestamp(new Date())
			.addFields([{ name: "Téléchargé", value: `Fichier téléchargé par : <@${interaction.user.id}>\n\u200b` }]);

		switch (lastFieldName) {
			case "Défaut":
			case "Erreur":
				return await interaction.reply({
					content: "Erreur: Une erreur a été signalée !",
					ephemeral: true,
				});
			case "Fini":
				return await interaction.reply({
					content: "Erreur: L'impression est finie !",
					ephemeral: true,
				});
			case "Délivré":
				return await interaction.update({ embeds: [templateEmbed] });
			case "Impression":
			case "Réimpression":
				return await interaction.reply({
					content: "Erreur: Fichier en cours d'impression !",
					ephemeral: true,
				});
			case "Téléchargé":
				return await interaction.reply({
					content: "Erreur: Fichier déjà téléchargé !",
					ephemeral: true,
				});
		}
	},
};
