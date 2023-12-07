import { Colors, EmbedBuilder } from "discord.js";
import { MessageCreateEvent } from "../types/collection";
import logger from "../utils/logs/logger";

// Reply to a received message
export const messageCreate: MessageCreateEvent = {
	name: "messageCreate",
	async execute(message, client) {
		try {
			if (!message.webhookId) return;

			if (message.channel.isDMBased() || message.channel.isThread() || !message.inGuild()) return;

			if (!client.configurations.get(message.guildId)?.webhooks?.some((id) => id === message.webhookId)) return;

			const templateEmbed = new EmbedBuilder()
				.setColor(Colors.DarkGrey)
				.setTitle("Statut de votre commande")
				.addFields([{ name: "Délivré", value: "Nous avons reçu votre demande\n\u200b" }])
				.setTimestamp(new Date())
				.setFooter({
					text: `${message.guild?.members.me?.displayName} • FabLAB`,
					iconURL: client.user?.displayAvatarURL(),
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
