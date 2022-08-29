import { Colors, EmbedBuilder } from "discord.js";
import { MessageUpdateEvent } from "../types/collection";
import logger from "../utils/logs/logger";
import { checkContentMessage, sendMessage } from "../utils/sendMessage";

export const messageUpdate: MessageUpdateEvent = {
	name: "messageUpdate",
	async execute(oldMessage, newMessage, client) {
		try {
			if (oldMessage.partial || oldMessage.author.bot) return;

			const guildId = newMessage.guildId ?? "";
			const messageObject = client.configurations.get(guildId)?.message;

			if (!messageObject?.update || !newMessage.author) return;
			if (!messageObject.channelsId.includes(newMessage.channelId)) return;

			const { defaultAvatarURL, id, tag } = newMessage.author;
			const templateEmbed = new EmbedBuilder()
				.setTitle("Un message vient d'être édité !")
				.setDescription(
					`• **Autheur du message**: <@${id}>\n• **Message édité dans le salon**: <#${
						newMessage.channelId
					}>\n• **Ancien Message**:\n\n> ${checkContentMessage(
						oldMessage.content
					)}\n\n• **Nouveau Message**:\n\n> ${checkContentMessage(newMessage.content)} `
				)
				.setColor(Colors.Yellow)
				.setTimestamp(new Date())
				.setFooter({ text: tag, iconURL: newMessage.author.avatarURL() ?? defaultAvatarURL });

			await sendMessage(messageObject.channelId, templateEmbed, client);
		} catch (error) {
			console.error(error);
			logger.error("An error occurred while editing a message:", error);
		}
	},
};
