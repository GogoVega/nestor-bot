const { Collection } = require("discord.js");
const path = require("path");
const fs = require("fs");

// Reading data from files
function createDataCollections(client) {
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
}

// Reading interactions from files
function createInteractionCollections(client) {
	const foldersName = ["commands", "buttons", "modals"];

	for (const folderName of foldersName) {
		client[folderName] = new Collection();
		const folderPath = path.join(__dirname, "..", folderName);
		const files = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));

		for (const file of files) {
			const filePath = path.join(folderPath, file);
			const content = require(filePath);

			if (folderName === "commands") {
				client[folderName].set(content.data.name, content);
			} else {
				client[folderName].set(content.data.toJSON()?.custom_id, content);
			}
		}
	}
}

module.exports = { createDataCollections, createInteractionCollections };
