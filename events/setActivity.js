const { ActivityType } = require("discord.js");
const logger = require("../utils/logger");

module.exports = {
	name: "ready",
	once: true,
	execute(client) {
		client.user.setPresence({
			status: "online",
			activities: [{ name: "ephec.be", type: ActivityType.Watching }],
		});
		logger.info("Activity defined as WATCHING EPHEC.BE.");
	},
};
