import { GuildEvent } from "../types/collection";
import logger from "../utils/logs/logger";

export const guildCreate: GuildEvent = {
	name: "guildCreate",
	async execute(guild) {
		logger.info(`Server "${guild.name}" registered successfully`);
	},
};
