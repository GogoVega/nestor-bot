import { ActivityType } from "discord.js";
import { ClientEvent } from "../types/collection";
import logger from "../utils/logs/logger";

export const setActivity: ClientEvent = {
	name: "ready",
	once: true,
	execute(client) {
		client.user?.setPresence({
			status: "online",
			activities: [{ name: "ephec.be", type: ActivityType.Watching }],
		});
		logger.info("Activity defined as WATCHING EPHEC.BE.");
	},
};
