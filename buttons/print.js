const { MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
  indice: 1,
	data: new MessageButton()
    .setEmoji('🖨')
    .setStyle('SECONDARY')
    .setCustomId('print'),
	async execute(interaction, lastFieldName) {
    const receivedEmbed = interaction.message.embeds[0];
    const templateEmbed = new MessageEmbed(receivedEmbed);

    templateEmbed.setColor("YELLOW");

		switch (lastFieldName) {
      case "Délivré":
        return await interaction.reply({ content: "Erreur: Vous devez d'abord télécharger le fichier !", ephemeral: true });
      case "Défaut":
      case "Erreur":
        templateEmbed.addField("Réimpression", "Fichier en cours de réimpression...\n\u200b");
        return await interaction.update({ embeds: [templateEmbed] });
      case "Téléchargé":
        templateEmbed.addField("Impression", "Fichier en cours d'impression...\n\u200b");
        return await interaction.update({ embeds: [templateEmbed] });
      case "Impression":
      case "Réimpression":
        return await interaction.reply({ content: "Erreur: La pièce est déjà en cours d'impression !", ephemeral: true });
      case "Fini":
        return await interaction.reply({ content: "Erreur: L'impression est finie !", ephemeral: true });
    }
	},
};