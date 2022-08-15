const { readFile, writeFile } = require("../utils/readWriteFile.js");

// Remove reactions from data file associated with deleted message.
module.exports = {
	name: "messageDelete",
	async execute(message, client) {
		try {
			const reactionsRaw = client.reactions.get(message.guildId);

			if (!reactionsRaw) return;

			const reactionsMessage = reactionsRaw[message.id];

			if (!reactionsMessage) return;

			const reactionsPath = "../data/reactions.json";
			const reactionsFile = await readFile(reactionsPath);

			delete reactionsFile[message.guildId][message.id];
			client.reactions.set(message.guildId, reactionsFile);

			await writeFile(reactionsPath, reactionsFile);

			console.log(`Reactions associated with message "${message.id}" has been deleted successfully.`);
		} catch (error) {
			console.error("Error while deleting reactions associated with the message:", error);
		}
	},
};
