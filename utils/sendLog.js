const { Colors, EmbedBuilder } = require("discord.js");

// Send logs message
module.exports = {
	async sendLog({ emoji = "", guildId = "", roleId = "", isAdded = false, reactionUser = null }, interaction, client) {
		const logParameters = client.logsConfiguration.get(interaction?.guildId ?? guildId);

		if (!logParameters) return;

		const user = interaction?.user ?? reactionUser;
		const templateEmbed = new EmbedBuilder()
			.setTimestamp(new Date())
			.setFooter({ text: user.tag, iconURL: user.avatarURL() });

		if (reactionUser) {
			if (!logParameters.reaction) return;

			templateEmbed
				.setTitle(`Un rôle vient d'être ${isAdded ? "attribué" : "retiré"} !`)
				.setDescription(
					`<@${user.id}> vient de réagir avec l'émoji ${emoji} pour ${
						isAdded ? "obtenir" : "quitter"
					} le rôle <@&${roleId}>.\n`
				)
				.setColor(isAdded ? Colors.Orange : Colors.Purple);
		} else if (interaction) {
			if (!interaction.isCommand() && !interaction.isButton()) return;
			if (!logParameters[interaction.isCommand() ? "command" : "button"]) return;

			const isCommand = interaction.isCommand();
			const interactionName = interaction.commandName ?? interaction.customId;
			const subCommandName = interaction.options?.getSubcommand(false);

			templateEmbed
				.setTitle(isCommand ? "Une commande vient d'être utilisée !" : "Un bouton vient d'être appuyé !")
				.setDescription(
					`• **Type d'interaction** : ${
						isCommand ? "Commande" : "Bouton"
					}\n• **Nom de l'intéraction** : \`${interactionName}${
						subCommandName ? " ".concat(subCommandName) : ""
					}\`\n• **Utilisateur concerné** : <@${user.id}>\n• **Salon utilisé** : <#${interaction.channel.id}>\n`
				)
				.setColor(isCommand ? Colors.Yellow : Colors.Blue);
		}

		const channel = await client.channels.fetch(logParameters.channelId);
		await channel.send({ embeds: [templateEmbed] });
	},
};
