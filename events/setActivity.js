const { ActivityType } = require("discord.js");

module.exports = {
	name: "ready",
	once: true,
	execute(client) {
		client.user.setPresence({
			status: "online",
			activities: [{ name: "ephec.be", type: ActivityType.Watching }],
		});
		console.log("Activity defined as WATCHING EPHEC.BE.");
	},
};
