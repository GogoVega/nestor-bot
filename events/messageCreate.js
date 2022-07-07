const { webhookId } = require("../config.json");

// Reply to a received message
module.exports = {
	name: "messageCreate",
	async execute(message, client) {
		//message.webhookId
		if (message.author.id !== webhookId || message.author.bot)
			return;

		const templateEmbed = {
			color: 0x1B1B1B,
			title: "Statut",
			fields: [
				{
					name: "Délivré",
					value: "Nous avons reçu votre demande\n\u200b",
				},
			],
			timestamp: new Date(),
			footer: {
				text: "EPHEC - ISAT • FabLAB",
				icon_url: client.user.avatarURL(),
			},
		};

		const msgActionRow = client.messageAction.get("messageActionButton");

		try { await message.reply({ embeds: [templateEmbed], components: [msgActionRow] }) }
		catch (error) { console.error(error) }
	},
};