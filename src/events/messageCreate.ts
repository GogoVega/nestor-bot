import { Colors, EmbedBuilder } from "discord.js";
import { MessageCreateEvent } from "../types/collection";
import logger from "../utils/logs/logger";

// Reply to a received message
export const messageCreate: MessageCreateEvent = {
	name: "messageCreate",
	async execute(message, client) {
		try {
			if (!message.webhookId) return;

			if (message.channel.isDMBased() || message.channel.isThread()) return;

			const webhooks = await message.channel.fetchWebhooks();

			if (webhooks.every((webhook) => webhook.id !== message.author.id)) return;

			if (!client.configurations.get(message.guildId ?? "")?.channels?.some((id) => id === message.channelId)) return;

			const templateEmbed = new EmbedBuilder()
				.setColor(Colors.DarkGrey)
				.setTitle("Statut de votre commande")
				.addFields([{ name: "Délivré", value: "Nous avons reçu votre demande\n\u200b" }])
				.setTimestamp(new Date())
				.setFooter({
					text: `${message.guild?.members.me?.nickname} • FabLAB`,
					iconURL: client.user?.avatarURL() ?? "",
				});

			const msgActionRow = client.messageAction.get("messageActionButton");

			if (!msgActionRow) return;

			await message.reply({
				embeds: [templateEmbed],
				components: [msgActionRow],
			});
		} catch (error) {
			logger.error("Error during Embed sending!", error);
		}
	},
};
