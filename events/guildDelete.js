const logger = require("../utils/logger.js");
const { readFile, writeFile } = require("../utils/readWriteFile.js");

// Delete Guild Data from Files
module.exports = {
	name: "guildDelete",
	async execute(guild, client) {
		const dataPaths = {
			reactions: "reactions.json",
			authorizedChannels: "channels.json",
			logsConfiguration: "logsConfiguration.json",
		};

		try {
			for (const dataPath of Object.keys(dataPaths)) {
				const contentPath = `../data/${dataPaths[dataPath]}`;
				const contentFile = await readFile(contentPath);

				client[dataPath].delete(guild.id);
				delete contentFile[guild.id];

				await writeFile(contentPath, contentFile);
			}

			logger.info(`Server "${guild.name}": Successfully deleted guild data!`);
		} catch (error) {
			logger.error("Error when deleting guild data!", error);
		}
	},
};
