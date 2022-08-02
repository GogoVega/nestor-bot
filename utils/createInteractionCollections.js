const { Collection } = require("discord.js");
const path = require("path");
const fs = require("fs");

module.exports = {
	createInteractionCollections(client) {
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
	},
};
