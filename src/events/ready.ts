import { ClientEvent } from "../types/collection";
import logger from "../utils/logs/logger";

export const ready: ClientEvent = {
	name: "ready",
	once: true,
	execute(client) {
		logger.info(`Ready! Logged in as ${client.user?.tag}.`);
	},
};
