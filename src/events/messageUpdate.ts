import { Colors, EmbedBuilder } from "discord.js";
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
				.setTitle("Un message vient d'être édité !")
				.setDescription(
					`• **Autheur du message** : <@${id}>\n• **Message édité dans le salon** : <#${
						newMessage.channelId
					}>\n• **Ancien Message** :\n\n${generateQuotedMessage(
						oldMessage.content
					)}\n\n• **Nouveau Message** :\n\n${generateQuotedMessage(newMessage.content)} `
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
