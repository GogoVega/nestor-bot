const logger = require("../utils/logger.js");

module.exports = {
	name: "guildCreate",
	execute(guild) {
		logger.info(`Server "${guild.name}" registered successfully`);
	},
};
