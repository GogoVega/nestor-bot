import { AuditLogEvent, Colors, EmbedBuilder } from "discord.js";
import i18next from "i18next";
import { MessageDeleteEvent, ReactionsFile } from "../types/collection";
import { generateQuotedMessage, sendMessage } from "../utils/channel";
import logger from "../utils/logs/logger";
import { readFile, writeFile } from "../utils/readWriteFile";

// Remove reactions from data file associated with deleted message.
export const messageDelete: MessageDeleteEvent = {
	name: "messageDelete",
	async execute(message, client) {
		try {
			const guildId = message.guildId ?? "";
			try {
				const reactionsRaw = client.reactions.get(guildId);

				if (!reactionsRaw) return;

				const reactionsMessage = reactionsRaw[message.id];

				if (!reactionsMessage) return;

				const reactionsPath = "../../data/reactions.json";
				const reactionsFile = (await readFile(reactionsPath)) as ReactionsFile;

				delete reactionsFile[guildId][message.id];
				client.reactions.set(guildId, reactionsFile[guildId]);

				await writeFile(reactionsPath, reactionsFile);

				logger.info(`Reactions associated with message "${message.id}" has been deleted successfully.`);
			} catch (error) {
				logger.error("Error while deleting reactions associated with the message:", error);
			} finally {
				if (message.author?.bot || !message.guild) return;

				const messageObject = client.configurations.get(guildId)?.message;

				if (!messageObject?.delete || !message.author) return;
				if (!messageObject.channelsId.includes(message.channelId)) return;

				const executorId = await message.guild
					?.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 })
					.then((log) => {
						const entry = log.entries.first();

						if (entry && entry.target.id === message.author?.id && entry.createdTimestamp > Date.now() - 5000)
							return entry.executor?.id;

						return message.author?.id;
					});

				const { id, tag } = message.author;
				const templateEmbed = new EmbedBuilder()
					.setTitle(i18next.t("event.message.delete.title", { lng: message.guild.preferredLocale }))
					.setDescription(
						i18next.t("event.message.delete.description", {
							lng: message.guild.preferredLocale,
							authorId: id,
							executorId: executorId,
							channelId: message.channelId,
							content: generateQuotedMessage(message.content),
						})
					)
					.setColor(Colors.Red)
					.setTimestamp(new Date())
					.setFooter({ text: tag, iconURL: message.author.displayAvatarURL() });

				await sendMessage(messageObject.channelId, { embeds: [templateEmbed] }, client);
			}
		} catch (error) {
			logger.error("An error occurred while deleting a message:", error);
		}
	},
};
