const { Colors, EmbedBuilder } = require("discord.js");

// Reply to a received message
module.exports = {
	name: "messageCreate",
	async execute(message, client) {
		try {
			if (!message.webhookId) return;

			const channel = await client.channels.fetch(message.channelId);
			const webhookId = await channel.fetchWebhooks()?.id;

			if (webhookId !== message.author.id) return;

			if (client.authorizedChannels.every((channelId) => channelId !== message.channelId)) return;

			const templateEmbed = new EmbedBuilder()
				.setColor(Colors.DarkGrey)
				.setTitle("Statut de votre commande")
				.addFields([{ name: "Délivré", value: "Nous avons reçu votre demande\n\u200b" }])
				.setTimestamp(new Date())
				.setFooter({ text: "EPHEC - ISAT • FabLAB", iconURL: client.user.avatarURL() });

			const msgActionRow = client.messageAction.get("messageActionButton");

			await message.reply({
				embeds: [templateEmbed],
				components: [msgActionRow],
			});
		} catch (error) {
			console.error("Error during Embed sending!", error);
		}
	},
};
