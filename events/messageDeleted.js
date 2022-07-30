const path = require("path");
const fs = require("fs");

// Remove reactions from data file associated with deleted message.
module.exports = {
	name: "messageDelete",
	async execute(message, client) {
		try {
			const reactionsRaw = client.reactions.get(message.guildId);

			if (!reactionsRaw) return;

			const reactionsMessage = reactionsRaw[message.id];

			if (!reactionsMessage) return;

			const reactionsPath = path.join(__dirname, "../data/reactions.json");
			const reactionsFile = JSON.parse(fs.readFileSync(reactionsPath, { encoding: "utf-8" }));

			delete reactionsFile[message.guildId][message.id];
			client.reactions.set(message.guildId, reactionsFile);

			fs.writeFile(reactionsPath, JSON.stringify(reactionsFile), { encoding: "utf-8", flag: "w" }, (error) => {
				if (error) {
					if (error.code != "EEXIST") throw error;
				} else {
					console.log(`Reactions associated with message "${message.id}" has been deleted successfully.`);
				}
			});
		} catch (error) {
			console.error("Error while deleting reactions associated with the message:", error);
		}
	},
};
