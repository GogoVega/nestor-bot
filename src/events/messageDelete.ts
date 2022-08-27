import { MessageDeleteEvent, ReactionsFile } from "../types/collection";
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
			}
		} catch (error) {
			logger.error("An error occurred while deleting a message:", error);
		}
	},
};
