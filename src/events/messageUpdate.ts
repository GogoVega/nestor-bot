import { Colors, EmbedBuilder } from "discord.js";
import i18next from "i18next";
import { MessageUpdateEvent } from "../types/collection";
import { generateQuotedMessage, sendMessage } from "../utils/channel";
import logger from "../utils/logs/logger";

export const messageUpdate: MessageUpdateEvent = {
	name: "messageUpdate",
	async execute(oldMessage, newMessage, client) {
		try {
			if (oldMessage.partial || oldMessage.author.bot) return;
			if (oldMessage.embeds.length !== newMessage.embeds.length) return;

			const guildId = newMessage.guildId ?? "";
			const messageObject = client.configurations.get(guildId)?.message;

			if (!messageObject?.update || !newMessage.author) return;
			if (!messageObject.channelsId.includes(newMessage.channelId)) return;

			const { id, tag } = newMessage.author;
			const templateEmbed = new EmbedBuilder()
				.setTitle(i18next.t("event.message.update.title", { lng: newMessage.guild?.preferredLocale }))
				.setDescription(
					i18next.t("event.message.update.description", {
						lng: newMessage.guild?.preferredLocale,
						authorId: id,
						channelId: newMessage.channelId,
						oldContent: generateQuotedMessage(oldMessage.content),
						newContent: generateQuotedMessage(newMessage.content),
					})
				)
				.setColor(Colors.Yellow)
				.setTimestamp(new Date())
				.setFooter({ text: tag, iconURL: newMessage.author.displayAvatarURL() });

			await sendMessage(messageObject.channelId, { embeds: [templateEmbed] }, client);
		} catch (error) {
			logger.error("An error occurred while editing a message:", error);
		}
	},
};
