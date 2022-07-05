const { MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
  indice: 3,
	data: new MessageButton()
    .setEmoji('⚠')
    .setStyle('DANGER')
    .setCustomId('default'),
	async execute(interaction, lastFieldName) {
    const receivedEmbed = interaction.message.embeds[0];
    const templateEmbed = new MessageEmbed(receivedEmbed);

		switch (lastFieldName) {
      case "Défaut":
        return await interaction.reply({ content: "Erreur: Un défaut a déjà été signalé !", ephemeral: true });
      case "Erreur":
        return await interaction.reply({ content: "Erreur: Une erreur a été signalée !", ephemeral: true });
      case "Fini":
        return await interaction.reply({ content: "Erreur: La pièce a été correctement imprimée !", ephemeral: true });
      case "Délivré":
      case "Téléchargé":
        return await interaction.reply({ content: "Erreur: Vous devez d'abord imprimer la pièce(s) !", ephemeral: true });
      case "Impression":
      case "Réimpression":
        templateEmbed.setColor("ORANGE");
        templateEmbed.addField("Défaut", "Un défaut technique est survenu! Cela peut-être un plateau gras, une coupure de courant, buse bouchée, ...\n\u200b");
        return await interaction.update({ embeds: [templateEmbed] });
    }
	},
};