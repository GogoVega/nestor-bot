const { Collection } = require("discord.js");
const path = require("path");
const fs = require("fs");

// Reading data from files
module.exports = {
	createDataCollections(client) {
		const dataPaths = {
			authorizedChannels: "channels.json",
			logsConfiguration: "logsConfiguration.json",
			reactions: "reactions.json",
		};

		for (const dataPath of Object.keys(dataPaths)) {
			const contentPath = path.join(__dirname, "..", `/data/${dataPaths[dataPath]}`);
			const contentFile = JSON.parse(fs.readFileSync(contentPath, { encoding: "utf-8" }));

			client[dataPath] = new Collection();
			Object.keys(contentFile).forEach((guildId) => client[dataPath].set(guildId, contentFile[guildId]));
		}
	},
};
