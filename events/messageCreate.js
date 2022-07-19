// Reply to a received message
module.exports = {
	name: "messageCreate",
	async execute(message, client) {
		message.guild
			.fetchWebhooks()
			.then(async (webhooks) => {
				if (!webhooks) return;

				if (webhooks.every((webhook) => webhook.id !== message.author.id)) return;

				const templateEmbed = {
					color: 0x1b1b1b,
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

				await message.reply({
					embeds: [templateEmbed],
					components: [msgActionRow],
				});
			})
			.catch((error) => console.error("Error during Embed sending!", error));
	},
};
